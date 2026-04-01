"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Star, Check, Camera, Loader2 } from "lucide-react"
import Image from "next/image"

interface Vehicle {
  id: string
  type: "moto" | "carro"
  placa: string
  nome: string
  cor: string
}

interface UserProfile {
  name: string
  photo: string
}

type ConnectionState = "idle" | "loading" | "facial-intro" | "facial-scan" | "searching"

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    name: "Yuri",
    photo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RfRScspSGHgwcvwdNpPr6mhGL18tWj.png"
  })
  const [newVehicle, setNewVehicle] = useState({
    type: "moto" as "moto" | "carro",
    placa: "",
    nome: "",
    cor: ""
  })
  const [editName, setEditName] = useState("")
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage
  useEffect(() => {
    const savedVehicles = localStorage.getItem("vehicles")
    const savedProfile = localStorage.getItem("profile")
    
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles))
    } else {
      // Default vehicle
      const defaultVehicle: Vehicle = {
        id: "1",
        type: "moto",
        placa: "RJO6E35",
        nome: "HONDA/CB 250 TWISTER",
        cor: "AZUL"
      }
      setVehicles([defaultVehicle])
      localStorage.setItem("vehicles", JSON.stringify([defaultVehicle]))
    }
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const handleVehicleClick = () => {
    setVehicleLoading(true)
    setTimeout(() => {
      setVehicleLoading(false)
      setVehicleOpen(true)
      setMenuOpen(false)
    }, 800)
  }

  const handleProfileClick = () => {
    setProfileLoading(true)
    setEditName(profile.name)
    setTimeout(() => {
      setProfileLoading(false)
      setProfileOpen(true)
      setMenuOpen(false)
    }, 800)
  }

  const removeVehicle = (id: string) => {
    const updated = vehicles.filter(v => v.id !== id)
    setVehicles(updated)
    localStorage.setItem("vehicles", JSON.stringify(updated))
    setSelectedVehicleId(null)
  }

  const addVehicle = () => {
    if (!newVehicle.placa || !newVehicle.nome || !newVehicle.cor) return
    
    const vehicle: Vehicle = {
      id: Date.now().toString(),
      type: newVehicle.type,
      placa: newVehicle.placa.toUpperCase(),
      nome: newVehicle.nome.toUpperCase(),
      cor: newVehicle.cor.toUpperCase()
    }
    
    const updated = [...vehicles, vehicle]
    setVehicles(updated)
    localStorage.setItem("vehicles", JSON.stringify(updated))
    setNewVehicle({ type: "moto", placa: "", nome: "", cor: "" })
    setAddVehicleOpen(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newProfile = { ...profile, photo: reader.result as string }
        setProfile(newProfile)
        localStorage.setItem("profile", JSON.stringify(newProfile))
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = () => {
    const newProfile = { ...profile, name: editName }
    setProfile(newProfile)
    localStorage.setItem("profile", JSON.stringify(newProfile))
    setProfileOpen(false)
  }

  const handleConnect = () => {
    if (connectionState === "searching") return
    
    setConnectionState("loading")
    setTimeout(() => {
      setConnectionState("facial-intro")
    }, 2000)
  }

  const handleVerifyNow = () => {
    setConnectionState("facial-scan")
    setTimeout(() => {
      setConnectionState("searching")
    }, 3000)
  }

  // Get active vehicle type for menu display
  const activeVehicle = vehicles[0]
  const routeLabel = activeVehicle?.type === "carro" ? "Rota 99 Carro" : "Rota 99 Moto"

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

        {/* Yellow Hexagon Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 430 800" preserveAspectRatio="xMidYMid slice">
            {/* Light yellow hexagons */}
            <polygon points="100,150 130,135 160,150 160,180 130,195 100,180" fill="rgba(255,227,35,0.35)" />
            <polygon points="160,180 190,165 220,180 220,210 190,225 160,210" fill="rgba(255,227,35,0.4)" />
            <polygon points="220,150 250,135 280,150 280,180 250,195 220,180" fill="rgba(255,227,35,0.3)" />
            <polygon points="50,250 80,235 110,250 110,280 80,295 50,280" fill="rgba(255,227,35,0.45)" />
            <polygon points="110,280 140,265 170,280 170,310 140,325 110,310" fill="rgba(255,227,35,0.5)" />
            <polygon points="170,250 200,235 230,250 230,280 200,295 170,280" fill="rgba(255,227,35,0.35)" />
            
            {/* Darker yellow hexagons */}
            <polygon points="230,280 260,265 290,280 290,310 260,325 230,310" fill="rgba(255,200,0,0.55)" />
            <polygon points="80,350 110,335 140,350 140,380 110,395 80,380" fill="rgba(255,200,0,0.5)" />
            <polygon points="140,380 170,365 200,380 200,410 170,425 140,410" fill="rgba(255,227,35,0.45)" />
            <polygon points="200,350 230,335 260,350 260,380 230,395 200,380" fill="rgba(255,200,0,0.6)" />
            <polygon points="260,380 290,365 320,380 320,410 290,425 260,410" fill="rgba(255,227,35,0.4)" />
            
            {/* More light yellow */}
            <polygon points="30,420 60,405 90,420 90,450 60,465 30,450" fill="rgba(255,227,35,0.35)" />
            <polygon points="90,450 120,435 150,450 150,480 120,495 90,480" fill="rgba(255,227,35,0.5)" />
            <polygon points="150,420 180,405 210,420 210,450 180,465 150,450" fill="rgba(255,200,0,0.45)" />
            <polygon points="210,450 240,435 270,450 270,480 240,495 210,480" fill="rgba(255,227,35,0.4)" />
            <polygon points="270,420 300,405 330,420 330,450 300,465 270,450" fill="rgba(255,200,0,0.5)" />
            
            {/* Bottom section */}
            <polygon points="60,520 90,505 120,520 120,550 90,565 60,550" fill="rgba(255,227,35,0.45)" />
            <polygon points="120,550 150,535 180,550 180,580 150,595 120,580" fill="rgba(255,200,0,0.55)" />
            <polygon points="180,520 210,505 240,520 240,550 210,565 180,550" fill="rgba(255,227,35,0.4)" />
            <polygon points="240,550 270,535 300,550 300,580 270,595 240,580" fill="rgba(255,227,35,0.35)" />
            <polygon points="300,520 330,505 360,520 360,550 330,565 300,550" fill="rgba(255,200,0,0.5)" />
          </svg>
        </div>

        {/* Center Location Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ marginTop: "-40px" }}>
          <Image
            src="/images/icon-arrow.png"
            alt="Localização"
            width={56}
            height={56}
            className="w-14 h-14"
            loading="eager"
            priority
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
          <button className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/images/icon-settings.png"
              alt="Configurações"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </button>

          {/* Red dot indicator */}
          {connectionState === "idle" && (
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -mr-1" />
          )}

          {/* Connect/Loading/Searching Button */}
          {connectionState === "loading" ? (
            <div className="flex-1 mx-3 max-w-[200px] bg-white text-gray-600 font-bold text-lg py-4 rounded-full flex flex-col items-center justify-center">
              <span>Carregando...</span>
              <div className="flex gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 bg-[#ffe323] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2.5 h-2.5 bg-[#ffe323] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2.5 h-2.5 bg-[#ffe323] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : connectionState === "searching" ? (
            <button className="flex-1 mx-3 max-w-[200px] relative overflow-hidden bg-[#ffe323]/30 text-[#1a1a1a] font-bold text-xl py-4 rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe323]/60 to-transparent animate-shimmer" />
              <span className="relative z-10">Buscando</span>
            </button>
          ) : (
            <button 
              onClick={handleConnect}
              className="flex-1 mx-3 max-w-[200px] bg-[#d1d1d1] hover:bg-[#c5c5c5] text-[#1a1a1a] font-bold text-xl py-4 rounded-full transition-colors shadow-sm"
            >
              Conectar
            </button>
          )}

          {/* Message Icon */}
          <button className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/images/icon-msg.png"
              alt="Mensagens"
              width={32}
              height={32}
              className="w-8 h-8"
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
                src={profile.photo}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover object-center"
              />
            </div>
            
            {/* Name and Rating */}
            <div className="flex items-center gap-1.5 text-lg font-bold text-black">
              <span>{profile.name}</span>
              <span>•</span>
              <span>5,00</span>
              <Star className="w-4 h-4 fill-black text-black" />
            </div>

            {/* Rota 99 Button */}
            <button className="mt-4 flex items-center gap-1 bg-[#292444] text-white px-5 py-2.5 rounded-full text-sm font-medium">
              {routeLabel}
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Stats */}
            <div className="flex w-full mt-6 border-t border-gray-100 pt-4">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800">0%</div>
                <div className="text-xs text-gray-500 leading-tight">Taxa de<br/>Aceitação</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-[#cd415f]">0%</div>
                <div className="text-xs text-[#cd415f] leading-tight">Taxa de<br/>Finalização</div>
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
            <MenuItem label="Horas Dirigidas" onClick={handleProfileClick} loading={profileLoading} />
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

          {/* Vehicle Cards */}
          <div className="px-4 py-4 flex-1 overflow-y-auto">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 border border-gray-300 px-2 py-1 rounded">
                    {vehicle.type.toUpperCase()}
                  </span>
                  <span className="text-green-500 font-medium text-sm">Aprovado</span>
                </div>
                
                <button 
                  onClick={() => setSelectedVehicleId(selectedVehicleId === vehicle.id ? null : vehicle.id)}
                  className="w-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="text-2xl font-bold text-gray-800 tracking-wider">{vehicle.placa}</div>
                      <div className="text-xs text-gray-500 mt-1">{vehicle.nome} ({vehicle.cor})</div>
                    </div>
                    <div className="w-24 h-20">
                      <Image
                        src={vehicle.type === "moto" ? "/images/icon-moto.png" : "/images/icon-car.png"}
                        alt={vehicle.type === "moto" ? "Moto" : "Carro"}
                        width={96}
                        height={80}
                        className="w-auto h-full object-contain"
                      />
                    </div>
                  </div>
                </button>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">Veículo ativo</span>
                  </div>
                  {selectedVehicleId === vehicle.id && (
                    <button 
                      onClick={() => removeVehicle(vehicle.id)}
                      className="text-red-500 text-sm font-medium animate-fade-in"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <div className="px-4 py-6">
            <button 
              onClick={() => setAddVehicleOpen(true)}
              className="w-full bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-lg py-4 rounded-full transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {addVehicleOpen && (
        <div className="absolute inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[360px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Adicionar Veículo</h2>
            
            {/* Type Selection */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setNewVehicle({ ...newVehicle, type: "moto" })}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  newVehicle.type === "moto" 
                    ? "bg-[#292444] text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Moto
              </button>
              <button
                onClick={() => setNewVehicle({ ...newVehicle, type: "carro" })}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  newVehicle.type === "carro" 
                    ? "bg-[#292444] text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Carro
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Placa (ex: ABC1234)"
                value={newVehicle.placa}
                onChange={(e) => setNewVehicle({ ...newVehicle, placa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Modelo (ex: Honda CB 250)"
                value={newVehicle.nome}
                onChange={(e) => setNewVehicle({ ...newVehicle, nome: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Cor (ex: Azul)"
                value={newVehicle.cor}
                onChange={(e) => setNewVehicle({ ...newVehicle, cor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAddVehicleOpen(false)}
                className="flex-1 py-3 rounded-full border border-gray-300 text-gray-600 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={addVehicle}
                className="flex-1 py-3 rounded-full bg-[#ffe323] text-[#1a1a1a] font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Page (Horas Dirigidas) */}
      <div className={`absolute top-0 left-0 h-full w-full bg-gray-50 z-50 transition-transform duration-300 ease-out ${profileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-white">
            <button onClick={() => setProfileOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Horas Dirigidas</span>
            </button>
          </div>

          {/* Profile Edit */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Photo */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                <Image
                  src={profile.photo}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#292444] rounded-full flex items-center justify-center"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Name Input */}
            <div className="w-full max-w-[300px]">
              <label className="block text-sm font-medium text-gray-600 mb-2">Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-center text-lg font-medium"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="px-4 py-6">
            <button 
              onClick={saveProfile}
              className="w-full bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-lg py-4 rounded-full transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Facial Recognition Intro Screen */}
      {connectionState === "facial-intro" && (
        <div className="absolute inset-0 bg-white z-[70] flex flex-col">
          {/* Header */}
          <div className="flex items-center px-4 py-4 border-b border-gray-100">
            <button onClick={() => setConnectionState("idle")} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Reconhecimento facial</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Illustration */}
            <div className="w-64 h-64 mb-8">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Person with phone */}
                <ellipse cx="100" cy="180" rx="60" ry="10" fill="#f5f5f5" />
                {/* Body */}
                <path d="M70 140 Q70 100 100 90 Q130 100 130 140 L130 170 L70 170 Z" fill="#f59e0b" />
                {/* Head */}
                <circle cx="100" cy="65" r="30" fill="#fbbf24" />
                {/* Hair */}
                <path d="M75 55 Q75 35 100 35 Q125 35 125 55 Q125 45 100 45 Q75 45 75 55" fill="#1a1a1a" />
                {/* Face */}
                <circle cx="90" cy="65" r="3" fill="#1a1a1a" />
                <circle cx="110" cy="65" r="3" fill="#1a1a1a" />
                <path d="M95 75 Q100 80 105 75" stroke="#1a1a1a" strokeWidth="2" fill="none" />
                {/* Arm holding phone */}
                <path d="M130 120 L160 90" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" />
                {/* Phone */}
                <rect x="150" y="70" width="25" height="40" rx="3" fill="#374151" />
                <rect x="153" y="75" width="19" height="30" rx="1" fill="#60a5fa" />
                {/* Car icon */}
                <rect x="50" y="155" width="30" height="15" rx="3" fill="#ef4444" />
                <circle cx="58" cy="170" r="4" fill="#1a1a1a" />
                <circle cx="72" cy="170" r="4" fill="#1a1a1a" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
              Toque em Verificar Agora para iniciar o Processo de Reconhecimento Facial.
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-500 text-center mb-8 max-w-[280px]">
              Ao prosseguir, você declara a ciência sobre nossa Política de Privacidade. Você pode acessá-la em nosso site ou no aplicativo.
            </p>
          </div>

          {/* Footer */}
          <div className="px-4 py-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-4">
              Ao tocar no botão, você concorda com nossa Política de Reconhecimento Facial de Motoristas
            </p>
            <button 
              onClick={handleVerifyNow}
              className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold text-lg py-4 rounded-xl transition-colors"
            >
              Verificar Agora
            </button>
          </div>
        </div>
      )}

      {/* Facial Recognition Scan Screen */}
      {connectionState === "facial-scan" && (
        <div className="absolute inset-0 bg-white z-[70] flex flex-col">
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-[#1a1a1a]">
            <button onClick={() => setConnectionState("idle")} className="flex items-center gap-2 text-white">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Reconhecimento facial</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
            {/* Circular Face Frame */}
            <div className="relative w-64 h-64 mb-8">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-[#3b82f6] animate-pulse" />
              {/* Inner circle with face */}
              <div className="absolute inset-2 rounded-full overflow-hidden border-4 border-[#93c5fd]">
                <Image
                  src={profile.photo}
                  alt="Face"
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Instructions */}
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Olhe diretamente para a câmera
            </h2>
            <p className="text-lg text-[#ec4899] text-center italic mb-8">
              Olhe diretamente para a câmera
            </p>

            {/* Loading Spinner */}
            <Loader2 className="w-10 h-10 text-[#3b82f6] animate-spin" />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

function MenuItem({ label, hasNotification, onClick, loading }: { label: string; hasNotification?: boolean; onClick?: () => void; loading?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 text-left"
    >
      <span className="text-[18px] text-black font-semibold flex items-center gap-2">
        {label}
        {hasNotification && <div className="w-2 h-2 bg-red-500 rounded-full" />}
      </span>
      {loading && (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      )}
    </button>
  )
}
