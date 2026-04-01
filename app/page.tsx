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
          {/* Hamburger lines */}
          <div className="flex flex-col gap-[3px]">
            <div className="w-5 h-[2px] bg-[#1a1a1a] rounded-full" />
            <div className="w-5 h-[2px] bg-[#1a1a1a] rounded-full" />
            <div className="w-5 h-[2px] bg-[#1a1a1a] rounded-full" />
          </div>
        </button>

        {/* Balance - Centered */}
        <button className="flex items-center gap-1.5 bg-[#2b3a4a] text-white px-5 py-2.5 rounded-full text-[15px] font-medium">
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
          <div className="w-14 h-14 rounded-full border-[2px] border-[#4285f4] bg-white/90 flex items-center justify-center shadow-lg">
            {/* Blue navigation arrow */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285f4">
              <path d="M12 2L8 10h8L12 2z" />
              <circle cx="12" cy="14" r="3" fill="#4285f4" />
            </svg>
          </div>
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
        <div className="bg-[#f8f5f0] px-4 py-3 flex items-center justify-between">
          {/* Settings/Sliders Icon */}
          <button className="w-10 h-10 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="2" fill="#1a1a1a" stroke="none" />
              <circle cx="16" cy="12" r="2" fill="#1a1a1a" stroke="none" />
              <circle cx="10" cy="18" r="2" fill="#1a1a1a" stroke="none" />
            </svg>
          </button>

          {/* Connect Button - Smaller lateral margins */}
          <button className="flex-1 mx-6 bg-[#FFD700] hover:bg-[#f5cc00] text-[#1a1a1a] font-bold text-lg py-3.5 rounded-full transition-colors">
            Conectar
          </button>

          {/* Chat/Message Icon */}
          <button className="w-10 h-10 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              <line x1="8" y1="9" x2="16" y2="9" />
              <line x1="8" y1="13" x2="13" y2="13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
