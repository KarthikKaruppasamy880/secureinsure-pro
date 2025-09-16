import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate, useBlocker } from 'react-router-dom';
import '@testing-library/jest-dom';
import { useUnsavedChanges } from '../useUnsavedChanges';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useBlocker: jest.fn(),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Test component that uses the hook
const TestComponent = ({ 
  hasUnsavedChanges, 
  onSave, 
  onDiscard 
}: { 
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
}) => {
  const { safeNavigate, isBlocked } = useUnsavedChanges({
    hasUnsavedChanges,
    onSave,
    onDiscard
  });

  return (
    <div>
      <div data-testid="blocked-status">{isBlocked ? 'blocked' : 'not-blocked'}</div>
      <button onClick={() => safeNavigate('/test')}>Navigate</button>
      <button onClick={() => safeNavigate('/test', { replace: true })}>Replace Navigate</button>
    </div>
  );
};

// Mock window.confirm
const mockConfirm = jest.fn();

describe('useUnsavedChanges', () => {
  const mockNavigate = jest.fn();
  const mockBlocker = {
    state: 'unblocked' as const,
    location: { pathname: '/test' },
    proceed: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useBlocker as jest.Mock).mockReturnValue(mockBlocker);
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: mockConfirm,
    });
    Object.defineProperty(window, 'addEventListener', {
      writable: true,
      value: jest.fn(),
    });
    Object.defineProperty(window, 'removeEventListener', {
      writable: true,
      value: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={false} />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('blocked-status')).toHaveTextContent('not-blocked');
  });

  it('shows blocked status when navigation is blocked', () => {
    (mockBlocker as any).state = 'blocked';
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('blocked-status')).toHaveTextContent('blocked');
  });

  it('navigates directly when no unsaved changes', () => {
    mockConfirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={false} />
      </BrowserRouter>
    );
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
  });

  it('shows confirmation dialog when navigating with unsaved changes', () => {
    mockConfirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} />
      </BrowserRouter>
    );
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to leave?');
  });

  it('calls onSave when confirmed with unsaved changes', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    mockConfirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} onSave={onSave} />
      </BrowserRouter>
    );
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
  });

  it('calls onDiscard when confirmed without onSave', () => {
    const onDiscard = jest.fn();
    mockConfirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} onDiscard={onDiscard} />
      </BrowserRouter>
    );
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/test', undefined);
  });

  it('does not navigate when confirmation is cancelled', () => {
    mockConfirm.mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} />
      </BrowserRouter>
    );
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles navigation with replace option', () => {
    mockConfirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={false} />
      </BrowserRouter>
    );
    
    const replaceButton = screen.getByText('Replace Navigate');
    fireEvent.click(replaceButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/test', { replace: true });
  });

  it('handles save errors gracefully', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    mockConfirm.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} onSave={onSave} />
      </BrowserRouter>
    );
    
    const navigateButton = screen.getByText('Navigate');
    fireEvent.click(navigateButton);
    
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
    
    // Should not navigate on save error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('adds beforeunload event listener when there are unsaved changes', () => {
    render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} />
      </BrowserRouter>
    );
    
    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('removes beforeunload event listener on cleanup', () => {
    const { unmount } = render(
      <BrowserRouter>
        <TestComponent hasUnsavedChanges={true} />
      </BrowserRouter>
    );
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
}); 