'use server';

import { revalidatePath } from 'next/cache';
import { formatTicketCode } from '@/lib/ticket';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PriorityType = 'normal' | 'preferencial';

const AVAILABLE_COUNTERS = [
  'Guichê 001',
  'Guichê 002',
  'Guichê 003',
  'Guichê 004',
  'Guichê 005',
  'Guichê 006',
  'Guichê 007',
  'Guichê 008',
  'Guichê 009',
  'Guichê 010',
] as const;

export interface CallNextState {
  error?: string;
  success?: string;
}

function parsePriorityType(formData: FormData): PriorityType | null {
  const priorityType = formData.get('priorityType');

  if (priorityType === 'normal' || priorityType === 'preferencial') {
    return priorityType;
  }

  return null;
}

function parseRoomLabel(formData: FormData): string | null {
  const roomLabel = formData.get('roomLabel');
  if (typeof roomLabel !== 'string') {
    return null;
  }

  return AVAILABLE_COUNTERS.includes(roomLabel as (typeof AVAILABLE_COUNTERS)[number]) ? roomLabel : null;
}

export async function callNextTicketAction(_prev: CallNextState, formData: FormData): Promise<CallNextState> {
  const priorityType = parsePriorityType(formData);
  const roomLabel = parseRoomLabel(formData);

  if (!priorityType) {
    return { error: 'Selecione um tipo de chamada válido.' };
  }

  if (!roomLabel) {
    return { error: 'Selecione um guichê válido antes de chamar a senha.' };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: queue, error: queueError } = await supabase
      .from('queues')
      .select('id')
      .eq('code', 'GERAL')
      .single();

    if (queueError || !queue) {
      return { error: 'Não foi possível localizar a fila GERAL.' };
    }

    const { data: nextTicket, error: nextTicketError } = await supabase
      .from('tickets')
      .select('id,prefix,ticket_number')
      .eq('queue_id', queue.id)
      .eq('status', 'aguardando')
      .eq('priority_type', priorityType)
      .order('issued_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextTicketError) {
      return { error: 'Não foi possível consultar a próxima senha agora.' };
    }

    if (!nextTicket) {
      return { error: `Não há senha ${priorityType === 'normal' ? 'normal' : 'preferencial'} aguardando.` };
    }

    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'chamada' })
      .eq('id', nextTicket.id)
      .eq('status', 'aguardando');

    if (updateError) {
      return { error: 'Não foi possível atualizar o status da senha.' };
    }

    const { error: callInsertError } = await supabase.from('calls').insert({
      ticket_id: nextTicket.id,
      called_at: new Date().toISOString(),
      room_label: roomLabel,
      called_by: null,
    });

    if (callInsertError) {
      await supabase.from('tickets').update({ status: 'aguardando' }).eq('id', nextTicket.id);
      return { error: 'Não foi possível registrar a chamada da senha.' };
    }

    revalidatePath('/atendente');
    revalidatePath('/painel-chamada');

    return {
      success: `Senha ${formatTicketCode(nextTicket.prefix, nextTicket.ticket_number)} chamada com sucesso no ${roomLabel}.`,
    };
  } catch {
    return { error: 'Falha de conexão com o serviço. Tente novamente em instantes.' };
  }
}
