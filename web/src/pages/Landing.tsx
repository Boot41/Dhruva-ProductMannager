import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="w-full p-4">
      <div className="max-w-[700px] mx-auto bg-white border rounded-xl p-8 shadow-[0_10px_20px_rgba(0,0,0,0.04)] border-[color:var(--color-secondary-200)]">
        <h1 className="text-3xl font-extrabold text-[color:var(--color-secondary-900)] m-0">Welcome 👋</h1>
        <p className="text-[color:var(--color-secondary-600)] mt-2 mb-6">
          This is a temporary landing page. You are logged in.
        </p>
        <div className="grid gap-3">
          <Link className="text-blue-600 underline" to="/">Go back to Login</Link>
        </div>
      </div>
    </div>
  )
}
