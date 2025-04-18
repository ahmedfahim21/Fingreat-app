"use client"

import { useEffect, useRef } from "react"
import lottie from "lottie-web"

// Import animation data
import animationData from "../../public/brain_animation.json"

interface LottieAnimationProps {
  color?: string;
}

export default function LottieAnimation({ color }: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Create animation instance
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData
    })
    
    // Apply color changes if specified
    if (color && containerRef.current) {
      // Find all path and shape elements in the SVG after it's loaded
      anim.addEventListener('DOMLoaded', () => {
        const svgElement = containerRef.current?.querySelector('svg');
        if (svgElement) {
          const paths = svgElement.querySelectorAll('path, circle, ellipse, rect, polygon');
          
          paths.forEach(path => {
            // Only change elements that have fill/stroke but keep special elements untouched
            if (path.getAttribute('fill') && 
                path.getAttribute('fill') !== 'none' && 
                !path.getAttribute('class')?.includes('no-color-change')) {
              path.setAttribute('fill', color);
            }
            
            if (path.getAttribute('stroke') && 
                path.getAttribute('stroke') !== 'none' && 
                !path.getAttribute('class')?.includes('no-color-change')) {
              path.setAttribute('stroke', color);
            }
          });
        }
      });
    }
    
    return () => anim.destroy()
  }, [color])
  
  return <div ref={containerRef} className="w-full h-full" />
}
