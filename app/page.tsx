"use client"

import { useState } from "react"
import { Menu, X, ChevronDown, Settings, MessageSquare } from "lucide-react"
import Image from "next/image"

// Ícones dos marcadores do mapa
const MarkerIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    person: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7" r="4" fill="#1a1a1a"/>
        <path d="M4 21v-2a6 6 0 0112 0v2" fill="#1a1a1a"/>
      </svg>
    ),
    people: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="7" r="3" fill="#1a1a1a"/>
        <circle cx="16" cy="7" r="3" fill="#1a1a1a"/>
        <path d="M2 21v-2a4 4 0 018 0v2M14 21v-2a4 4 0 018 0v2" fill="#1a1a1a"/>
      </svg>
    ),
    group: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="8" r="2.5" fill="#1a1a1a"/>
        <circle cx="12" cy="8" r="2.5" fill="#1a1a1a"/>
        <circle cx="18" cy="8" r="2.5" fill="#1a1a1a"/>
        <rect x="3" y="14" width="6" height="8" rx="1" fill="#1a1a1a"/>
        <rect x="9" y="14" width="6" height="8" rx="1" fill="#1a1a1a"/>
        <rect x="15" y="14" width="6" height="8" rx="1" fill="#1a1a1a"/>
      </svg>
    ),
    restaurant: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 3v18h2v-8h4v8h2V3H9v8H5V3H3z" fill="#1a1a1a"/>
        <path d="M16 3c-1.1 0-2 .9-2 2v6h2v10h2V11h2V5c0-1.1-.9-2-2-2h-2z" fill="#1a1a1a"/>
      </svg>
    ),
    check: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1a1a1a" strokeWidth="2"/>
        <path d="M8 12l3 3 5-5" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 22h20L12 2z" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
        <path d="M12 10v4M12 18h.01" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    diamond: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="12" y="2" width="14" height="14" rx="2" transform="rotate(45 12 2)" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
        <rect x="12" y="6" width="8" height="8" rx="1" transform="rotate(45 12 6)" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  }
  return <>{icons[type]}</>
}

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true)

  const markers = [
    { id: 1, type: "person", top: "18%", left: "35%" },
    { id: 2, type: "person", top: "22%", left: "58%" },
    { id: 3, type: "group", top: "28%", left: "72%" },
    { id: 4, type: "person", top: "38%", left: "22%" },
    { id: 5, type: "people", top: "42%", left: "38%" },
    { id: 6, type: "restaurant", top: "55%", left: "18%" },
    { id: 7, type: "check", top: "62%", left: "28%" },
    { id: 8, type: "people", top: "58%", left: "55%" },
    { id: 9, type: "warning", top: "60%", left: "72%" },
    { id: 10, type: "diamond", top: "58%", left: "85%" },
  ]

  return (
    <div className="relative h-screen w-full max-w-[430px] mx-auto overflow-hidden bg-[#f5f0e8]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3">
        {/* Menu Button */}
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <Menu className="w-5 h-5 text-[#1a1a1a]" />
        </button>

        {/* Balance */}
        <button className="flex items-center gap-1 bg-[#1e2a3a] text-white px-4 py-2 rounded-full text-sm font-medium">
          R$0,00
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31869.48847716797!2d-38.52867945!3d-3.7319444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c74857e4e4b3f9%3A0x8f8f8f8f8f8f8f8f!2sFortaleza%2C%20CE!5e0!3m2!1spt-BR!2sbr!4v1699999999999!5m2!1spt-BR!2sbr"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />

        {/* Map Markers Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
              style={{ top: marker.top, left: marker.left }}
            >
              <MarkerIcon type={marker.type} />
            </div>
          ))}

          {/* Center Location Button */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ marginTop: "-20px" }}
          >
            <div className="relative">
              {/* Outer ring */}
              <div className="w-16 h-16 rounded-full border-[6px] border-[#2a2a2a] bg-white flex items-center justify-center shadow-xl">
                {/* Inner blue arrow */}
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-[#4285f4]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Promotional Banner */}
        {showBanner && (
          <div className="mx-3 mb-3 relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md z-10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-lg">
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

        {/* Bottom Navigation Bar */}
        <div className="bg-white px-4 py-3 flex items-center justify-between rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          {/* Settings Icon */}
          <button className="w-12 h-12 flex items-center justify-center">
            <Settings className="w-7 h-7 text-[#1a1a1a]" />
          </button>

          {/* Connect Button */}
          <button className="flex-1 mx-4 bg-[#FFD700] hover:bg-[#f5cc00] text-[#1a1a1a] font-bold text-lg py-4 rounded-full transition-colors shadow-md">
            Conectar
          </button>

          {/* Chat Icon */}
          <button className="w-12 h-12 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-[#1a1a1a]" />
          </button>
        </div>
      </div>
    </div>
  )
}
