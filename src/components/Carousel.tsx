'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  A11y,
  Autoplay,
  Navigation,
  Pagination,
  Scrollbar,
} from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import constants from '@/constants'
import { formatPhotoUrl } from '@/functions/format'
import { useCampaign } from '@/hooks/useCampaign'
import useDimensions from '@/hooks/useDimensions'
import { Link } from '@/navigation'

import CarouselSkeleton from './Skeleton/CarouselSkeleton'
import Button from './Button'

import '@/assets/swiper.css'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

export default function Carousel() {
  const t = useTranslations('structure')
  const { campaignData } = useCampaign()
  const [width] = useDimensions()

  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      spaceBetween={30}
      pagination={{ dynamicBullets: true }}
      navigation={!(width <= 600)}
      slidesPerView={1}
      loop={true}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      className="mySwiper"
    >
      {campaignData.map((campaign) => (
        <SwiperSlide key={campaign.id}>
          <article className="w-1/2 flex-shrink-0 flex-grow-0 max-sm:w-full sm:h-full flex items-center justify-center">
            <div className="static left-24 z-50 flex w-[480px] select-none flex-col items-center justify-end gap-4 lg:absolute lg:items-start">
              <h3 className="text-center text-3xl font-semibold text-white lg:text-left">
                {campaign.title}
              </h3>
              <p className="text-center font-medium w-[40vw] max-sm:w-[75vw] text-base text-white lg:text-left">
                {campaign.description}
              </p>
              {campaign.reduction && (
                <Link href={`/campaign/${campaign.id}`}>
                  <Button
                    style={{
                      width: '100%',
                      padding: '13px 18px 13px 18px',
                      backgroundColor: constants.colors.secondary,
                    }}
                  >
                    {t('carousel.seeProducts')}
                  </Button>
                </Link>
              )}
            </div>
          </article>
          <article className="w-1/2 flex-shrink-0 flex-grow-0 max-sm:w-full sm:h-full flex items-center justify-center">
            <Image
              src={formatPhotoUrl(campaign.photo, campaign.updatedAt)}
              alt={campaign.title}
              width={500}
              height={500}
              draggable={false}
              className="select-none"
            />
          </article>
        </SwiperSlide>
      ))}

      {campaignData.length === 0 &&
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
          <SwiperSlide key={id}>
            <CarouselSkeleton />
          </SwiperSlide>
        ))}
    </Swiper>
  )
}
