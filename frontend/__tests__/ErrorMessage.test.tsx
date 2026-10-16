import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

describe('ErrorMessage component', () => {
  it('renders custom error title and message', () => {
    render(
      <ErrorMessage
        title="Server Unavailable"
        message="Could not connect to the backend server."
      />
    );

    expect(screen.getByText('Server Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Could not connect to the backend server.')).toBeInTheDocument();
  });

  it('triggers retry callback when retry button is clicked', () => {
    const handleRetry = jest.fn();
    render(
      <ErrorMessage
        title="Network Error"
        message="Request timed out."
        onRetry={handleRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
