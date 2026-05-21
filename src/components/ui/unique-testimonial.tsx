"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    id: 1,
    quote: "One mind. Full architecture.",
    author: "Nodirbek Kamoldinov",
    role: "CTO • Systems Architect",
    avatar:
      "https://i.postimg.cc/dVzTR1qR/31536000-1810707369446-WIg-RPbc-IUCwi-Zz-O1LJZDAiz-BDCL0TMVvv-OQPTa-E8f-Og-S9p-0io7t-HPHAs-WOEu1YQQN.jpg",
  },
  {
    id: 2,
    quote: "From vision to reality — led independently.",
    author: "Sotvoldiyev Muhammadumar",
    role: "CEO • Founder",
    avatar:
      "https://i.postimg.cc/NjrcXGC0/avatar-jpg.jpg",
  },
  {
    id: 3,
    quote: "",
    author: "Soon",
    role: "Soon",
    avatar:
      "",
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState(testimonials[0].quote)
  const [displayedRole, setDisplayedRole] = useState(testimonials[0].role)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)

    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote)
      setDisplayedRole(testimonials[index].role)
      setActiveIndex(index)
      setTimeout(() => setIsAnimating(false), 400)
    }, 200)
  }

  return (
    <div className="flex flex-col items-center gap-10 py-16">
      <div className="relative px-8">
        <span className="absolute -left-2 -top-6 text-7xl font-serif text-foreground/[0.06] select-none pointer-events-none">
          &quot;
        </span>

        <p
          className={cn(
            "text-2xl md:text-3xl font-light text-foreground text-center max-w-lg leading-relaxed transition-all duration-400 ease-out",
            isAnimating
              ? "opacity-0 blur-sm scale-[0.98]"
              : "opacity-100 blur-0 scale-100"
          )}
        >
          {displayedQuote}
        </p>

        <span className="absolute -right-2 -bottom-8 text-7xl font-serif text-foreground/[0.06] select-none pointer-events-none">
          &quot;
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 mt-2">
        <p
          className={cn(
            "text-xs text-muted-foreground tracking-[0.2em] uppercase transition-all duration-500 ease-out",
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}
        >
          {displayedRole}
        </p>

        <div className="flex items-center justify-center gap-2">
          {testimonials.map((testimonial, index) => {
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index && !isActive
            const showName = isActive || isHovered

            return (
              <button
                key={testimonial.id}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex items-center gap-0 rounded-full cursor-pointer",
                  "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  isActive
                    ? "bg-foreground shadow-lg"
                    : "bg-transparent hover:bg-muted/80",
                  showName ? "pr-4 pl-2 py-2" : "p-0.5"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    width={32}
                    height={32}
                    className={cn(
                      "w-8 h-8 rounded-full object-cover",
                      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                      isActive ? "ring-2 ring-background/30" : "ring-0",
                      !isActive && "hover:scale-105"
                    )}
                  />
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    showName
                      ? "grid-cols-[1fr] opacity-100 ml-2"
                      : "grid-cols-[0fr] opacity-0 ml-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <span
                      className={cn(
                        "text-sm font-medium whitespace-nowrap block",
                        "transition-colors duration-300",
                        isActive ? "text-background" : "text-foreground"
                      )}
                    >
                      {testimonial.author}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
