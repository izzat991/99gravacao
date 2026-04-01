"use client"

import { useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="relative h-screen w-full max-w-[430px] mx-auto overflow-hidden bg-[#f5f0e8]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center px-4 pt-3">
        {/* Menu Button - Top Left */}
        <button className="absolute left-4 top-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md">
          {/* Red dot indicator */}
          <div className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
          {/* Menu Icon */}
          <Image
            src="/images/icon-menu.png"
            alt="Menu"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </button>

        {/* Balance - Centered */}
        <button className="flex items-center gap-1.5 bg-[#292444] text-white px-6 py-3 rounded-full text-[17px] font-medium">
          R$0,00
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15934.744238583984!2d-38.5286794!3d-3.7319444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c74857e4e4b3f9%3A0x8f8f8f8f8f8f8f8f!2sFortaleza%2C%20CE!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />

        {/* Center Location Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ marginTop: "-40px" }}>
          <Image
            src="/images/icon-arrow.png"
            alt="Localização"
            width={56}
            height={56}
            className="w-14 h-14"
          />
        </div>
      </div>

      {/* Bottom Section - No gap between banner and nav */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Promotional Banner */}
        {showBanner && (
          <div className="mx-3 relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center z-10"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <div className="rounded-xl overflow-hidden">
              <Image
                src="/images/banner-99moto.png"
                alt="99 Moto - Ganhe mais sem parar no ponto"
                width={400}
                height={120}
                className="w-full h-auto"
                loading="eager"
                priority
              />
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar - Directly attached to banner */}
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Settings Icon */}
          <button className="w-10 h-10 flex items-center justify-center">
            <Image
              src="/images/icon-settings.png"
              alt="Configurações"
              width={28}
              height={28}
              className="w-7 h-7"
            />
          </button>

          {/* Connect Button - Smaller width, larger text */}
          <button className="flex-1 mx-4 max-w-[220px] bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-xl py-4 rounded-full transition-colors shadow-sm">
            Conectar
          </button>

          {/* Message Icon */}
          <button className="w-10 h-10 flex items-center justify-center">
            <Image
              src="/images/icon-msg.png"
              alt="Mensagens"
              width={28}
              height={28}
              className="w-7 h-7"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
