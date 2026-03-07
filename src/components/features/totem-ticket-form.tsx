'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateTicketAction, type GenerateTicketState } from '@/app/totem/actions';

const initialState: GenerateTicketState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-brand-600 px-6 py-4 text-xl font-semibold text-white transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? 'Gerando senha...' : 'Gerar senha'}
    </button>
  );
}

export function TotemTicketForm() {
  const [state, formAction] = useActionState(generateTicketAction, initialState);

  return (
    <form action={formAction} className="space-y-6" aria-describedby="totem-help-text">
      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-slate-900">Selecione o tipo de fila</legend>
        <p id="totem-help-text" className="text-sm text-slate-600">
          Escolha uma opção para gerar sua senha de atendimento.
        </p>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg focus-within:ring-4 focus-within:ring-brand-200">
          <input
            type="radio"
            name="priorityType"
            value="normal"
            className="h-5 w-5 accent-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            defaultChecked
          />
          Fila normal
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg focus-within:ring-4 focus-within:ring-brand-200">
          <input
            type="radio"
            name="priorityType"
            value="preferencial"
            className="h-5 w-5 accent-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
          Fila preferencial
        </label>
      </fieldset>

      <SubmitButton />

      {state.error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.generatedTicket ? (
        <section
          aria-live="polite"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-6 text-center"
        >
          <h2 className="text-lg font-semibold text-slate-900">Sua senha foi gerada</h2>
          <p className="mt-2 text-6xl font-extrabold tracking-widest text-emerald-700">{state.generatedTicket}</p>
          <p className="mt-3 text-base text-slate-700">Aguarde sua chamada no painel.</p>
        </section>
      ) : null}
    </form>
  );
}
