import { redirect } from 'next/navigation'

export default function SignupPage() {
  // Rota de signup removida — redirecionar para login
  redirect('/login')
}