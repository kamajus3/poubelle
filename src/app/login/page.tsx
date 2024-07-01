'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Bounce, toast } from 'react-toastify'
import * as z from 'zod'

import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import Header from '@/components/ui/Header'
import { useAuth } from '@/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email('Preencha com um e-mail válido'),
  password: z
    .string()
    .min(6, 'A palavra-passe precisa de no minimo 6 caracteres'),
})

interface FormData {
  email: string
  password: string
}

export default function SignIn() {
  const router = useRouter()
  const { signInWithEmail, logout } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormData) {
    signInWithEmail(data.email, data.password)
      .then(async (user) => {
        if (user) {
          if (user.role !== 'admin') {
            router.push('/')
          } else {
            await logout()
            toast.error('Acounteceu algum erro ao tentar inciar sessão', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Bounce,
            })
          }
        }
      })
      .catch((e: Error) => {
        toast.error(e.message, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        })
      })
  }

  return (
    <section className="bg-white overflow-hidden">
      <Header.Client />
      <article className="flex justify-center items-center h-screen">
        <div className="space-y-6 text-gray-600 max-w-md lg:min-w-96 max-sm:w-[80%]">
          <h3 className="text-black text-2xl font-bold sm:text-3xl">
            Iniciar sessão
          </h3>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Field.Label htmlFor="email">E-mail</Field.Label>
              <Field.Input
                type="email"
                {...register('email')}
                error={errors.email}
              />
              <Field.Error error={errors.email} />
            </div>
            <div>
              <Field.Label htmlFor="password">Palavra-passe</Field.Label>
              <Field.Input
                type="password"
                {...register('password')}
                error={errors.password}
              />
              <Field.Error error={errors.password} />
            </div>
            <div className="mt-5">
              <Link
                href="/recuperar-conta"
                className="hover:text-main font-medium"
              >
                Esqueceu a sua senha?
              </Link>
            </div>
            <Button
              style={{ width: '100%', padding: '11px 16px 11px 16px' }}
              type="submit"
              loading={isSubmitting}
            >
              Entrar
            </Button>
          </form>
          <p className="text-center font-medium">
            Não tens uma conta?{' '}
            <Link href="/signup" className="text-main">
              Crie uma
            </Link>
          </p>
        </div>
      </article>
    </section>
  )
}
