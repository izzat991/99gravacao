"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

type Location = { latitude: number; longitude: number }
type View = { latitude: number; longitude: number; zoom: number }
type DriverMapProps = { location: Location; onReady: () => void }

const tileSize = 256
const baseMapStyle = "https://tiles.openfreemap.org/styles/positron"
const demandSource = "simulated-demand"
const demandZoom = 13
const demandLabelZoom = 14
const demandGridZoom = 16
const hexRadius = 88
const columnSpacing = 1.5 * hexRadius
const rowSpacing = Math.sqrt(3) * hexRadius
const sectorSize = 3
const demandColors = ["#ffe89a", "#ffdc67", "#ffcd48", "#ffb52d", "#f69324"]
const multiplierLabels = Array.from({ length: 9 }, (_, index) => `${((index + 12) / 10).toFixed(1).replace(".", ",")}x`)

// Stable pseudo-random values from geographic grid coordinates.
function gridRandom(column: number, row: number, seed: number) {
  let hash = Math.imul(column, 0x9e3779b1) ^ Math.imul(row, 0x85ebca77) ^ seed
  hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d)
  hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b)
  return ((hash ^ (hash >>> 16)) >>> 0) / 0x100000000
}

function hexCenter(column: number, row: number) {
  return { x: column * columnSpacing, y: (row + (column & 1) / 2) * rowSpacing }
}

function createDemandZones(west: number, north: number, east: number, south: number) {
  const firstSectorX = Math.floor(west / (columnSpacing * sectorSize)) - 1
  const lastSectorX = Math.floor(east / (columnSpacing * sectorSize)) + 1
  const firstSectorY = Math.floor(north / (rowSpacing * sectorSize)) - 1
  const lastSectorY = Math.floor(south / (rowSpacing * sectorSize)) + 1
  const cells = new Map<string, { column: number; row: number; intensity: number; peak: number }>()

  for (let sectorX = firstSectorX; sectorX <= lastSectorX; sectorX++) {
    for (let sectorY = firstSectorY; sectorY <= lastSectorY; sectorY++) {
      if (gridRandom(sectorX, sectorY, 1) < 0.12) continue
      const centerColumn = sectorX * sectorSize + Math.floor(gridRandom(sectorX, sectorY, 2) * sectorSize)
      const centerRow = sectorY * sectorSize + Math.floor(gridRandom(sectorX, sectorY, 3) * sectorSize)
      const center = hexCenter(centerColumn, centerRow)
      const strength = 12 + Math.floor(gridRandom(sectorX, sectorY, 4) * multiplierLabels.length)
      const reach = rowSpacing * (0.92 + gridRandom(sectorX, sectorY, 5) * 0.59)

      for (let column = centerColumn - 2; column <= centerColumn + 2; column++) {
        for (let row = centerRow - 2; row <= centerRow + 2; row++) {
          const point = hexCenter(column, row)
          if (point.x < west - columnSpacing || point.x > east + columnSpacing ||
              point.y < north - rowSpacing || point.y > south + rowSpacing) continue
          const distance = Math.hypot(point.x - center.x, point.y - center.y)
          const edge = 0.74 + gridRandom(column, row, 6) * 0.36
          if (distance > reach * edge) continue

          const key = `${column},${row}`
          const previous = cells.get(key)
          const intensity = strength - (distance / reach) * 5
          cells.set(key, {
            column, row,
            intensity: Math.max(previous?.intensity ?? 0, intensity),
            peak: distance === 0 ? strength : previous?.peak ?? 0,
          })
        }
      }
    }
  }

  const coordinate = (x: number, y: number): [number, number] => {
    const { longitude, latitude } = unproject(x, y, demandGridZoom)
    return [longitude, latitude]
  }

  return Array.from(cells.values(), ({ column, row, intensity, peak }) => {
    const { x, y } = hexCenter(column, row)
    const outline = Array.from({ length: 6 }, (_, index) => {
      const angle = index * Math.PI / 3
      return coordinate(x + hexRadius * Math.cos(angle), y - hexRadius * Math.sin(angle))
    })
    const color = demandColors[clamp(Math.floor((intensity - 10) / 2), 0, demandColors.length - 1)]
    return {
      center: coordinate(x, y),
      outline: [...outline, outline[0]],
      multiplier: peak ? multiplierLabels[peak - 12] : null,
      color,
    }
  })
}

type DemandZones = ReturnType<typeof createDemandZones>

function updateDemandSource(map: MapLibreMap, zones: DemandZones) {
  map.getSource<GeoJSONSource>(demandSource)?.setData({
    type: "FeatureCollection",
    features: zones.flatMap(({ center, outline, color, multiplier }) => {
      const polygon = {
        type: "Feature" as const,
        geometry: { type: "Polygon" as const, coordinates: [outline] },
        properties: { color },
      }
      if (!multiplier) return [polygon]
      return [
        polygon,
        {
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: center },
          properties: { multiplier },
        },
      ]
    }),
  })
}

function updateVisibleDemand(map: MapLibreMap) {
  if (map.getZoom() < demandZoom) return

  const bounds = map.getBounds()
  const northwest = project({ latitude: bounds.getNorth(), longitude: bounds.getWest() }, demandGridZoom)
  const southeast = project({ latitude: bounds.getSouth(), longitude: bounds.getEast() }, demandGridZoom)
  updateDemandSource(map, createDemandZones(northwest.x, northwest.y, southeast.x, southeast.y))
}

function addDemandLayers(map: MapLibreMap) {
  map.addSource(demandSource, { type: "geojson", data: { type: "FeatureCollection", features: [] } })
  const overlayLayer = map.getLayer("water") ? "water" : undefined
  map.addLayer({
    id: "simulated-demand-fill", type: "fill", source: demandSource, minzoom: demandZoom,
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: { "fill-color": ["get", "color"], "fill-opacity": 0.42 },
  }, overlayLayer)
  map.addLayer({
    id: "simulated-demand-outline", type: "line", source: demandSource, minzoom: demandZoom,
    filter: ["==", ["geometry-type"], "Polygon"],
    paint: { "line-color": "#e5a733", "line-opacity": 0.5, "line-width": 1 },
  }, overlayLayer)

  const canvas = document.createElement("canvas")
  canvas.width = 88
  canvas.height = 44
  const context = canvas.getContext("2d")
  if (!context) return

  for (const multiplier of multiplierLabels) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.beginPath()
    context.roundRect(1, 1, 86, 42, 21)
    context.fillStyle = "#fffaf0"
    context.fill()
    context.strokeStyle = "#f2bb61"
    context.lineWidth = 2
    context.stroke()
    context.fillStyle = "#9a390c"
    context.font = "bold 23px sans-serif"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText(multiplier, 44, 23)
    map.addImage(multiplier, context.getImageData(0, 0, canvas.width, canvas.height), { pixelRatio: 2 })
  }

  map.addLayer({
    id: "simulated-demand-multipliers", type: "symbol", source: demandSource, minzoom: demandLabelZoom,
    filter: ["==", ["geometry-type"], "Point"],
    layout: { "icon-image": ["get", "multiplier"], "icon-allow-overlap": true, "icon-ignore-placement": true },
  })
}

const fillColors: Record<string, string> = {
  park: "#c2ebd5",
  water: "#adddf0",
  landuse_residential: "#f0efed",
  landcover_wood: "#ccead7",
  building: "#e9e7e5",
}
const lineColors: Record<string, string> = {
  waterway: "#9fd5ea",
  highway_minor: "#ffffff",
  highway_major_casing: "#e9d89b",
  highway_major_inner: "#fff0bd",
  highway_major_subtle: "#fff2c9",
  highway_motorway_casing: "#e7c56b",
  highway_motorway_inner: "#ffdc80",
  highway_motorway_subtle: "#ffe7a5",
  highway_motorway_bridge_casing: "#e7c56b",
  highway_motorway_bridge_inner: "#ffdc80",
  tunnel_motorway_casing: "#e7d6a2",
  tunnel_motorway_inner: "#ffedb4",
}

function styleDriverMap(_previous: StyleSpecification | undefined, style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers.map((layer) => {
      if (layer.type === "background") {
        return { ...layer, paint: { ...layer.paint, "background-color": "#f5f4f3" } }
      }
      if (layer.type === "fill" && fillColors[layer.id]) {
        return { ...layer, paint: { ...layer.paint, "fill-color": fillColors[layer.id] } }
      }
      if (layer.type === "line" && lineColors[layer.id]) {
        return { ...layer, paint: { ...layer.paint, "line-color": lineColors[layer.id] } }
      }
      return layer
    }),
  }
}

export function DriverMap({ location, onReady }: DriverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [useRasterMap, setUseRasterMap] = useState(false)
  const reportReady = onReady

  useEffect(() => {
    if (useRasterMap || !containerRef.current) return
    const container = containerRef.current
    let disposed = false
    const fallbackTimer = window.setTimeout(() => setUseRasterMap(true), 9000)

    async function initialize() {
      try {
        const { Map } = await import("maplibre-gl")
        if (disposed) return

        const map = new Map({
          container,
          center: [location.longitude, location.latitude],
          zoom: 15,
          minZoom: 2,
          maxZoom: 18,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          attributionControl: false,
        })
        mapRef.current = map
        map.touchZoomRotate.disableRotation()

        map.once("load", () => {
          window.clearTimeout(fallbackTimer)
          addDemandLayers(map)
          updateVisibleDemand(map)
          map.on("moveend", () => updateVisibleDemand(map))
        })
        map.on("idle", () => reportReady())
        map.setStyle(baseMapStyle, { transformStyle: styleDriverMap })
      } catch {
        if (!disposed) setUseRasterMap(true)
      }
    }

    void initialize()

    return () => {
      disposed = true
      window.clearTimeout(fallbackTimer)
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [useRasterMap])

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-[#f5f4f3]">
      {useRasterMap ? (
        <RasterDriverMap location={location} onReady={onReady} />
      ) : (
        <div
          ref={containerRef}
          aria-label="Mapa de Fortaleza"
          className="h-full w-full"
        />
      )}
      <div className="absolute right-2 top-16 rounded bg-white/90 px-1.5 py-0.5 text-right text-[10px] leading-snug text-gray-700">
        {!useRasterMap && <><a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a>{" · "}</>}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
        <span className="block">Zonas de demanda simuladas</span>
      </div>
    </div>
  )
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const project = ({ latitude, longitude }: Location, zoom: number) => {
  const scale = tileSize * 2 ** zoom
  const lat = clamp(latitude, -85.0511, 85.0511) * Math.PI / 180
  return { x: ((longitude + 180) / 360) * scale, y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * scale }
}
const unproject = (x: number, y: number, zoom: number): Location => {
  const scale = tileSize * 2 ** zoom
  return { longitude: x / scale * 360 - 180, latitude: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))) * 180 / Math.PI }
}

function RasterDriverMap({ location, onReady }: DriverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchDistanceRef = useRef<number | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [view, setView] = useState<View>({ ...location, zoom: 15 })

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const geometry = useMemo(() => {
    if (!size.width || !size.height) return null
    const center = project(view, view.zoom)
    const left = center.x - size.width / 2
    const top = center.y - size.height / 2
    const tiles: { x: number; y: number; left: number; top: number }[] = []
    const limit = 2 ** view.zoom
    for (let y = Math.floor(top / tileSize); y <= Math.floor((top + size.height) / tileSize); y++) {
      if (y < 0 || y >= limit) continue
      for (let x = Math.floor(left / tileSize); x <= Math.floor((left + size.width) / tileSize); x++) {
        tiles.push({ x: ((x % limit) + limit) % limit, y, left: x * tileSize - left, top: y * tileSize - top })
      }
    }
    return { tiles, left, top }
  }, [view, size])

  const left = geometry?.left
  const top = geometry?.top
  const zoom = view.zoom
  const zones = useMemo(() => {
    if (left === undefined || top === undefined || zoom < demandZoom + 1) return []
    const scale = 2 ** (demandGridZoom - zoom)
    return createDemandZones(left * scale, top * scale, (left + size.width) * scale, (top + size.height) * scale)
  }, [left, top, zoom, size.width, size.height])

  const zoomBy = (amount: number) => {
    setView((current) => ({ ...current, zoom: clamp(current.zoom + amount, 3, 19) }))
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#e9edf0] touch-none"
      onPointerDown={(event) => {
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        event.currentTarget.setPointerCapture(event.pointerId)
        if (pointersRef.current.size === 2) pinchDistanceRef.current = null
      }}
      onPointerMove={(event) => {
        const previous = pointersRef.current.get(event.pointerId)
        if (!previous) return
        pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (pointersRef.current.size === 2) {
          const [first, second] = [...pointersRef.current.values()]
          const distance = Math.hypot(first.x - second.x, first.y - second.y)
          if (pinchDistanceRef.current && distance / pinchDistanceRef.current > 1.35) { zoomBy(1); pinchDistanceRef.current = distance }
          else if (pinchDistanceRef.current && distance / pinchDistanceRef.current < 0.74) { zoomBy(-1); pinchDistanceRef.current = distance }
          else if (!pinchDistanceRef.current) pinchDistanceRef.current = distance
          return
        }
        const dx = event.clientX - previous.x
        const dy = event.clientY - previous.y
        setView((current) => {
          const center = project(current, current.zoom)
          return { ...unproject(center.x - dx, center.y - dy, current.zoom), zoom: current.zoom }
        })
      }}
      onPointerUp={(event) => { pointersRef.current.delete(event.pointerId); pinchDistanceRef.current = null }}
      onPointerCancel={(event) => { pointersRef.current.delete(event.pointerId); pinchDistanceRef.current = null }}
      onWheel={(event) => { event.preventDefault(); zoomBy(event.deltaY < 0 ? 1 : -1) }}
      onDoubleClick={(event) => { event.preventDefault(); zoomBy(1) }}
    >
      {geometry?.tiles.map((tile) => <img key={`${view.zoom}-${tile.x}-${tile.y}`} src={`https://tile.openstreetmap.org/${view.zoom}/${tile.x}/${tile.y}.png`} alt="" draggable={false} onLoad={onReady} onError={onReady} className="pointer-events-none absolute h-64 w-64 select-none" style={{ left: tile.left, top: tile.top }} />)}
      {geometry && zones.length > 0 && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
          {zones.map(({ outline, center, color, multiplier }) => {
            const points = outline.map(([longitude, latitude]) => {
              const { x, y } = project({ longitude, latitude }, view.zoom)
              return `${x - geometry.left},${y - geometry.top}`
            }).join(" ")
            const { x, y } = project({ longitude: center[0], latitude: center[1] }, view.zoom)
            return (
              <g key={center.join(",")}>
                <polygon points={points} fill={color} fillOpacity={0.42} stroke="#e5a733" strokeOpacity={0.65} />
                {multiplier && zoom >= demandLabelZoom + 1 && (
                  <g transform={`translate(${x - geometry.left},${y - geometry.top})`}>
                    <rect x={-22} y={-11} width={44} height={22} rx={11} fill="#fffaf0" stroke="#f2bb61" />
                    <text y={4} textAnchor="middle" fill="#9a390c" fontSize={12} fontWeight={700}>{multiplier}</text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

