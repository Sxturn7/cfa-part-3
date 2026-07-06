import React, { useRef, useEffect, useState } from "react";

export interface GooeyNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: string[];
}

export default function GooeyNav({
  items,
  activeId,
  onChange,
  animationTime = 400,
  particleCount = 12,
  particleDistances = [70, 5],
  particleR = 80,
  timeVariance = 150,
  colors = ["var(--theme-accent)", "var(--theme-accent-hover)", "var(--theme-accent)"],
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);

  // Find index of the activeId
  const activeIndex = items.findIndex((item) => item.id === activeId);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);

      element.classList.remove("active");

      setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.classList.add("gooey-particle");
        
        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", p.color);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);

        point.classList.add("gooey-point");
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => {
          element.classList.add("active");
        });

        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Do nothing
          }
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
  };

  const handleClick = (e: React.MouseEvent<HTMLLIElement>, index: number) => {
    const liEl = e.currentTarget;
    const item = items[index];
    if (!item) return;

    if (activeId === item.id) return;

    onChange(item.id);
    updateEffectPosition(liEl);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll(".gooey-particle");
      particles.forEach((p) => filterRef.current?.removeChild(p));
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const listItems = navRef.current.querySelectorAll("li");
    const activeLi = listItems[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentListItems = navRef.current?.querySelectorAll("li");
      const currentActiveLi = currentListItems ? currentListItems[activeIndex] : null;
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <div className="gooey-nav-container relative w-full" ref={containerRef}>
      {/* Scope-contained Styles for Gooey Nav Elements */}
      <style>{`
        .gooey-nav-container {
          position: relative;
          background: var(--theme-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--theme-border);
          padding: 6px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          width: max-content;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          shadow: var(--theme-shadow);
        }
        .gooey-nav-container::-webkit-scrollbar {
          display: none;
        }
        .gooey-bg-wrapper {
          filter: url('#gooey-filter');
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .gooey-nav-container nav {
          width: 100%;
          z-index: 10;
          position: relative;
        }
        .gooey-nav-container ul {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 6px;
        }
        .gooey-nav-container li {
          position: relative;
          padding: 10px 22px;
          cursor: pointer;
          border-radius: 14px;
          transition: color 0.4s cubic-bezier(0.19, 1, 0.22, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--theme-text-main);
          font-weight: 600;
          font-size: 13px;
        }
        .gooey-nav-container li:hover {
          color: var(--theme-text-dark);
        }
        .gooey-nav-container li svg {
          opacity: 0.75;
          transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1), color 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .gooey-nav-container li.active {
          color: #ffffff !important;
          pointer-events: none;
        }
        .gooey-nav-container li.active svg {
          opacity: 1;
          color: #ffffff !important;
          transform: scale(1.05);
        }
        .gooey-nav-container .effect {
          position: absolute;
          pointer-events: none;
          border-radius: 14px;
          transition: left 0.4s cubic-bezier(0.19, 1, 0.22, 1), 
                      top 0.4s cubic-bezier(0.19, 1, 0.22, 1), 
                      width 0.4s cubic-bezier(0.19, 1, 0.22, 1), 
                      height 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .gooey-nav-container .effect.filter {
          background: var(--theme-accent);
          z-index: 1;
        }
        .gooey-particle {
          position: absolute;
          display: block;
          width: 0;
          height: 0;
          left: 50%;
          top: 50%;
          z-index: 1;
        }
        .gooey-point {
          position: absolute;
          display: block;
          left: -12px;
          top: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--theme-accent);
          opacity: 0.85;
          transform: scale(0);
        }
        .gooey-nav-container .active .gooey-point {
          animation: gooey-pop var(--time) cubic-bezier(0.075, 0.82, 0.165, 1) forwards;
        }
        @keyframes gooey-pop {
          0% {
            transform: translate3d(var(--start-x), var(--start-y), 0) scale(1.4) rotate(0deg);
            background: var(--color);
          }
          100% {
            transform: translate3d(var(--end-x), var(--end-y), 0) scale(0) rotate(var(--rotate));
            background: var(--theme-accent);
          }
        }
      `}</style>

      {/* The background gooey effect container - isolated from interactive content */}
      <div className="gooey-bg-wrapper">
        <span className="effect filter" ref={filterRef} />
      </div>

      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={item.id}
              className={activeId === item.id ? "active" : ""}
              onClick={(e) => handleClick(e, index)}
            >
              {item.icon && <span className="opacity-90 scale-90 transition-transform duration-300">{item.icon}</span>}
              <span className="item-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Embedded SVG Gooey filter definition */}
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        width="0"
        height="0"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
