import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AtendentePage from '@/app/atendente/page';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null }),
            update: vi.fn().mockResolvedValue({ error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
        })),
    },
}));

describe('AtendentePage', () => {
    it('renders the main dashboard interface', () => {
        render(<AtendentePage />);
        expect(screen.getByText('Painel de Atendimento')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Chamar Próximo/i })).toBeInTheDocument();
        expect(screen.getByText('Fila de Espera')).toBeInTheDocument();
    });

    it('renders disabled actions if no ticket is selected', () => {
        render(<AtendentePage />);
        expect(screen.getByRole('button', { name: /Rechamar/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Encaminhar/i })).toBeDisabled();
    });
});
