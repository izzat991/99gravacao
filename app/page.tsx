"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, Star, Check } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [vehicleLoading, setVehicleLoading] = useState(false)

  const handleVehicleClick = () => {
    setVehicleLoading(true)
    setTimeout(() => {
      setVehicleLoading(false)
      setVehicleOpen(true)
      setMenuOpen(false)
    }, 800)
  }

  return (
    <div className="relative h-screen w-full max-w-[430px] mx-auto overflow-hidden bg-[#f5f0e8]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center px-4 pt-3">
        {/* Menu Button - Top Left */}
        <button 
          onClick={() => setMenuOpen(true)}
          className="absolute left-4 top-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          {/* Red dot indicator - Right side */}
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
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

      {/* Bottom Section - White background covering both banner and nav */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl pt-4 pb-2">
        {/* Promotional Banner */}
        {showBanner && (
          <div className="mx-3 relative mb-3">
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

        {/* Bottom Navigation Bar */}
        <div className="px-4 py-2 flex items-center justify-between">
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

          {/* Connect Button */}
          <button className="flex-1 mx-3 max-w-[200px] bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-xl py-4 rounded-full transition-colors shadow-sm">
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

      {/* Menu Overlay */}
      {menuOpen && (
        <div 
          className="absolute inset-0 bg-black/40 z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide Menu */}
      <div className={`absolute top-0 left-0 h-full w-[85%] max-w-[340px] bg-white z-40 transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Profile Section */}
          <div className="flex flex-col items-center pt-12 pb-6 px-6">
            {/* Profile Photo */}
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mb-3">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Name and Rating */}
            <div className="flex items-center gap-1.5 text-lg font-medium text-gray-800">
              <span>Yuri</span>
              <span className="text-gray-400">•</span>
              <span>5,00</span>
              <Star className="w-4 h-4 fill-[#1a1a1a] text-[#1a1a1a]" />
            </div>

            {/* Rota 99 Moto Button */}
            <button className="mt-4 flex items-center gap-1 bg-[#292444] text-white px-5 py-2.5 rounded-full text-sm font-medium">
              Rota 99 Moto
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Stats */}
            <div className="flex w-full mt-6 border-t border-gray-100 pt-4">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800">0%</div>
                <div className="text-xs text-gray-500 leading-tight">Taxa de<br/>Aceitação</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-purple-600">0%</div>
                <div className="text-xs text-purple-600 leading-tight">Taxa de<br/>Finalização</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-6 py-2">
            <MenuItem label="Ganhos" />
            <MenuItem label="Recompensas" />
            <MenuItem label="Indique um amigo" />
            <MenuItem label="Central de Ajuda" />
            <MenuItem label="Notificações" />
            <MenuItem label="Central de Educação" hasNotification />
            <MenuItem label="Loja 99" />
            <MenuItem label="Veículos" onClick={handleVehicleClick} loading={vehicleLoading} />
          </div>
        </div>
      </div>

      {/* Vehicle Page */}
      <div className={`absolute top-0 left-0 h-full w-full bg-gray-50 z-50 transition-transform duration-300 ease-out ${vehicleOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-white">
            <button onClick={() => setVehicleOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Veículo</span>
            </button>
          </div>

          {/* Vehicle Card */}
          <div className="px-4 py-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 border border-gray-300 px-2 py-1 rounded">MOTO</span>
                <span className="text-green-500 font-medium text-sm">Aprovado</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-800 tracking-wider">RJO6E35</div>
                  <div className="text-xs text-gray-500 mt-1">HONDA/CB 250 TWISTER (AZUL)</div>
                </div>
                <div className="w-20 h-16">
                  <Image
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=100&fit=crop"
                    alt="Moto"
                    width={80}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">Veículo ativo</span>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Add Button */}
          <div className="px-4 py-6">
            <button className="w-full bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-lg py-4 rounded-full transition-colors">
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuItem({ label, hasNotification, onClick, loading }: { label: string; hasNotification?: boolean; onClick?: () => void; loading?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 border-b border-gray-100 text-left"
    >
      <span className="text-base text-gray-800 font-medium flex items-center gap-2">
        {label}
        {hasNotification && <div className="w-2 h-2 bg-red-500 rounded-full" />}
      </span>
      {loading && (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      )}
    </button>
  )
}
