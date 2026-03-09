import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicoPage from '@/app/medico/page';

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
}));

describe('MedicoPage', () => {
  it('renders doctor panel controls', () => {
    render(<MedicoPage />);

    expect(screen.getByText('Tela do Médico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chamar próxima normal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chamar próxima preferencial/i })).toBeInTheDocument();
    expect(screen.getByText('Próxima senha normal')).toBeInTheDocument();
    expect(screen.getByText('Próxima senha preferencial')).toBeInTheDocument();
    expect(screen.getByText('Últimas chamadas do consultório')).toBeInTheDocument();
  });
});
