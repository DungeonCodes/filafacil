import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TotemPage from '@/app/totem/page';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'mock-id' } }),
            insert: vi.fn().mockResolvedValue({ error: null }),
        })),
    },
}));

describe('TotemPage', () => {
    it('renders the header and service options', () => {
        render(<TotemPage />);

        expect(screen.getByText('Gerar Senha')).toBeInTheDocument();
        expect(screen.getByText('Clínico Geral')).toBeInTheDocument();
        expect(screen.getByText('Pediatria')).toBeInTheDocument();
        expect(screen.getByText('Exames')).toBeInTheDocument();
    });

    it('renders the accessibility toggle', () => {
        render(<TotemPage />);
        expect(screen.getByLabelText('Alternar alto contraste')).toBeInTheDocument();
    });
});
