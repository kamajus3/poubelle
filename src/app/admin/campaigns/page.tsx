'use client'

import { useEffect, useState } from 'react'
import { randomBytes } from 'crypto'
import {
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  set,
  update,
} from 'firebase/database'
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import { useForm } from 'react-hook-form'
import { Bounce, toast } from 'react-toastify'
import * as z from 'zod'

import { CampaignEdit, ProductInputProps } from '@/@types'
import Button from '@/components/ui/Button'
import DataState from '@/components/ui/DataState'
import Field from '@/components/ui/Field'
import Header from '@/components/ui/Header'
import Modal from '@/components/ui/Modal'
import contants from '@/constants'
import { publishedSince } from '@/functions'
import { useInformation } from '@/hooks/useInformation'
import { database, storage } from '@/lib/firebase/config'
import { getProducts } from '@/lib/firebase/database'
import { zodResolver } from '@hookform/resolvers/zod'

interface FormData {
  title: string
  default: boolean
  fixed: boolean
  description: string
  reduction?: string
  startDate?: string
  finishDate?: string
  products?: ProductInputProps[]
  photo: Blob
}

interface TableRowProps {
  data: CampaignEdit
  _delete(): void
  _edit(data: FormData, oldData?: CampaignEdit): Promise<void>
}

interface FilterFormData {
  search: string
  orderBy: string
}

function TableRow({ data, _delete, _edit }: TableRowProps) {
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const { informationsData } = useInformation()

  return (
    <tr className="border-y border-gray-200 border-y-[#dfdfdf]">
      <td className="p-3">
        <div className="text-center text-black font-medium">{data.title}</div>
      </td>
      <td className="p-3">
        <div className="text-center text-gray-400 font-medium">
          {data.startDate ? publishedSince(data.startDate) : '-'}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-gray-400 font-medium">
          {data.finishDate ? publishedSince(data.finishDate) : '-'}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-gray-400 font-medium">
          {publishedSince(data.createdAt)}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-gray-400 font-medium">
          {publishedSince(data.updatedAt)}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-black font-medium">
          {data.products ? data.products.length : '-'}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-black font-medium">
          {informationsData.defaultCampaign === data.id ? 'Sim' : 'Não'}
        </div>
      </td>
      <td className="p-3">
        <div className="text-center text-black font-medium">
          {informationsData.fixedCampaign === data.id ? 'Sim' : 'Não'}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          >
            <span className="text-red-500 font-medium">Apagar</span>
          </button>
        </div>
        <Modal.Dialog
          title="Apagar a campanha"
          description="Você tem certeza que queres apagar essa campanha?"
          actionTitle="Apagar"
          themeColor={contants.colors.error}
          action={_delete}
          isOpen={openDeleteModal}
          setOpen={setOpenDeleteModal}
        />
      </td>
      <td className="p-3">
        <div className="flex items-center justify-center">
          <button
            onClick={() => setOpenEditModal(true)}
            className="text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
          >
            <span className="text-violet-600 font-medium">Editar</span>
          </button>
        </div>
        <Modal.Campaign
          title="Editar campanha"
          actionTitle="Editar"
          isOpen={openEditModal}
          setOpen={setOpenEditModal}
          action={_edit}
          defaultData={{ ...data }}
        />
      </td>
    </tr>
  )
}

const schema = z.object({
  search: z.string().trim(),
  orderBy: z.string().trim(),
})

function reverseData(obj: Record<string, CampaignEdit>) {
  const newObj: Record<string, CampaignEdit> = {}
  const revObj = Object.keys(obj).reverse()
  revObj.forEach(function (i) {
    newObj[i] = obj[i]
  })
  return newObj
}

export default function PromotionPage() {
  const [campaignData, setCampaignData] = useState<
    Record<string, CampaignEdit>
  >({})
  const [loading, setLoading] = useState(true)

  const [newModal, setNewModal] = useState(false)

  const { register, watch } = useForm<FilterFormData>({
    defaultValues: {
      orderBy: 'updatedAt',
    },
    resolver: zodResolver(schema),
  })

  const orderByValue = watch('orderBy')

  const { informationsData } = useInformation()

  function _post(data: FormData) {
    const id = randomBytes(20).toString('hex')
    const reference = storageRef(storage, `/campaigns/${id}`)

    uploadBytes(reference, data.photo)
      .then(async () => {
        const photo = await getDownloadURL(reference)
        set(ref(database, `campaigns/${id}`), {
          title: data.title,
          description: data.description,
          default: data.default,
          fixed: data.fixed,
          reduction: data.reduction || null,
          startDate: data.startDate || null,
          finishDate: data.finishDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          products: data.products ? data.products.map((p) => p.id) : null,
          photo,
        })
          .then(() => {
            if (data.products) {
              data.products.map(async (p) => {
                update(ref(database, `products/${p.id}`), {
                  campaign: {
                    id,
                    title: data.title,
                    reduction: data.reduction || null,
                    startDate: data.startDate || null,
                    finishDate: data.finishDate || null,
                  },
                })
              })
            }

            if (data.default) {
              update(ref(database, 'informations/'), {
                defaultCampaign: id,
              })
            }

            if (data.fixed) {
              if (data.default) {
                update(ref(database, 'informations/'), {
                  fixedCampaign: id,
                })
              }
            }

            toast.success('Campanha postada com sucesso', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Bounce,
            })
          })
          .catch(() => {
            toast.error('Erro criar a campanha', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: 'light',
              transition: Bounce,
            })
          })
      })
      .catch(() => {
        toast.error('Erro a criar campanha', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        })
      })
  }

  async function _edit(data: FormData, oldData?: CampaignEdit) {
    if (oldData && oldData.id) {
      const reference = storageRef(storage, `/campaigns/${oldData.id}`)
      await uploadBytes(reference, data.photo)

      const oldDataProductsId = oldData.products
      const newDataProductsId = data.products
        ? data.products.map((p) => p.id)
        : null

      update(ref(database, `/campaigns/${oldData.id}`), {
        title: data.title,
        description: data.description,
        default: data.default,
        fixed: data.fixed,
        reduction: data.reduction || null,
        startDate: data.startDate || null,
        finishDate: data.finishDate || null,
        products: newDataProductsId,
        photo: oldData.photo,
        updatedAt: new Date().toISOString(),
      })
        .then(async () => {
          if (oldData.default === false && data.default) {
            const campaignProducts = await getProducts({
              campaign: oldData.id,
            })
            Object.entries(campaignProducts).map(async ([id]) => {
              await update(ref(database, `products/${id}`), {
                campaign: null,
              })
            })
          }

          if (data.products) {
            if (newDataProductsId && newDataProductsId !== oldDataProductsId) {
              const deletedProducts =
                newDataProductsId && oldDataProductsId
                  ? oldDataProductsId.filter(
                      (id) => !newDataProductsId.includes(id),
                    )
                  : []

              newDataProductsId.map(async (id) => {
                if (deletedProducts.includes(id) || data.default) {
                  await update(ref(database, `products/${id}`), {
                    campaign: null,
                  })
                } else {
                  await update(ref(database, `products/${id}`), {
                    campaign: {
                      id: oldData.id,
                      title: data.title,
                      reduction: data.reduction || null,
                      startDate: data.startDate || null,
                      finishDate: data.finishDate || null,
                    },
                  })
                }
              })
            }
          }

          if (data.default) {
            update(ref(database, 'informations/'), {
              defaultCampaign: oldData.id,
            })
          }

          if (data.fixed) {
            update(ref(database, 'informations/'), {
              fixedCampaign: oldData.id,
            })
          }

          if (
            informationsData.defaultCampaign === oldData.id &&
            !data.default
          ) {
            update(ref(database, 'informations/'), {
              defaultCampaign: null,
            })
          }

          if (informationsData.fixedCampaign === oldData.id && !data.fixed) {
            update(ref(database, 'informations/'), {
              fixedCampaign: null,
            })
          }

          toast.success('Campanha editada com sucesso', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
          })
        })
        .catch(() => {
          toast.error('Erro a editar a campanha', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: 'light',
            transition: Bounce,
          })
        })
    } else {
      toast.error('Erro a editar a campanha', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }
  }

  async function _delete(id: string) {
    const databaseReference = ref(database, `campaigns/${id}`)
    const storageReference = storageRef(storage, `campaigns/${id}`)

    try {
      await remove(databaseReference)
      await deleteObject(storageReference)

      const campaignProducts = await getProducts({
        campaign: id,
      })

      if (campaignProducts) {
        Object.entries(campaignProducts).map(async ([id]) => {
          await update(ref(database, `products/${id}`), {
            campaign: null,
          })
        })
      }

      toast.success('Campanha eliminada com sucesso', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    } catch {
      toast.error('Erro a apagar a campanha', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }
  }

  useEffect(() => {
    const reference = ref(database, 'campaigns/')
    const campaignQuery = query(reference, orderByChild(orderByValue))

    onValue(campaignQuery, (snapshot) => {
      const results: Record<string, CampaignEdit> = {}
      if (snapshot.exists()) {
        snapshot.forEach(function (child) {
          results[child.key] = child.val()
        })
        setCampaignData(reverseData(results))
      }

      setLoading(false)
    })
  }, [orderByValue])

  return (
    <section className="bg-white min-h-screen pb-12">
      <Header.Admin />

      <article className="mb-2 mt-12">
        <h1 className="text-black font-semibold text-3xl p-9">
          Minhas campanhas
        </h1>

        <div className="mb-10 px-8 gap-y-5 gap-x-4 flex flex-wrap items-center">
          <Button
            style={{
              padding: '14px 18px 14px 18px',
              backgroundColor: '#00A4C7',
            }}
            className="w-auto max-sm:w-full mt-2"
            onClick={() => {
              setNewModal(true)
            }}
          >
            Criar campanha
          </Button>

          <Field.Select
            {...register('orderBy')}
            style={{
              padding: '13px 18px 13px 18px',
            }}
            className="w-auto max-sm:w-full"
            options={[
              {
                value: 'updatedAt',
                label: 'Ordernar pela data de atualização',
              },
              {
                value: 'createdAt',
                label: 'Ordernar pela data de criação',
              },
              {
                value: 'name',
                label: 'Ordernar pelo título',
              },
            ]}
          />
        </div>
      </article>

      <article className="container mx-auto mt-8 max-sm:p-9">
        <DataState
          dataCount={Object.entries(campaignData).length}
          loading={loading}
          noDataMessage="As suas campanhas aparecerão aqui"
        >
          <div className="overflow-x-auto">
            <table className="table-auto w-full border border-[#dddddd]">
              <thead>
                <tr className="bg-[#F9FAFB] text-gray-600 uppercase text-sm">
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Título
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Início
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Fim
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Data de criação
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Data de atualização
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Productos
                  </th>

                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Padrão
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    Fixado
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    -
                  </th>
                  <th className="p-3 normal-case font-semibold text-base text-[#111827]">
                    -
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {Object.entries(campaignData).map(([id, campaign]) => (
                  <TableRow
                    key={id}
                    data={{
                      ...campaign,
                      id,
                    }}
                    _delete={() => {
                      _delete(id)
                    }}
                    _edit={_edit}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </DataState>
      </article>
      <Modal.Campaign
        title="Nova campanha"
        actionTitle="Postar"
        isOpen={newModal}
        setOpen={setNewModal}
        action={_post}
      />
    </section>
  )
}
