import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormEngine } from '../FormEngine';
import { InsuranceField } from '../../../services/excelToJson';

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('FormEngine', () => {
  const mockFields: InsuranceField[] = [
    {
      fieldName: 'First Name',
      fieldLevel1: 'Personal',
      fieldLevel2: 'Basic Info',
      fieldLevel3: '',
      fieldLevel4: '',
      type: 'text',
      format: 'text',
      length: 50,
      mandatory: true,
      validations: ['required', 'min_length:2'],
      helpText: 'Enter your first name',
      businessRules: [],
      xpath: '/person/firstName',
      table: 'persons',
      column: 'first_name',
      commentary: 'First name field',
      sheet: 'Personal'
    },
    {
      fieldName: 'Email',
      fieldLevel1: 'Contact',
      fieldLevel2: 'Digital',
      fieldLevel3: '',
      fieldLevel4: '',
      type: 'email',
      format: 'email',
      length: 100,
      mandatory: true,
      validations: ['required', 'email_format'],
      helpText: 'Enter your email address',
      businessRules: ['unique_per_customer'],
      xpath: '/person/email',
      table: 'persons',
      column: 'email',
      commentary: 'Email field',
      sheet: 'Contact'
    },
    {
      fieldName: 'Age',
      fieldLevel1: 'Personal',
      fieldLevel2: 'Demographics',
      fieldLevel3: '',
      fieldLevel4: '',
      type: 'number',
      format: 'integer',
      length: 3,
      mandatory: true,
      validations: ['required', 'min:18', 'max:100'],
      helpText: 'Enter your age',
      businessRules: ['affects_premium'],
      xpath: '/person/age',
      table: 'persons',
      column: 'age',
      commentary: 'Age field',
      sheet: 'Personal'
    },
    {
      fieldName: 'Comments',
      fieldLevel1: 'Additional',
      fieldLevel2: 'Notes',
      fieldLevel3: '',
      fieldLevel4: '',
      type: 'textarea',
      format: 'text',
      length: 500,
      mandatory: false,
      validations: ['max_length:500'],
      helpText: 'Additional comments',
      businessRules: [],
      xpath: '/person/comments',
      table: 'persons',
      column: 'comments',
      commentary: 'Comments field',
      sheet: 'Additional'
    }
  ];

  const defaultProps = {
    fields: mockFields,
    data: {},
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all fields', () => {
      render(<FormEngine {...defaultProps} />);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/comments/i)).toBeInTheDocument();
    });

    it('should render mandatory field indicators', () => {
      render(<FormEngine {...defaultProps} />);

      // Check for required indicators (*)
      const firstNameLabel = screen.getByText(/first name/i);
      const emailLabel = screen.getByText(/email/i);
      const ageLabel = screen.getByText(/age/i);
      const commentsLabel = screen.getByText(/comments/i);

      expect(firstNameLabel.textContent).toContain('*');
      expect(emailLabel.textContent).toContain('*');
      expect(ageLabel.textContent).toContain('*');
      expect(commentsLabel.textContent).not.toContain('*');
    });

    it('should render help text', () => {
      render(<FormEngine {...defaultProps} />);

      expect(screen.getByText('Enter your first name')).toBeInTheDocument();
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByText('Enter your age')).toBeInTheDocument();
      expect(screen.getByText('Additional comments')).toBeInTheDocument();
    });

    it('should group fields by sections', () => {
      render(<FormEngine {...defaultProps} />);

      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Additional')).toBeInTheDocument();
    });
  });

  describe('Field Interactions', () => {
    it('should handle text input changes', async () => {
      const onChange = jest.fn();
      render(<FormEngine {...defaultProps} onChange={onChange} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('First Name', 'John');
      });
    });

    it('should handle email input changes', async () => {
      const onChange = jest.fn();
      render(<FormEngine {...defaultProps} onChange={onChange} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('Email', 'john@example.com');
      });
    });

    it('should handle number input changes', async () => {
      const onChange = jest.fn();
      render(<FormEngine {...defaultProps} onChange={onChange} />);

      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '25' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('Age', '25');
      });
    });

    it('should handle textarea changes', async () => {
      const onChange = jest.fn();
      render(<FormEngine {...defaultProps} onChange={onChange} />);

      const commentsTextarea = screen.getByLabelText(/comments/i);
      fireEvent.change(commentsTextarea, { target: { value: 'Some comments' } });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('Comments', 'Some comments');
      });
    });
  });

  describe('Validation', () => {
    it('should show validation errors for required fields', async () => {
      const data = { 'First Name': '', 'Email': '', 'Age': '' };
      render(<FormEngine {...defaultProps} data={data} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/age is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const data = { 'Email': 'invalid-email' };
      render(<FormEngine {...defaultProps} data={data} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should validate number ranges', async () => {
      const data = { 'Age': '150' };
      render(<FormEngine {...defaultProps} data={data} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/age must be between 18 and 100/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum length', async () => {
      const data = { 'First Name': 'A' };
      render(<FormEngine {...defaultProps} data={data} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate maximum length', async () => {
      const data = { 'Comments': 'A'.repeat(600) };
      render(<FormEngine {...defaultProps} data={data} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/comments cannot exceed 500 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const onSubmit = jest.fn();
      const validData = {
        'First Name': 'John',
        'Email': 'john@example.com',
        'Age': '25',
        'Comments': 'Test comments'
      };

      render(<FormEngine {...defaultProps} data={validData} onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(validData, true);
      });
    });

    it('should not submit form with invalid data', async () => {
      const onSubmit = jest.fn();
      const invalidData = {
        'First Name': '',
        'Email': 'invalid-email',
        'Age': '150'
      };

      render(<FormEngine {...defaultProps} data={invalidData} onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(invalidData, false);
      });
    });

    it('should show loading state during submission', () => {
      render(<FormEngine {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Data Population', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        'First Name': 'Jane',
        'Email': 'jane@example.com',
        'Age': '30',
        'Comments': 'Initial comments'
      };

      render(<FormEngine {...defaultProps} data={initialData} />);

      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Initial comments')).toBeInTheDocument();
    });

    it('should handle partial data population', () => {
      const partialData = {
        'First Name': 'John',
        'Age': '25'
      };

      render(<FormEngine {...defaultProps} data={partialData} />);

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
      
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const commentsTextarea = screen.getByLabelText(/comments/i) as HTMLTextAreaElement;
      
      expect(emailInput.value).toBe('');
      expect(commentsTextarea.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FormEngine {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/age/i);

      expect(firstNameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(ageInput).toHaveAttribute('aria-required', 'true');
    });

    it('should associate error messages with inputs', async () => {
      const data = { 'First Name': '' };
      render(<FormEngine {...defaultProps} data={data} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText(/first name/i);
        const errorMessage = screen.getByText(/first name is required/i);
        
        expect(firstNameInput).toHaveAttribute('aria-describedby');
        expect(errorMessage).toHaveAttribute('id');
      });
    });
  });

  describe('Business Rules', () => {
    it('should display business rule information', () => {
      render(<FormEngine {...defaultProps} />);

      // Check for business rule hints or tooltips
      expect(screen.getByText(/affects premium/i)).toBeInTheDocument();
      expect(screen.getByText(/unique per customer/i)).toBeInTheDocument();
    });
  });

  describe('Field Types', () => {
    it('should render correct input types', () => {
      render(<FormEngine {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/age/i);
      const commentsTextarea = screen.getByLabelText(/comments/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(ageInput).toHaveAttribute('type', 'number');
      expect(commentsTextarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('should apply field length constraints', () => {
      render(<FormEngine {...defaultProps} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const ageInput = screen.getByLabelText(/age/i);

      expect(firstNameInput).toHaveAttribute('maxLength', '50');
      expect(emailInput).toHaveAttribute('maxLength', '100');
      expect(ageInput).toHaveAttribute('maxLength', '3');
    });
  });
});
