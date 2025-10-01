import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

let capturedRows: any[] = [];
vi.mock('@/integrations/supabase/client', () => {
  const mockFrom = (table: string) => {
    if (table === 'player_registrations') {
      return {
        insert: (rows: any[]) => {
          capturedRows = rows;
          return {
            select: () => ({ data: rows, error: null })
          };
        }
      };
    }
    if (table === 'admin_settings') {
      // Chainable query builder: .select().eq().single()
      const chain = {
        select: () => chain,
        eq: () => chain,
        single: () => ({
          data: { registration_fee: 10, gst_percentage: 18 },
          error: null
        })
      };
      return chain as any;
    }
    // default no-op
    return {};
  };

  return {
    supabase: {
      from: mockFrom
    }
  };
});

import PlayerRegistrationForm from '../PlayerRegistrationForm';

const fillAndSubmit = async (dob: string) => {
  render(<PlayerRegistrationForm />);

  // Wait for form to be ready (admin settings loaded)
  await screen.findByText(/Player Registration/i);

  fireEvent.change(await screen.findByLabelText(/Full Name/i), { target: { value: 'Test User' } });
  fireEvent.change(await screen.findByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
  fireEvent.change(await screen.findByLabelText(/Phone Number/i), { target: { value: '9999999999' } });
  fireEvent.change(await screen.findByLabelText(/State/i), { target: { value: 'Telangana' } });
  fireEvent.change(await screen.findByLabelText(/^City/i), { target: { value: 'Hyderabad' } });

  const dobInput = await screen.findByLabelText(/Date of Birth/i) as HTMLInputElement;
  fireEvent.change(dobInput, { target: { value: dob } });
  expect(dobInput.value).toBe(dob);

  const terms = await screen.findByRole('checkbox', { name: /I agree/i });
  fireEvent.click(terms);

  fireEvent.click(await screen.findByRole('button', { name: /Register Player/i }));

  await waitFor(() => {
    expect(capturedRows.length).toBeGreaterThan(0);
  });

  return capturedRows[0];
};

describe('Date handling remains timezone agnostic', () => {
  beforeEach(() => {
    capturedRows = [];
  });

  it('keeps 2000-01-01 in IST', async () => {
    // @ts-ignore
    process.env.TZ = 'Asia/Kolkata';
    const payload = await fillAndSubmit('2000-01-01');
    expect(payload.date_of_birth).toBe('2000-01-01');
  });

  it('keeps 2000-01-01 in UTC', async () => {
    // @ts-ignore
    process.env.TZ = 'UTC';
    const payload = await fillAndSubmit('2000-01-01');
    expect(payload.date_of_birth).toBe('2000-01-01');
  });
});