/**
 * Fireland: Borneo Forest Rescue
 * Virtual Analog Touch Joystick for Mobile Android
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Vector2D } from '../game/types';

interface TouchJoystickProps {
  onMove: (vec: Vector2D) => void;
  sensitivity?: number;
}

export const TouchJoystick: React.FC<TouchJoystickProps> = ({ onMove, sensitivity = 1.0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState<Vector2D>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  const radius = 55; // maximum joystick radius

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setActive(true);
    if ('vibrate' in navigator) {
      try { navigator.vibrate(12); } catch {}
    }
    updateKnob(touch.clientX, touch.clientY);
  };

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }

    setKnobPos({ x: dx, y: dy });

    // Output normalized vector with sensitivity
    const normX = (dx / radius) * sensitivity;
    const normY = (dy / radius) * sensitivity;
    onMove({ x: normX, y: normY });
  }, [onMove, sensitivity]);

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        break;
      }
    }
  };

  // Keyboard arrow/WASD fallback hint for desktop preview
  useEffect(() => {
    const handleBlur = () => {
      touchIdRef.current = null;
      setActive(false);
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [onMove]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-36 h-36 rounded-full bg-slate-900/60 backdrop-blur-sm border-2 border-emerald-500/40 flex items-center justify-center touch-none select-none shadow-xl pointer-events-auto"
      style={{
        boxShadow: active
          ? '0 0 25px rgba(16, 185, 129, 0.45), inset 0 0 15px rgba(16, 185, 129, 0.2)'
          : '0 8px 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Center crosshair markers */}
      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/30" />
      <div className="absolute w-16 h-0.5 bg-emerald-500/20" />
      <div className="absolute h-16 w-0.5 bg-emerald-500/20" />

      {/* Floating thumb knob */}
      <div
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 border-2 border-emerald-200 shadow-lg flex items-center justify-center transition-transform duration-75 pointer-events-none"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-100/70 shadow-inner" />
      </div>
    </div>
  );
};
