import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';

describe('EmptyState component', () => {
  it('renders title and description properly', () => {
    render(
      <EmptyState
        title="Practice Dialogue in Development"
        description="A guided conversation for this scenario is currently being curated."
        actionHref="/scenarios/1"
        actionLabel="View Scenario Phrases"
      />
    );

    expect(screen.getByText('Practice Dialogue in Development')).toBeInTheDocument();
    expect(
      screen.getByText('A guided conversation for this scenario is currently being curated.')
    ).toBeInTheDocument();
    const actionBtn = screen.getByRole('link', { name: /View Scenario Phrases/i });
    expect(actionBtn).toHaveAttribute('href', '/scenarios/1');
  });
});
