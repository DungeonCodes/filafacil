'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

type PriorityType = 'normal' | 'preferencial';

export interface GenerateTicketState {
  error?: string;
  generatedTicket?: string;
}

function parsePriorityType(formData: FormData): PriorityType | null {
  const value = formData.get('priorityType');
  if (value === 'normal' || value === 'preferencial') {
    return value;
  }

  return null;
}

function getPrefix(priorityType: PriorityType) {
  return priorityType === 'preferencial' ? 'P' : 'N';
}

export async function generateTicketAction(
  _previousState: GenerateTicketState,
  formData: FormData,
): Promise<GenerateTicketState> {
  const priorityType = parsePriorityType(formData);

  if (!priorityType) {
    return { error: 'Selecione o tipo de fila antes de gerar a senha.' };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: queue, error: queueError } = await supabase
      .from('queues')
      .select('id')
      .eq('code', 'GERAL')
      .single();

    if (queueError || !queue) {
      return { error: 'Não foi possível localizar a fila padrão. Tente novamente em instantes.' };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: lastTicket, error: lastTicketError } = await supabase
      .from('tickets')
      .select('ticket_number')
      .eq('queue_id', queue.id)
      .eq('priority_type', priorityType)
      .gte('issued_at', startOfDay.toISOString())
      .order('ticket_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastTicketError) {
      return { error: 'Não foi possível consultar a fila agora. Tente novamente em instantes.' };
    }

    const nextTicketNumber = (lastTicket?.ticket_number ?? 0) + 1;
    const prefix = getPrefix(priorityType);

    const { error: insertError } = await supabase.from('tickets').insert({
      queue_id: queue.id,
      ticket_number: nextTicketNumber,
      prefix,
      priority_type: priorityType,
      status: 'aguardando',
    });

    if (insertError) {
      return { error: 'Não foi possível gerar sua senha agora. Por favor, tente novamente.' };
    }

    return {
      generatedTicket: `${prefix}${String(nextTicketNumber).padStart(3, '0')}`,
    };
  } catch {
    return { error: 'Estamos com instabilidade de conexão. Tente novamente em alguns segundos.' };
  }
}
