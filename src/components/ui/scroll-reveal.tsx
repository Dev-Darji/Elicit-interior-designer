import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: "fade-in" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-up";
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 1000,
  threshold = 0.05,
  className = "",
}: ScrollRevealProps) {
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.unobserve(el);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Trigger 50px before entering viewport for a smoother feel
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getVariantStyles = () => {
    if (hasIntersected) {
      return "opacity-100 translate-x-0 translate-y-0 scale-100";
    }

    switch (variant) {
      case "fade-in":
        return "opacity-0";
      case "fade-up":
        return "opacity-0 translate-y-12";
      case "fade-down":
        return "opacity-0 -translate-y-12";
      case "fade-left":
        return "opacity-0 translate-x-12";
      case "fade-right":
        return "opacity-0 -translate-x-12";
      case "scale-up":
        return "opacity-0 scale-[0.97] translate-y-6";
      default:
        return "opacity-0 translate-y-12";
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all cubic-bezier(0.16, 1, 0.3, 1) ${getVariantStyles()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
