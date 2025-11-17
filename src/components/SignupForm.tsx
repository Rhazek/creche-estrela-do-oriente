// Signup removido: componente mantido como stub para evitar que imports que
// eventualmente existam quebrem a aplicação. O fluxo de cadastro foi desativado
// e a rota `/signup` redireciona para `/login`.

'use client'

import React from 'react'

export default function SignupForm() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="shadow-xl border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold">Cadastro desativado</h2>
        <p className="mt-2 text-sm text-gray-600">O cadastro por autoatendimento foi desativado. Solicite acesso ao administrador.</p>
      </div>
    </div>
  )
}
