'use server';

import { revalidatePath } from 'next/cache';
import { formatTicketCode } from '@/lib/ticket';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PriorityType = 'normal' | 'preferencial';

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

export async function callNextTicketAction(_prev: CallNextState, formData: FormData): Promise<CallNextState> {
  const priorityType = parsePriorityType(formData);

  if (!priorityType) {
    return { error: 'Selecione um tipo de chamada válido.' };
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
      room_label: null,
      called_by: null,
    });

    if (callInsertError) {
      await supabase.from('tickets').update({ status: 'aguardando' }).eq('id', nextTicket.id);
      return { error: 'Não foi possível registrar a chamada da senha.' };
    }

    revalidatePath('/atendente');
    revalidatePath('/painel-chamada');

    return {
      success: `Senha ${formatTicketCode(nextTicket.prefix, nextTicket.ticket_number)} chamada com sucesso.`,
    };
  } catch {
    return { error: 'Falha de conexão com o serviço. Tente novamente em instantes.' };
  }
}
