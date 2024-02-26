'use client'

import { Swiper, SwiperSlide } from 'swiper/react'

import CATEGORIES from '@/assets/data/categories'
import { Scrollbar } from 'swiper/modules'
import dynamic from 'next/dynamic'
import Category from '@/@types/categories'
import dynamicIconImports from 'lucide-react/dynamicIconImports'

import 'swiper/css/scrollbar'
import '@/assets/swiper.css'

interface CategoryFilterProps {
  title: string
}

function CategoryCard(props: Category) {
  const LucideIcon = dynamic(dynamicIconImports[props.icon])

  return (
    <div>
      <button className="h-48 w-48 bg-[#d3d3d3] rounded-full border flex gap-y-2 flex-col justify-center items-center">
        <LucideIcon color="#000" size={60} />
      </button>

      <p className="text-black font-medium mt-5 text-center">{props.label}</p>
    </div>
  )
}

export default function CategoryFilter(props: CategoryFilterProps) {
  return (
    <div className="p-6 mt-6">
      <h2 className="text-black font-semibold text-3xl">{props.title}</h2>
      <Swiper
        modules={[Scrollbar]}
        spaceBetween={20}
        slidesPerView={5}
        className="product-card"
        breakpoints={{
          320: {
            slidesPerView: 2,
          },
          640: {
            slidesPerView: 3,
          },
          768: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 5,
          },
        }}
      >
        {CATEGORIES.map((product) => (
          <SwiperSlide key={product.label}>
            <CategoryCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
