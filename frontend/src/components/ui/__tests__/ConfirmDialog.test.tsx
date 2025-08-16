import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    message: 'Test Message'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when provided and cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom button text when provided', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Save"
        cancelText="Discard"
      />
    );
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByText('Processing...');
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByText('Processing...');
    const cancelButton = screen.getByText('Cancel');
    
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('does not call onConfirm when loading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    
    const confirmButton = screen.getByText('Processing...');
    fireEvent.click(confirmButton);
    
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('renders danger type with correct styles', () => {
    render(<ConfirmDialog {...defaultProps} type="danger" />);
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('renders warning type with correct styles', () => {
    render(<ConfirmDialog {...defaultProps} type="warning" />);
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-yellow-600');
  });

  it('renders info type with correct styles by default', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveClass('bg-blue-600');
  });

  it('closes dialog when clicking outside', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    // Click on the backdrop
    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with correct accessibility attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Test Title');
  });

  it('handles keyboard navigation', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    // Focus should be on the dialog
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveFocus();
  });
}); 