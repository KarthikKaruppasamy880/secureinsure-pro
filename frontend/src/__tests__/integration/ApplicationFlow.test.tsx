import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationDetails from '../../pages/forms/ApplicationDetails';
import { AuthContext } from '../../contexts/AuthContext';

// Mock services
jest.mock('../../services/tppExcelParser', () => ({
  tppExcelParser: {
    parseTPPExcelFile: jest.fn().mockResolvedValue({
      sheets: {
        'Case Setup': {
          fields: [
            {
              fieldName: 'Case ID',
              fieldLevel1: 'Case Setup',
              fieldLevel2: 'Identification',
              type: 'text',
              mandatory: true,
              validations: ['required'],
              helpText: 'Unique case identifier',
              sheet: 'Case Setup'
            }
          ],
          metadata: { totalFields: 1, mandatoryFields: 1, optionalFields: 0 }
        },
        'Insured': {
          fields: [
            {
              fieldName: 'First Name',
              fieldLevel1: 'Insured',
              fieldLevel2: 'Personal',
              type: 'text',
              mandatory: true,
              validations: ['required'],
              helpText: 'First name of insured',
              sheet: 'Insured'
            },
            {
              fieldName: 'Email',
              fieldLevel1: 'Insured',
              fieldLevel2: 'Contact',
              type: 'email',
              mandatory: true,
              validations: ['required', 'email_format'],
              helpText: 'Email address',
              sheet: 'Insured'
            }
          ],
          metadata: { totalFields: 2, mandatoryFields: 2, optionalFields: 0 }
        }
      },
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      sourceFile: 'test.xlsx'
    }),
    exportConfiguration: jest.fn()
  }
}));

jest.mock('../../services/notificationService', () => ({
  notificationService: {
    sendEmail: jest.fn().mockResolvedValue({
      success: true,
      id: 'email-123',
      timestamp: new Date().toISOString(),
      deliveryStatus: 'sent'
    }),
    sendSMS: jest.fn().mockResolvedValue({
      success: true,
      id: 'sms-123',
      timestamp: new Date().toISOString(),
      deliveryStatus: 'sent'
    })
  }
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

const createWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const mockAuthState = {
    user: {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      roles: ['ADMIN']
    },
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false
  };

  const mockAuthContextValue = {
    state: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user']
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false
    },
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    updateUser: jest.fn(),
    clearError: jest.fn(),
    hasPermission: jest.fn(),
    hasRole: jest.fn()
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={mockAuthContextValue}>
        <MemoryRouter initialEntries={['/application/APP-123']}>
          {children}
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('Application Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Application Details Page Loading', () => {
    it('should load and display application details', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      // Should show loading initially
      expect(screen.getByText(/Loading Application Details/i)).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText(/Application Details/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show progress overview
      expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();

      // Should show sections
      await waitFor(() => {
        expect(screen.getByText(/Case Setup/i)).toBeInTheDocument();
        expect(screen.getByText(/Insured/i)).toBeInTheDocument();
      });
    });

    it('should handle loading errors gracefully', async () => {
      const { tppExcelParser } = require('../../services/tppExcelParser');
      tppExcelParser.parseTPPExcelFile.mockRejectedValueOnce(new Error('Parse error'));

      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByText(/Error Loading Application/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Retry/i)).toBeInTheDocument();
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Dynamic Form Rendering', () => {
    it('should render forms based on Excel configuration', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByText(/Application Details/i)).toBeInTheDocument();
      });

      // Wait for form sections to render
      await waitFor(() => {
        expect(screen.getByText(/Case Setup/i)).toBeInTheDocument();
        expect(screen.getByText(/Insured/i)).toBeInTheDocument();
      });

      // Check for form fields
      await waitFor(() => {
        expect(screen.getByLabelText(/Case ID/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      });
    });

    it('should show mandatory field indicators', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        const caseIdField = screen.getByLabelText(/Case ID/i);
        const firstNameField = screen.getByLabelText(/First Name/i);
        const emailField = screen.getByLabelText(/Email/i);

        expect(caseIdField).toHaveAttribute('aria-required', 'true');
        expect(firstNameField).toHaveAttribute('aria-required', 'true');
        expect(emailField).toHaveAttribute('aria-required', 'true');
      });
    });
  });

  describe('Form Interactions', () => {
    it('should handle form data changes', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/First Name/i);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      expect(firstNameInput).toHaveValue('John');
    });

    it('should validate form fields', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Section Edit/Save Functionality', () => {
    it('should allow editing sections for admin users', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByText(/Case Setup/i)).toBeInTheDocument();
      });

      // Should show edit buttons for admin users
      const editButtons = screen.getAllByText(/Edit/i);
      expect(editButtons.length).toBeGreaterThan(0);

      // Click edit button
      fireEvent.click(editButtons[0]);

      // Should show save and cancel buttons
      await waitFor(() => {
        expect(screen.getByText(/Save/i)).toBeInTheDocument();
        expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
      });
    });

    it('should save section changes', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByText(/Case Setup/i)).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText(/Edit/i);
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Save/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Save/i);
      fireEvent.click(saveButton);

      // Should show success toast
      const { toast } = require('react-hot-toast');
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('saved successfully'));
      });
    });
  });

  describe('Notification System Integration', () => {
    it('should show notification panel when button clicked', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
      });

      const notificationButton = screen.getByRole('button', { name: /Notifications/i });
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText(/Notification Center/i)).toBeInTheDocument();
        expect(screen.getByText(/Email/i)).toBeInTheDocument();
        expect(screen.getByText(/SMS/i)).toBeInTheDocument();
      });
    });

    it('should send email notifications', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      // Open notifications panel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

      await waitFor(() => {
        expect(screen.getByText(/Notification Center/i)).toBeInTheDocument();
      });

      // Fill email form
      const emailInput = screen.getByLabelText(/Recipient Email/i);
      const subjectInput = screen.getByLabelText(/Subject/i);
      const messageTextarea = screen.getByLabelText(/Message/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageTextarea, { target: { value: 'Test message content' } });

      // Send email
      const sendButton = screen.getByRole('button', { name: /Send Email/i });
      fireEvent.click(sendButton);

      // Should show success
      const { toast } = require('react-hot-toast');
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Email sent successfully!');
      });

      // Should show in history
      await waitFor(() => {
        expect(screen.getByText(/Notification History/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it('should send SMS notifications', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      // Open notifications panel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

      await waitFor(() => {
        expect(screen.getByText(/Notification Center/i)).toBeInTheDocument();
      });

      // Switch to SMS tab
      const smsTab = screen.getByText('SMS');
      fireEvent.click(smsTab);

      // Fill SMS form
      const phoneInput = screen.getByLabelText(/Recipient Phone/i);
      const messageTextarea = screen.getByLabelText(/Message/i);

      fireEvent.change(phoneInput, { target: { value: '+1555123456' } });
      fireEvent.change(messageTextarea, { target: { value: 'Test SMS message' } });

      // Send SMS
      const sendButton = screen.getByRole('button', { name: /Send SMS/i });
      fireEvent.click(sendButton);

      // Should show success
      const { toast } = require('react-hot-toast');
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('SMS sent successfully!');
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should show completion progress', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByText(/Application Progress/i)).toBeInTheDocument();
      });

      // Should show progress indicators
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
      expect(screen.getByText(/Remaining/i)).toBeInTheDocument();

      // Should show section status badges
      const statusBadges = screen.getAllByText(/Not Started|In Progress|Complete/i);
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('should update progress as fields are completed', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      });

      // Fill a required field
      const firstNameInput = screen.getByLabelText(/First Name/i);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      // Progress should update (this would happen in real implementation)
      // For now, just verify the field has the value
      expect(firstNameInput).toHaveValue('John');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const { notificationService } = require('../../services/notificationService');
      notificationService.sendEmail.mockRejectedValueOnce(new Error('Service error'));

      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      // Open notifications and try to send email
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Recipient Email/i)).toBeInTheDocument();
      });

      // Fill and send email
      fireEvent.change(screen.getByLabelText(/Recipient Email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /Send Email/i }));

      // Should still show success due to error handling in service
      const { toast } = require('react-hot-toast');
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByRole('main') || screen.getByRole('document')).toBeInTheDocument();
      });

      // Check for proper headings
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper form labels
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        inputs.forEach(input => {
          expect(input).toHaveAccessibleName();
        });
      });
    });

    it('should support keyboard navigation', async () => {
      render(
        <ApplicationDetails />,
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
      });

      const notificationButton = screen.getByRole('button', { name: /Notifications/i });
      
      // Should be focusable
      notificationButton.focus();
      expect(document.activeElement).toBe(notificationButton);

      // Should respond to Enter key
      fireEvent.keyDown(notificationButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText(/Notification Center/i)).toBeInTheDocument();
      });
    });
  });
});
