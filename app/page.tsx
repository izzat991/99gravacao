"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

interface RideRequest {
  id: string
  price: number
  pricePerKm: number
  included: number
  bonus: number
  rating: number
  totalRides: number
  profile: string
  pickupTime: number
  pickupDistance: number
  pickupAddress: string
  dropoffTime: number
  dropoffDistance: number
  dropoffAddress: string
}

type ConnectionState = "idle" | "loading" | "facial-intro" | "facial-scan" | "searching"

// Random street names for generating fake addresses
const streetNames = [
  "R. Julien Fauvel",
  "R. São Sebastião",
  "Av. Brasil",
  "R. das Flores",
  "Av. Paulista",
  "R. Augusta",
  "R. Oscar Freire",
  "Av. Rebouças",
  "R. Consolação",
  "R. Haddock Lobo"
]

const neighborhoods = [
  "Nucleo Res Silvio Vilari",
  "Parque Santa Monica",
  "Centro",
  "Jardins",
  "Vila Mariana",
  "Pinheiros",
  "Moema",
  "Itaim Bibi"
]

function generateRandomRide(vehicleType: "moto" | "carro"): RideRequest {
  const minPrice = vehicleType === "moto" ? 5 : 13
  const maxPrice = vehicleType === "moto" ? 20 : 45
  const price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice
  const pricePerKm = (Math.random() * 1.5 + 1).toFixed(2)
  
  return {
    id: Date.now().toString(),
    price: price,
    pricePerKm: parseFloat(pricePerKm),
    included: Math.random() > 0.5 ? parseFloat((Math.random() * 0.5).toFixed(2)) : 0,
    bonus: parseFloat((Math.random() * 5).toFixed(2)),
    rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(2)),
    totalRides: Math.floor(Math.random() * 200) + 10,
    profile: "Perfil Essencial",
    pickupTime: Math.floor(Math.random() * 10) + 3,
    pickupDistance: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
    pickupAddress: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${Math.floor(Math.random() * 500) + 100}, ${neighborhoods[Math.floor(Math.random() * neighborhoods.length)]}`,
    dropoffTime: Math.floor(Math.random() * 15) + 5,
    dropoffDistance: parseFloat((Math.random() * 5 + 1).toFixed(1)),
    dropoffAddress: `${streetNames[Math.floor(Math.random() * streetNames.length)]} ${Math.floor(Math.random() * 3000) + 100}, ${neighborhoods[Math.floor(Math.random() * neighborhoods.length)]}`
  }
}

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
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null)
  const [rideVisible, setRideVisible] = useState(false)
  const [rideDismissing, setRideDismissing] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Handle search timer for generating rides
  useEffect(() => {
    if (connectionState === "searching" && !currentRide) {
      searchTimerRef.current = setTimeout(() => {
        const vehicleType = vehicles[0]?.type || "moto"
        const ride = generateRandomRide(vehicleType)
        setCurrentRide(ride)
        // Trigger slide-in animation
        setTimeout(() => setRideVisible(true), 50)
      }, 8000)
      
      return () => {
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current)
        }
      }
    }
  }, [connectionState, currentRide, vehicles])

  // Dismiss ride with fade out
  const dismissRide = useCallback(() => {
    setRideDismissing(true)
    setTimeout(() => {
      setCurrentRide(null)
      setRideVisible(false)
      setRideDismissing(false)
    }, 300)
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
    if (connectionState === "searching") {
      // If already searching, go back to idle
      setConnectionState("loading")
      setTimeout(() => {
        setConnectionState("idle")
        setCurrentRide(null)
        setRideVisible(false)
      }, 1500)
      return
    }
    
    setConnectionState("loading")
    setTimeout(() => {
      setConnectionState("facial-intro")
    }, 2000)
  }

  const handleVerifyNow = () => {
    setConnectionState("facial-scan")
    setScanProgress(0)
    
    // Longer scan duration - 6 seconds
    const duration = 6000
    const startTime = Date.now()
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      setScanProgress(progress)
      
      if (progress < 100) {
        requestAnimationFrame(animateProgress)
      } else {
        setTimeout(() => {
          setConnectionState("searching")
        }, 500)
      }
    }
    
    requestAnimationFrame(animateProgress)
  }

  // Get active vehicle type for menu display
  const activeVehicle = vehicles[0]
  const routeLabel = activeVehicle?.type === "carro" ? "Rota 99 Carro" : "Rota 99 Moto"

  return (
    <div className="relative h-screen w-full max-w-[430px] mx-auto overflow-hidden bg-[#f5f0e8]">
      {/* Header - Hide when ride is showing */}
      {!currentRide && (
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
      )}

      {/* Close button when ride is showing */}
      {currentRide && (
        <button 
          onClick={dismissRide}
          className={`absolute top-4 right-4 z-30 w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center transition-opacity duration-300 ${rideDismissing ? 'opacity-0' : 'opacity-100'}`}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

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

        {/* Yellow Hexagon Overlay - 7 hexagons closer together */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 430 932" preserveAspectRatio="xMidYMid slice">
            {/* Hexagon 1 - Left top */}
            <polygon points="30,180 90,140 150,180 150,260 90,300 30,260" fill="rgba(255,227,80,0.55)" />
            
            {/* Hexagon 2 - Center top - adjacent to 1 */}
            <polygon points="150,180 210,140 270,180 270,260 210,300 150,260" fill="rgba(255,210,50,0.5)" />
            
            {/* Hexagon 3 - Right top - adjacent to 2 */}
            <polygon points="270,180 330,140 390,180 390,260 330,300 270,260" fill="rgba(255,227,80,0.45)" />
            
            {/* Hexagon 4 - Left middle - below 1 */}
            <polygon points="90,300 150,260 210,300 210,380 150,420 90,380" fill="rgba(255,200,40,0.5)" />
            
            {/* Hexagon 5 - Center - adjacent to 4 */}
            <polygon points="210,300 270,260 330,300 330,380 270,420 210,380" fill="rgba(255,227,80,0.6)" />
            
            {/* Hexagon 6 - Left bottom - below 4 */}
            <polygon points="30,420 90,380 150,420 150,500 90,540 30,500" fill="rgba(255,210,50,0.55)" />
            
            {/* Hexagon 7 - Center bottom - adjacent to 6 */}
            <polygon points="150,420 210,380 270,420 270,500 210,540 150,500" fill="rgba(255,227,80,0.5)" />
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

      {/* Ride Request Card */}
      {currentRide && (
        <div 
          className={`absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 transition-all duration-200 ease-out ${
            rideVisible && !rideDismissing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          } ${rideDismissing ? 'opacity-0' : ''}`}
        >
          {/* Ride Details Card */}
          <div className="bg-[#1a1a1a] rounded-2xl p-5">
            {/* Corrida longa label */}
            <div className="flex justify-center mb-3">
              <span className="bg-[#22c55e] text-white text-xs font-medium px-3 py-1 rounded-full">
                Corrida longa
              </span>
            </div>
            
            {/* Price */}
            <div className="text-center mb-2">
              <div className="text-4xl font-bold text-white">
                R${currentRide.price.toFixed(2).replace(".", ",")}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                R${currentRide.pricePerKm.toFixed(2).replace(".", ",")} por km
              </div>
            </div>
            
            {/* Badges - x2,0 and included */}
            <div className="flex justify-center gap-3 mb-4">
              <span className="bg-[#15803d] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="text-[#4ade80]">●</span>
                x2,0
              </span>
              <span className="bg-[#854d0e] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="text-[#fbbf24]">●</span>
                R${(currentRide.price * 0.3).toFixed(2).replace(".", ",")} incluídos
              </span>
            </div>
            
            {/* Rating, rides and verification */}
            <div className="flex items-center justify-center gap-2 mb-4 text-white text-sm">
              <span className="flex items-center gap-1">
                <span className="text-[#22c55e]">●</span>
                {currentRide.rating}
              </span>
              <span className="text-gray-500">·</span>
              <span>{currentRide.totalRides} corridas</span>
              <span className="text-gray-500">·</span>
              <span className="flex items-center gap-1.5">
                <span className="bg-[#3b82f6] text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Cartão Verif.
                </span>
              </span>
            </div>
            
            {/* Pickup Location */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-3 h-3 bg-[#22c55e] rounded-full mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">
                  {currentRide.pickupTime}Min ({currentRide.pickupDistance}km)
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  {currentRide.pickupAddress}
                </div>
              </div>
            </div>
            
            {/* Dropoff Location */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-[#ef4444] rounded-full mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm flex items-center gap-2 flex-wrap">
                  <span>{currentRide.dropoffTime}Min ({currentRide.dropoffDistance}km)</span>
                  <span className="bg-[#ef4444] text-white text-[10px] px-2 py-0.5 rounded">
                    Área de risco
                  </span>
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  {currentRide.dropoffAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section - White background covering both banner and nav - Hide when ride is showing */}
      {!currentRide && (
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
          <div className="px-4 py-2 flex items-center justify-center gap-1">
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

            {/* Connect/Loading/Searching Button */}
            {connectionState === "loading" ? (
              <div className="mx-1 min-w-[180px] bg-white text-gray-600 font-bold text-lg py-4 rounded-full flex flex-col items-center justify-center">
                <span>Carregando...</span>
                <div className="flex gap-1.5 mt-1">
                  <div className="w-2.5 h-2.5 bg-[#ffe323] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2.5 h-2.5 bg-[#ffe323] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2.5 h-2.5 bg-[#ffe323] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            ) : connectionState === "searching" ? (
              <button 
                onClick={handleConnect}
                className="mx-1 min-w-[180px] relative overflow-hidden bg-transparent text-[#1a1a1a] font-bold text-xl py-4 rounded-full"
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe323]/70 to-transparent animate-shimmer-wave" />
                </div>
                <span className="relative z-10">Buscando</span>
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                className="mx-1 min-w-[180px] bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-xl py-4 rounded-full transition-colors shadow-sm"
              >
                Conectar
              </button>
            )}

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
      )}

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
                    <div className="w-24 h-20 flex items-center justify-center">
                      <Image
                        src={vehicle.type === "moto" ? "/images/icon-moto.png" : "/images/icon-car.png"}
                        alt={vehicle.type === "moto" ? "Moto" : "Carro"}
                        width={96}
                        height={80}
                        style={{ width: "auto", height: "100%" }}
                        className="object-contain"
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
            {/* Illustration - Using the new image */}
            <div className="w-72 h-72 mb-8">
              <Image
                src="/images/verify-illustration.png"
                alt="Verificação facial"
                width={288}
                height={288}
                className="w-full h-full object-contain"
              />
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
            {/* Simple circular face frame with loading ring */}
            <div className="relative w-64 h-64 mb-8">
              {/* Progress ring (loading circle) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
                {/* Background circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - scanProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                />
              </svg>
              
              {/* Inner circle with face */}
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-[#93c5fd]">
                <Image
                  src={profile.photo}
                  alt="Face"
                  width={224}
                  height={224}
                  className="w-full h-full object-cover"
                />
                
                {/* Scanning line descending */}
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"
                  style={{ 
                    top: `${(scanProgress / 100) * 100}%`,
                    boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.5)'
                  }}
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
        @keyframes shimmer-wave {
          0% {
            transform: translateX(-200%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer-wave {
          animation: shimmer-wave 2s infinite;
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

function MenuItem({ label, hasNotification, onClick, loading }: { 
  label: string
  hasNotification?: boolean
  onClick?: () => void
  loading?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full py-3.5 border-b border-gray-50"
    >
      <span className="text-[15px] text-gray-800">{label}</span>
      <div className="flex items-center gap-2">
        {loading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        )}
        {hasNotification && (
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  )
}
