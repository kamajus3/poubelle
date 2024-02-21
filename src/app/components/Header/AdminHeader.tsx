import Avatar from '@/app/components/Avatar'
import Link from 'next/link'

export default function AdminHeader() {
  return (
    <header className="border-b">
      <article className="w-screen flex sm:flex justify-between items-center px-4 py-4">
        <h1 className="text-black font-bold text-2xl">Racius Care</h1>

        <div className="flex gap-4 items-center mr-4">
          <Link href="#" className="font-medium text-black">
            Analytics
          </Link>
          <Link href="#" className="font-medium text-black">
            Histório
          </Link>
          <Link href="/admin/products" className="font-medium text-black">
            Productos
          </Link>
          <div className="h-11 flex gap-4 items-center justify-between">
            <Avatar />
          </div>
        </div>
      </article>
    </header>
  )
}
