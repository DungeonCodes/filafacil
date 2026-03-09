import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MedicoPage from '@/app/medico/page';

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
}));

describe('MedicoPage', () => {
  it('renders doctor panel controls with specialty and consultorio', () => {
    render(<MedicoPage />);

    expect(screen.getByText('Tela do Médico')).toBeInTheDocument();
    expect(screen.getByLabelText('Especialidade / categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Consultório')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chamar próxima senha/i })).toBeInTheDocument();
    expect(screen.getByText(/Próxima senha \(Clínico Geral\)/i)).toBeInTheDocument();
    expect(screen.getByText('Últimas chamadas do consultório')).toBeInTheDocument();
  });
});
