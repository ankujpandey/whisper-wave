'use client'
import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import messages from '@/data/messages.json'
import Autoplay from 'embla-carousel-autoplay'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

const Home = () => {
  return (
    <main className="flex-grow flex relative min-h-screen flex-col items-center justify-center px-4 md:px-24 py-8">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">
          Step Into the Realm of Anonymous Whispers
          {/* Immerse Yourself in the Realm of Anonymous Whispers */}
        </h1>
        <p className="mt-2 md:mt-3 text-base md:text-lg">
          WhisperWave lets you share thoughts, ask questions, and connect
          anonymously. Engage in honest, unfiltered conversations in a safe,
          private space.
        </p>
      </section>

      <Carousel
        plugins={[Autoplay({ delay: 2000 })]}
        opts={{
          align: "start",
        }}
        orientation="vertical"
        className="w-full max-w-xl mt-2"
      >
        <CarouselContent className="-mt-1 max-h-[175px]">
          {messages.map((message, index) => (
            <CarouselItem key={index} className="pt-1 md:basis-1/2">
              <div className="p-1 max-h-[175px] overflow-auto">
                <Card className="h-full flex flex-col">
                  <CardHeader className='pb-2'>
                    {message.title}
                  </CardHeader>
                  <CardContent className="flex items-center justify-center px-6 py-3">
                    <span className="text-lg font-semibold">{message.content}</span>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end">
                    {message.received}
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious /> */}
        {/* <CarouselNext /> */}
      </Carousel>

      <footer className='absolute bottom-0 left-0 w-full text-center p-4 -mb-0 md:p-6'>
        © 2024 Whisper Wave. All rights reserved.
      </footer>
    </main>

  );
}

export default Home

