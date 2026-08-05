import { useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

// ─── Types ───────────────────────────────────────────────────────────────────
interface GalleryItem {
  id: number
  title: string
  description: string
  image_url: string
  category: string
  event_date: string
}

// ─── Constants (outside component — never re-created on re-render) ────────────
const SLIDE_DURATION_MS = 12000   // How long each slide stays visible
const ANIM_LOCK_MS = 300    // Execution lock time for transition
const MIN_SWIPE_PX = 50      // Minimum px to register as a swipe

const DEFAULT_SLIDES: GalleryItem[] = []

// ─── Helpers ──────────────────────────────────────────────────────────────────
function enrichSlides(dbSlides: GalleryItem[]): GalleryItem[] {
  return dbSlides.map((slide) => ({
    ...slide,
    title: slide.title?.length > 3 ? slide.title : 'CSA Kirinyaga',
    description: slide.description ? slide.description : '',
  }))
}

function buildDisplaySlides(dbSlides: GalleryItem[]): GalleryItem[] {
  return enrichSlides(dbSlides)
}

/** Fire-and-forget browser image pre-fetch */
function preloadImage(url: string) {
  const img = new Image()
  img.src = url
}

function ImageSlider() {

  const [dbSlides, setDbSlides] = useState<GalleryItem[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})

  const displaySlides = buildDisplaySlides(dbSlides)
  const total = displaySlides.length

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }))
  }

  useEffect(() => {
    apiService.getGallery()
      .then((data: GalleryItem[]) => {
        const sorted = data
          .filter(item => item.image_url && item.category === 'Hero Slider')
          .sort((a, b) => new Date(b.event_date ?? 0).getTime() - new Date(a.event_date ?? 0).getTime())
        setDbSlides(sorted)
      })
      .catch(() => setDbSlides([]))
  }, [])

  // ── Image pre-loading: fetch next & previous images into browser cache ─────
  useEffect(() => {
    if (total === 0) return
    const nextIdx = (currentSlide + 1) % total
    const prevIdx = (currentSlide - 1 + total) % total
    preloadImage(displaySlides[nextIdx].image_url)
    preloadImage(displaySlides[prevIdx].image_url)
  }, [currentSlide, total]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Warm up the browser cache by preloading all slides once resolved ────────
  useEffect(() => {
    if (total === 0) return
    displaySlides.forEach((slide) => {
      preloadImage(slide.image_url)
    })
  }, [total]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-play: resets timer every time currentSlide changes ───────────────
  useEffect(() => {
    if (total === 0) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % total)
    }, SLIDE_DURATION_MS)
    return () => clearInterval(timer)
  }, [currentSlide, total])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = useCallback((to: number) => {
    if (isAnimating || total === 0) return
    setIsAnimating(true)
    setCurrentSlide(to)
    setTimeout(() => setIsAnimating(false), ANIM_LOCK_MS)
  }, [isAnimating, total])

  const nextSlide = useCallback(() => navigate((currentSlide + 1) % total), [navigate, currentSlide, total])
  const prevSlide = useCallback(() => navigate((currentSlide - 1 + total) % total), [navigate, currentSlide, total])
  const goToSlide = useCallback((i: number) => { if (i !== currentSlide) navigate(i) }, [navigate, currentSlide])

  // ── Touch swipe ────────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX) }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const d = touchStart - touchEnd
    if (d > MIN_SWIPE_PX) nextSlide()
    if (d < -MIN_SWIPE_PX) prevSlide()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <section className="relative h-[60vh] md:h-[85vh] min-h-[450px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white/80 tracking-tight mb-3">St. Thomas Aquinas CSA</h1>
          <p className="text-white/30 text-base md:text-lg font-medium">Kirinyaga University</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative h-[60vh] md:h-[85vh] min-h-[450px] overflow-hidden bg-black group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── 1. Images ─────────────────────────────────────────────────────── */}
      {displaySlides.map((slide, i) => {
        const isLoaded = loadedImages[slide.id]
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
          >
            {/* Shimmer / blur background placeholder while loading */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 animate-pulse" />
            )}
            <img
              src={slide.image_url}
              alt={slide.title.replace('\n', ' ') || `CSA Gathering ${i + 1}`}
              loading="eager"
              decoding="async"
              onLoad={() => handleImageLoad(slide.id)}
              className={`object-cover w-full h-full transition-all duration-[2000ms] ease-out ${
                isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
              } ${i === currentSlide ? 'scale-110' : 'scale-100'}`}
            />
            {/* Centered vignette overlay — darkens edges, keeps center clear */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )
      })}

      {/* ── 2. Text overlays ──────────────────────────────────────────────── */}
      {displaySlides.map((slide, i) => {
        const [line1, line2] = slide.title.split('\n')
        const active = i === currentSlide
        return (
          <div
            key={`txt-${slide.id}`}
            className={`absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 text-center text-white pointer-events-none z-10
              transition-all duration-[1500ms] ease-out ${active ? 'opacity-100 delay-300' : 'opacity-0 delay-0'}`}
          >
            <h1 className={`mb-3 sm:mb-5 text-[26px] sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight
              drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)]
              ${active ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}
            >
              {line1}
              {line2 && (
                <span className="block mt-2 text-lg sm:text-2xl md:text-4xl text-blue-300 font-bold drop-shadow-xl">
                  {line2}
                </span>
              )}
            </h1>

            <p className={`max-w-[320px] sm:max-w-lg md:max-w-2xl text-[13px] sm:text-base md:text-xl italic font-light leading-relaxed
              drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-gray-200 mx-auto
              transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] delay-[400ms]
              ${active ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              "{slide.description}"
            </p>
          </div>
        )
      })}

      {/* ── 3. Desktop nav buttons — sleek edge-pinned pill capsules ──────── */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); prevSlide() }}
        aria-label="Previous slide"
        className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center justify-center gap-1
          h-20 md:h-24 w-10 md:w-12 
          bg-white/10 hover:bg-white/20 text-white
          backdrop-blur-md border-r-0 border border-white/15
          rounded-r-none rounded-l-none rounded-tr-3xl rounded-br-3xl
          transition-all duration-300 ease-out
          opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0
          z-40 active:scale-95 cursor-pointer shadow-[4px_0_20px_rgba(0,0,0,0.2)]"
      >
        <FaArrowLeft className="text-sm md:text-base" />
        <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-70">Prev</span>
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); nextSlide() }}
        aria-label="Next slide"
        className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center justify-center gap-1
          h-20 md:h-24 w-10 md:w-12
          bg-white/10 hover:bg-white/20 text-white
          backdrop-blur-md border-l-0 border border-white/15
          rounded-l-none rounded-r-none rounded-tl-3xl rounded-bl-3xl
          transition-all duration-300 ease-out
          opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0
          z-40 active:scale-95 cursor-pointer shadow-[-4px_0_20px_rgba(0,0,0,0.2)]"
      >
        <FaArrowRight className="text-sm md:text-base" />
        <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-70">Next</span>
      </button>

      {/* ── 4. Progress dots ──────────────────────────────────────────────── */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 z-40 px-2">
        {displaySlides.map((slide, i) => (
            <button
              key={`dot-${slide.id}`}
              type="button"
              onClick={(e) => { e.stopPropagation(); goToSlide(i) }}
              aria-label={`Go to slide ${i + 1}`}
              className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 cursor-pointer"
            >
              <span className={`transition-all duration-500 rounded-full h-1.5 md:h-2
              ${i === currentSlide
                ? 'w-4 sm:w-6 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                : 'w-2 bg-white/40 hover:bg-white/80'}`}
              />
            </button>
        ))}
      </div>
    </section>
  )
}

export default ImageSlider
