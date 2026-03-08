import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboardPage from '@/app/admin/page';

// Mock ResizeObserver for Recharts
class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}
window.ResizeObserver = ResizeObserverMock;

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            gte: vi.fn().mockResolvedValue({ data: [] }),
        })),
    },
}));

describe('AdminDashboardPage', () => {
    it('renders analytics components and KPIs', () => {
        render(<AdminDashboardPage />);
        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Gerado (Hoje)')).toBeInTheDocument();
        expect(screen.getByText('Tempo Médio de Espera')).toBeInTheDocument();
        expect(screen.getByText('Atendimentos Iniciados')).toBeInTheDocument();
        expect(screen.getByText('Evolução do Tempo de Espera')).toBeInTheDocument();
    });
});
