'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { callNextTicketAction, type CallNextState } from '@/app/atendente/actions';

const initialState: CallNextState = {};

function CallButton({ priorityType, label }: { priorityType: 'normal' | 'preferencial'; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="priorityType"
      value={priorityType}
      disabled={pending}
      className="rounded-xl bg-brand-600 px-6 py-4 text-xl font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {pending ? 'Chamando senha...' : label}
    </button>
  );
}

export function AtendenteCallControls() {
  const [state, formAction] = useActionState(callNextTicketAction, initialState);

  return (
    <form action={formAction} className="space-y-4" aria-describedby="call-help-text">
      <p id="call-help-text" className="text-base text-slate-600">
        Escolha o tipo de chamada para avançar a fila de atendimento.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <CallButton priorityType="normal" label="Chamar próxima normal" />
        <CallButton priorityType="preferencial" label="Chamar próxima preferencial" />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base text-emerald-700">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
