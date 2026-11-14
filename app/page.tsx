"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Star, Check, Camera, Loader2, Settings, Phone, Mail, MapPin, Lock, FileText, Monitor, Target, RefreshCw, ChevronUp, BarChart3, Menu, UsersRound, Crosshair, Layers2, TriangleAlert, SlidersHorizontal, ClipboardCheck, ShieldCheck, Zap, Percent, Navigation } from "lucide-react"
import Image from "next/image"
import { TokenGate } from "@/components/TokenGate"
import { DriverMap } from "@/components/DriverMap"

interface Vehicle {
  id: string
  type: "moto" | "carro" | "bike"
  placa: string
  nome: string
  cor: string
}

interface UserProfile {
  name: string
  photo: string
  phoneNumber: string
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

// Random street names for generating fake addresses - Fortaleza, CE
const streetNames = [
  "Av. Beira Mar",
  "R. Monsenhor Tabosa",
  "Av. Domingos Olímpio",
  "R. Padre Valdevino",
  "Av. Santos Dumont",
  "R. Barão de Aracati",
  "Av. Abolição",
  "R. Desembargador Moreira",
  "Av. Pontes Vieira",
  "R. Floriano Peixoto",
  "Av. Bezerra de Menezes",
  "R. Pedro Borges"
]

const neighborhoods = [
  "Aldeota",
  "Meireles",
  "Centro",
  "Praia de Iracema",
  "Varjota",
  "Fátima",
  "Dionísio Torres",
  "Papicu",
  "Mucuripe",
  "Benfica",
  "Montese",
  "Parquelândia"
]

// Fixed pickup location: R. Gen. Clarindo de Queiroz, 47 - Centro, Fortaleza - CE
const FIXED_MAP_LOCATION = {
  latitude: -3.7346418,
  longitude: -38.5248878,
  address: "R. Gen. Clarindo de Queiroz, 47 - Centro, Fortaleza - CE, 60035-130",
}

function MapControl({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div aria-label={label} className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center text-[#252525]">
      {icon}
    </div>
  )
}

function SettingsItem({ icon, label, value, badge }: { 
  icon: React.ReactNode
  label: string
  value?: string
  badge?: string
}) {
  return (
    <button className="flex items-center justify-between w-full py-4 border-b border-gray-50">
      <div className="flex items-center gap-4">
        {icon}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-900">{label}</span>
            {badge && <span className="text-sm text-red-500 font-medium">{badge}</span>}
          </div>
          {value && <div className="text-sm text-gray-500">{value}</div>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  )
}

function generateRandomRide(vehicleType: "moto" | "carro" | "bike", maxPriceLimit?: number): RideRequest {
  let minPrice: number
  let maxPrice: number
  
  if (vehicleType === "bike") {
    minPrice = 4
    maxPrice = maxPriceLimit || 8
  } else if (vehicleType === "carro") {
    minPrice = 13
    maxPrice = maxPriceLimit || 45
  } else {
    minPrice = 5
    maxPrice = maxPriceLimit || 20
  }
  
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
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const [vehicleLoading, setVehicleLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [driverProfileOpen, setDriverProfileOpen] = useState(false)
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    name: "Yuri",
    photo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-RfRScspSGHgwcvwdNpPr6mhGL18tWj.png",
    phoneNumber: "(88) 9837182-3918"
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [configSolicitacoesOpen, setConfigSolicitacoesOpen] = useState(false)
  const [solicitacaoToggles, setSolicitacaoToggles] = useState({
    moto: true,
    entregaMoto: false,
    entregaMotoEmpresas: false,
    entregaFood: false
  })
  const [statusTestOpen, setStatusTestOpen] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [testComplete, setTestComplete] = useState(false)
  const [testItems, setTestItems] = useState([
    { label: "Status de internet", status: "pending" as "pending" | "loading" | "done" },
    { label: "Localização", status: "pending" as "pending" | "loading" | "done" },
    { label: "Status do perfil", status: "pending" as "pending" | "loading" | "done" },
    { label: "Análise de documentos", status: "pending" as "pending" | "loading" | "done" },
    { label: "Status da solicitação", status: "pending" as "pending" | "loading" | "done" },
    { label: "Configurações da solicitação", status: "pending" as "pending" | "loading" | "done" },
  ])
  const [newVehicle, setNewVehicle] = useState({
    type: "moto" as "moto" | "carro" | "bike",
    placa: "",
    nome: "",
    cor: ""
  })
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle")
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null)
  const [rideVisible, setRideVisible] = useState(false)
  const [rideDismissing, setRideDismissing] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [rideCountdown, setRideCountdown] = useState(100)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Splash screen timer with fadeout
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFading(true)
    }, 2000)
    const hideTimer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  // Unlock audio on first user interaction (required for iOS)
  // This only loads the audio, doesn't play any sound
  const audioUnlockedRef = useRef(false)
  
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && !audioUnlockedRef.current) {
        audioUnlockedRef.current = true
        // Just load the audio without playing
        audioRef.current.load()
      }
    }
    
    document.addEventListener('touchstart', unlockAudio, { once: true })
    document.addEventListener('click', unlockAudio, { once: true })
    
    return () => {
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('click', unlockAudio)
    }
  }, [])

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
        // Se for bike com entregaFood ativa, limitar preço a R$ 8,00
        const maxPriceLimit = vehicleType === "bike" && solicitacaoToggles.entregaFood ? 8 : undefined
        const ride = generateRandomRide(vehicleType, maxPriceLimit)
        setCurrentRide(ride)
        setRideCountdown(100)
        // Trigger slide-in animation
        setTimeout(() => setRideVisible(true), 50)
        
        // Start playing sound in loop (iOS requires user interaction first)
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.loop = true
          audioRef.current.volume = 1
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log("[v0] Audio play failed:", error)
            })
          }
        }
      }, 8000)
      
      return () => {
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current)
        }
      }
    }
  }, [connectionState, currentRide, vehicles, solicitacaoToggles])

  // Stop sound when ride is dismissed
  useEffect(() => {
    if (!currentRide && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [currentRide])

  // Dismiss ride with fade out - defined with no dependencies so it's stable
  const dismissRide = useCallback(() => {
    setRideDismissing(true)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setTimeout(() => {
      setCurrentRide(null)
      setRideVisible(false)
      setRideDismissing(false)
    }, 300)
  }, [])

  // Countdown timer for ride card - 10 seconds to expire
  useEffect(() => {
    if (currentRide && rideVisible && !rideDismissing) {
      const startTime = Date.now()
      const duration = 10000 // 10 seconds
      
      const animateCountdown = () => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setRideCountdown(remaining)
        
        if (remaining > 0) {
          countdownRef.current = setTimeout(animateCountdown, 50)
        } else {
          // Countdown finished, dismiss the ride
          setRideDismissing(true)
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
          setTimeout(() => {
            setCurrentRide(null)
            setRideVisible(false)
            setRideDismissing(false)
          }, 300)
        }
      }
      
      countdownRef.current = setTimeout(animateCountdown, 50)
      
      return () => {
        if (countdownRef.current) {
          clearTimeout(countdownRef.current)
        }
      }
    }
  }, [currentRide, rideVisible, rideDismissing])

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
    setEditPhone(profile.phoneNumber)
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
    setNewVehicle({ type: "moto" as "moto" | "carro" | "bike", placa: "", nome: "", cor: "" })
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
    const newProfile = { ...profile, name: editName, phoneNumber: editPhone }
    setProfile(newProfile)
    localStorage.setItem("profile", JSON.stringify(newProfile))
    setProfileOpen(false)
  }

  const startStatusTest = () => {
    setStatusTestOpen(true)
    setTestProgress(0)
    setTestComplete(false)
    setTestItems([
      { label: "Status de internet", status: "pending" },
      { label: "Localização", status: "pending" },
      { label: "Status do perfil", status: "pending" },
      { label: "Análise de documentos", status: "pending" },
      { label: "Status da solicitação", status: "pending" },
      { label: "Configurações da solicitação", status: "pending" },
    ])
    
    // Start the test sequence
    const runTest = (index: number) => {
      if (index >= 6) {
        setTestComplete(true)
        return
      }
      
      // Set current item to loading
      setTestItems(prev => prev.map((item, i) => 
        i === index ? { ...item, status: "loading" } : item
      ))
      setTestProgress(index + 1)
      
      // After delay, mark as done and move to next
      setTimeout(() => {
        setTestItems(prev => prev.map((item, i) => 
          i === index ? { ...item, status: "done" } : item
        ))
        runTest(index + 1)
      }, 800)
    }
    
    setTimeout(() => runTest(0), 500)
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
  const routeLabel = activeVehicle?.type === "carro" ? "Rota 99 Carro" : activeVehicle?.type === "bike" ? "Rota 99 Bike" : "Rota 99 Moto"

  return (
    <TokenGate appCode="9P">
    <div className="relative w-full max-w-[430px] mx-auto overflow-hidden bg-[#f5f0e8] flex-1 flex flex-col">
      {/* Audio element for ride notification - playsInline for iOS */}
      <audio 
        ref={audioRef} 
        src="/sounds/ride-notification.mp3" 
        preload="auto"
        playsInline
        webkit-playsinline="true"
      />

      {/* Splash Screen with fadeout */}
      {showSplash && (
        <div 
          className={`absolute inset-0 z-[100] bg-[#ffe323] flex items-center justify-center transition-opacity duration-500 ${splashFading ? 'opacity-0' : 'opacity-100'}`}
        >
          <span className="text-[120px] font-black text-[#1a1a1a] tracking-tight">99</span>
        </div>
      )}

      {/* Header - Hide when ride is showing */}
      {!currentRide && (
        <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-center px-4 pt-2">
          {/* Menu Button - Top Left */}
          <button 
            onClick={() => setMenuOpen(true)}
            className="absolute left-4 top-2 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md"
            aria-label="Abrir menu"
          >
            {/* Red dot indicator - Right side */}
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
            {/* Menu Icon */}
            <Menu className="w-[22px] h-[22px] text-[#202020]" strokeWidth={3} />
          </button>

          {/* Balance - Centered */}
          <button className="flex items-center gap-1.5 bg-[#06182b] text-white px-5 h-11 rounded-full text-[18px] font-bold shadow-md">
            R$0,00
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="absolute right-3 top-0 w-9 h-9 rounded-full bg-white/85 shadow-sm flex items-center justify-center text-gray-500" aria-label="Usuários">
            <UsersRound className="w-5 h-5" strokeWidth={2.8} />
          </div>
          <div className="absolute top-[58px] left-1/2 -translate-x-1/2 h-7 px-2 rounded-full bg-[#ffe323] shadow-md flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[#202020]">
            <span className="rounded-full bg-[#ff592d] text-white w-4 h-4 flex items-center justify-center"><Percent className="w-3 h-3" /></span>
            <span>0% de Taxa</span><span className="ml-2">Ativo</span><ChevronRight className="w-3.5 h-3.5 text-[#f57b00]" />
          </div>
        </div>
      )}

      {/* Close button when ride is showing */}
      {currentRide && (
        <button 
          onClick={dismissRide}
          className={`absolute right-4 top-4 z-30 w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center transition-opacity duration-300 ${rideDismissing ? 'opacity-0' : 'opacity-100'}`}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Only the map moves when dragged. */}
      <div className="absolute inset-0">
        <DriverMap location={FIXED_MAP_LOCATION} onReady={() => {}} />
      </div>
      {/* Screen-fixed marker, outside the map's canvas and drag transforms. */}
      <div className="absolute left-1/2 top-1/2 z-[21] -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-label={FIXED_MAP_LOCATION.address}>
        <div className="w-9 h-9 rounded-full border-2 border-[#2789ff] bg-white flex items-center justify-center shadow-[0_1px_5px_rgba(0,0,0,0.2)]">
          <Navigation className="w-5 h-5 text-[#2789ff] fill-[#2789ff]" strokeWidth={1.5} />
        </div>
      </div>

      {!currentRide && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute right-3 top-[29%] flex flex-col gap-3 items-center">
            <MapControl label="Usuários" icon={<UsersRound className="w-5 h-5" strokeWidth={2.8} />} />
            <MapControl label="Centralizar mapa" icon={<Crosshair className="w-6 h-6" strokeWidth={2.5} />} />
            <MapControl label="Alertas" icon={<TriangleAlert className="w-5 h-5 text-[#222] fill-[#ffdd28]" strokeWidth={2.5} />} />
          </div>
          <div className="absolute left-4 bottom-[min(55%,390px)] bg-white rounded-full shadow-sm px-3 py-1.5 flex items-center gap-1 text-[13px] font-bold text-[#252525]">
            <Zap className="w-4 h-4 fill-[#252525]" /> 1,1X-1,3X
          </div>
          <div className="absolute right-3 bottom-[min(42%,300px)]">
            <MapControl label="Camadas do mapa" icon={<Layers2 className="w-6 h-6" strokeWidth={2.4} />} />
          </div>
          <div className="absolute left-4 right-14 bottom-[min(42%,300px)] h-11 rounded-full bg-white shadow-sm flex items-center px-3 gap-2 text-[#3189ed] text-[13px] leading-tight">
            <ShieldCheck className="w-6 h-6 flex-none fill-[#3189ed] text-white" strokeWidth={2} />
            <span>Olá! A segurança da 99 está com você</span>
            <ChevronRight className="w-4 h-4 flex-none ml-auto" />
          </div>
        </div>
      )}

      {/* Ride Request Card */}
      {currentRide && (
        <div 
          className={`absolute bottom-0 left-0 right-0 z-20 px-4 transition-all duration-200 ease-out ${
            rideVisible && !rideDismissing ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          } ${rideDismissing ? 'opacity-0' : ''}`}
        >
          {/* Ride Details Card */}
          <div className="bg-[#1a1a1a] rounded-2xl p-6">
            {/* Price */}
            <div className="text-center mb-3">
              <div className="text-5xl font-bold text-white">
                R${currentRide.price.toFixed(2).replace(".", ",")}
              </div>
              <div className="text-gray-400 text-sm mt-2">
                R${currentRide.pricePerKm.toFixed(2).replace(".", ",")} por km
              </div>
            </div>
            
            {/* Badge - included */}
            <div className="flex justify-center gap-3 mb-4">
              <span className="bg-[#854d0e] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="text-[#fbbf24]">●</span>
                R${(currentRide.price * 0.3).toFixed(2).replace(".", ",")} incluídos
              </span>
            </div>
            
            {/* Orange countdown bar */}
            <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full bg-[#f97316] rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${rideCountdown}%` }}
              />
            </div>
            
            {/* Rating, rides and verification */}
            <div className="flex items-center justify-center gap-2 mb-5 text-white text-sm">
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
            <div className="flex items-start gap-3 mb-4">
              <div className="w-3 h-3 bg-[#22c55e] rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-base">
                  {currentRide.pickupTime}Min ({currentRide.pickupDistance}km)
                </div>
                <div className="text-gray-400 text-sm leading-relaxed mt-1">
                  {currentRide.pickupAddress}
                </div>
              </div>
            </div>
            
            {/* Dropoff Location */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-[#ef4444] rounded-full mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-base">
                  {currentRide.dropoffTime}Min ({currentRide.dropoffDistance}km)
                </div>
                <div className="text-gray-400 text-sm leading-relaxed mt-1">
                  {currentRide.dropoffAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section - White background covering both banner and nav - Hide when ride is showing */}
      {!currentRide && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-[28px] pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
          <div className="w-11 h-1 bg-[#b9b9b9] rounded-full mx-auto mb-2" />
          {/* Promotional Banner */}
          {showBanner && (
            <div className="mx-3 relative mb-3 rounded-[22px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] min-h-[104px] px-4 py-4 flex items-center">
              <button
                onClick={() => setShowBanner(false)}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10"
                aria-label="Fechar promoção"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
              <div className="pr-20">
                <p className="text-[14px] leading-[17px] font-bold text-[#373737]">Expirado. Renove para ganhar mais!</p>
                <span className="inline-block mt-2 bg-[#f6f6f6] rounded-xl px-4 py-1 text-[13px] font-bold text-[#252525]">Renovar</span>
              </div>
              <div className="absolute right-7 bottom-5 w-12 h-12 rounded-full bg-[#e8c900] flex items-center justify-center rotate-[-15deg] shadow-sm" aria-hidden="true"><Percent className="w-7 h-7 text-[#211900]" strokeWidth={3} /></div>
            </div>
          )}

          {/* Bottom Navigation Bar */}
          <div className="px-4 py-1 flex items-center justify-between gap-2">
            {/* Settings Icon */}
            <button onClick={() => setPreferencesOpen(true)} className="w-11 h-12 flex-none flex items-center justify-center relative" aria-label="Preferências">
              <SlidersHorizontal className="w-7 h-7 text-[#373737]" strokeWidth={2.6} />
              <span className="absolute top-1 right-0 w-2 h-2 bg-[#f63363] rounded-full" />
            </button>

            {/* Connect/Loading/Searching Button */}
            {connectionState === "loading" ? (
              <div className="flex-1 bg-white text-gray-600 font-bold text-lg py-3 rounded-[20px] flex flex-col items-center justify-center">
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
                className="flex-1 relative overflow-hidden bg-transparent text-[#1a1a1a] font-bold text-xl py-3 rounded-[20px]"
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe323]/70 to-transparent animate-shimmer-wave" />
                </div>
                <span className="relative z-10">Buscando</span>
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                className="flex-1 bg-[#ffe323] hover:bg-[#f5d800] text-[#1a1a1a] font-bold text-[24px] py-3 rounded-[20px] transition-colors shadow-sm"
              >
                Conectar
              </button>
            )}

            {/* Message Icon */}
            <button className="w-11 h-12 flex-none flex items-center justify-center" aria-label="Solicitações">
              <ClipboardCheck className="w-7 h-7 text-[#373737]" strokeWidth={2.4} />
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
          <div className="flex flex-col items-center pb-6 px-6 pt-12">
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
                  <button 
                    onClick={() => setDriverProfileOpen(true)}
                    className="mt-4 flex items-center gap-1 bg-[#292444] text-white px-5 py-2.5 rounded-full text-sm font-medium"
                  >
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
                    src={vehicle.type === "moto" ? "/images/icon-moto.png" : vehicle.type === "bike" ? "/images/icon-bike.png" : "/images/icon-car.png"}
                    alt={vehicle.type === "moto" ? "Moto" : vehicle.type === "bike" ? "Bike" : "Carro"}
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
              <button
                onClick={() => setNewVehicle({ ...newVehicle, type: "bike" })}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  newVehicle.type === "bike" 
                    ? "bg-[#292444] text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Bike
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

      {/* Driver Profile Page */}
      <div className={`absolute top-0 left-0 h-full w-full bg-white z-50 transition-transform duration-300 ease-out ${driverProfileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
            <button onClick={() => setDriverProfileOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Perfil</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="p-2">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="flex flex-col items-center px-6 py-8">
            {/* Photo */}
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
              <Image
                src={profile.photo}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Name */}
            <h1 className="text-xl font-bold text-gray-900 uppercase mb-3">{profile.name}</h1>

            {/* Ver perfil público */}
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 mb-6">
              Ver perfil público
            </button>

            {/* Stats */}
            <div className="flex items-center gap-12 mb-8">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-500">Corridas</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">1</div>
                <div className="text-sm text-gray-500">Dia</div>
              </div>
            </div>
          </div>

          {/* Avaliação Section */}
          <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">Avaliação 0.00</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <button className="flex items-center gap-1 text-sm text-gray-500">
                Como funciona
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Média das 100 últimas avaliações de corridas</p>

            {/* Rating Bars */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">5</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">4</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">3</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">2</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">1</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Page */}
      <div className={`absolute top-0 left-0 h-full w-full bg-white z-[55] transition-transform duration-300 ease-out ${settingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
            <button onClick={() => setSettingsOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Configurações</span>
            </button>
          </div>

          {/* Settings Content */}
          <div className="px-6 py-6">
            {/* Informações pessoais */}
            <h2 className="text-base font-bold text-gray-900 mb-4">Informações pessoais</h2>
            
            <SettingsItem 
              icon={<div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <Image
                  src={profile.photo}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover object-center"
                />
              </div>}
              label="Foto de perfil"
            />
            
            <SettingsItem 
              icon={<Phone className="w-5 h-5 text-gray-600" />}
              label="Número de telefone"
              value={profile.phoneNumber}
              badge="(Confirmar Numero)"
            />
            
            <SettingsItem 
              icon={<Mail className="w-5 h-5 text-gray-600" />}
              label="maxcontas1829@gmail.com"
            />
            
            <SettingsItem 
              icon={<MapPin className="w-5 h-5 text-gray-600" />}
              label="Cidade"
              value="Fortaleza"
            />
            
            <SettingsItem 
              icon={<Lock className="w-5 h-5 text-gray-600" />}
              label="Senha"
            />

            {/* Gerenciamento de perfil */}
            <h2 className="text-base font-bold text-gray-900 mb-4 mt-8">Gerenciamento de perfil</h2>
            
            <SettingsItem 
              icon={<FileText className="w-5 h-5 text-gray-600" />}
              label="Documentos pendentes"
            />
            
            <SettingsItem 
              icon={<Monitor className="w-5 h-5 text-gray-600" />}
              label="Gestão de dispositivo"
            />
          </div>
        </div>
      </div>

      {/* Preferences Page */}
      <div className={`absolute top-0 left-0 h-full w-full bg-gray-50 z-[56] transition-transform duration-300 ease-out ${preferencesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
            <button onClick={() => setPreferencesOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Preferências de solicitações</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="px-6 py-6">
              {/* Preferências de solicitações */}
              <h2 className="text-base font-bold text-gray-900 mb-4">Preferências de solicitações</h2>
              
              <div className="bg-white rounded-xl overflow-hidden mb-6">
                <button className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-gray-600" />
                    <span className="text-base text-gray-900">Definir meu destino</span>
                  </div>
                  <div className="w-12 h-7 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </button>
                <button 
                  onClick={() => setConfigSolicitacoesOpen(true)}
                  className="flex items-center justify-between w-full px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="text-base text-gray-900">Configurar solicitações</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Assistente de ganhos */}
              <h2 className="text-base font-bold text-gray-900 mb-4">Assistente de ganhos</h2>
              
              <div className="bg-white rounded-xl overflow-hidden">
                <button 
                  onClick={startStatusTest}
                  className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                    <span className="text-base text-gray-900">Teste de status</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button className="flex items-center justify-between w-full px-4 py-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <span className="text-base text-gray-900">Eventos futuros</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configurar Solicitações Page */}
      <div className={`absolute top-0 left-0 h-full w-full bg-gray-50 z-[57] transition-transform duration-300 ease-out ${configSolicitacoesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-white border-b border-gray-100">
            <button onClick={() => setConfigSolicitacoesOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Configurar solicitações</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="px-6 py-6">
              {/* Preferências de solicitações */}
              <h2 className="text-base font-bold text-gray-900 mb-1">Preferências de solicitações</h2>
              <p className="text-sm text-gray-500 mb-4">Selecione quais tipos de solicitação você quer receber</p>
              
              <div className="bg-white rounded-xl overflow-hidden mb-6">
                {/* Moto - só aparece se não for bike */}
                {activeVehicle?.type !== "bike" && (
                  <button 
                    onClick={() => setSolicitacaoToggles(prev => ({ ...prev, moto: !prev.moto }))}
                    className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
                  >
                    <span className="text-base text-gray-900">Moto</span>
                    <div className={`w-12 h-7 rounded-full relative transition-colors ${solicitacaoToggles.moto ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${solicitacaoToggles.moto ? 'right-1' : 'left-1'}`} />
                    </div>
                  </button>
                )}

                {/* Entrega Moto - só aparece se não for bike */}
                {activeVehicle?.type !== "bike" && (
                  <button 
                    onClick={() => setSolicitacaoToggles(prev => ({ ...prev, entregaMoto: !prev.entregaMoto }))}
                    className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
                  >
                    <span className="text-base text-gray-900">Entrega Moto</span>
                    <div className={`w-12 h-7 rounded-full relative transition-colors ${solicitacaoToggles.entregaMoto ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${solicitacaoToggles.entregaMoto ? 'right-1' : 'left-1'}`} />
                    </div>
                  </button>
                )}

                {/* Entrega Moto Empresas - só aparece se não for bike */}
                {activeVehicle?.type !== "bike" && (
                  <button 
                    onClick={() => setSolicitacaoToggles(prev => ({ ...prev, entregaMotoEmpresas: !prev.entregaMotoEmpresas }))}
                    className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-100"
                  >
                    <span className="text-base text-gray-900">Entrega Moto Empresas</span>
                    <div className={`w-12 h-7 rounded-full relative transition-colors ${solicitacaoToggles.entregaMotoEmpresas ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}>
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${solicitacaoToggles.entregaMotoEmpresas ? 'right-1' : 'left-1'}`} />
                    </div>
                  </button>
                )}

                {/* Entrega Food - sempre aparece */}
                <button 
                  onClick={() => setSolicitacaoToggles(prev => ({ ...prev, entregaFood: !prev.entregaFood }))}
                  className="flex items-center justify-between w-full px-4 py-4"
                >
                  <span className="text-base text-gray-900">Entrega Food</span>
                  <div className={`w-12 h-7 rounded-full relative transition-colors ${solicitacaoToggles.entregaFood ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${solicitacaoToggles.entregaFood ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </div>

              {/* Outras configurações */}
              <h2 className="text-base font-bold text-gray-900 mb-4">Outras configurações</h2>
              
              <div className="bg-white rounded-xl overflow-hidden">
                <button className="flex items-center justify-between w-full px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-gray-900">Triagem de corridas</span>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-[10px] text-gray-500">i</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Padrão: ativo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Test Page */}
      <div className={`absolute top-0 left-0 h-full w-full bg-gray-50 z-[58] transition-transform duration-300 ease-out ${statusTestOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
            <button onClick={() => setStatusTestOpen(false)} className="flex items-center gap-2 text-gray-800">
              <ChevronLeft className="w-6 h-6" />
              <span className="text-lg font-medium">Teste de status</span>
            </button>
            {testComplete && (
              <button onClick={startStatusTest} className="flex items-center gap-1 text-gray-600 text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Tentar novamente</span>
              </button>
            )}
          </div>

          {/* Progress Circle */}
          <div className="flex-1 flex flex-col items-center px-6 py-8">
            <div className="relative w-48 h-48 mb-8">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(testProgress / 6) * 283} 283`}
                  className="transition-all duration-500"
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {testComplete ? (
                  <>
                    <span className="text-3xl font-bold text-[#22c55e]">Perfeito</span>
                    <span className="text-sm text-gray-500">O melhor status!</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">{testProgress}/6</span>
                    <span className="text-sm text-gray-500">Testando</span>
                  </>
                )}
              </div>
            </div>

            {/* Test Items List */}
            <div className="w-full bg-white rounded-xl overflow-hidden">
              {testComplete && (
                <button className="flex items-center justify-between w-full px-4 py-3 border-b border-gray-100">
                  <span className="font-bold text-gray-900">Testes aprovados</span>
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                </button>
              )}
              {testItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-4 border-b border-gray-50 last:border-0">
                  <span className={`text-base ${item.status === "done" ? "font-medium text-gray-900" : "text-gray-500"}`}>
                    {item.label}
                  </span>
                  {item.status === "loading" ? (
                    <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : item.status === "done" ? (
                    <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Page */}
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
            <div className="w-full max-w-[300px] mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Nome</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 text-center text-lg font-medium"
              />
            </div>

            {/* Phone Input */}
            <div className="w-full max-w-[300px]">
              <label className="block text-sm font-medium text-gray-600 mb-2">Número de Telefone</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(00) 00000-0000"
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


    </div>
    </TokenGate>
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
      className="flex items-center justify-between w-full py-4"
    >
      <span className="text-lg text-gray-800 font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        {loading && (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        )}
        {hasNotification && (
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
        )}
      </div>
    </button>
  )
}
