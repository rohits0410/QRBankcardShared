import { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // RGB-dən HSL-ə çevir
  const rgbToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // HSL-dən HEX-ə çevir
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  // İlkin value-dan HSL çıxart (yalnız modal açılanda)
  useEffect(() => {
    if (isOpen && value && value.startsWith('#')) {
      const { h, s, l } = rgbToHsl(value);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [isOpen, value]);

  // Hue dəyişdikdə
  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    isInternalChange.current = true;
    const hex = hslToHex(newHue, saturation, lightness);
    onChange(hex);
  };

  // Saturation dəyişdikdə
  const handleSaturationChange = (newSaturation: number) => {
    setSaturation(newSaturation);
    isInternalChange.current = true;
    const hex = hslToHex(hue, newSaturation, lightness);
    onChange(hex);
  };

  // Lightness dəyişdikdə
  const handleLightnessChange = (newLightness: number) => {
    setLightness(newLightness);
    isInternalChange.current = true;
    const hex = hslToHex(hue, saturation, newLightness);
    onChange(hex);
  };

  // Kənarda klik olunduqda bağla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="color-picker-wrapper" ref={pickerRef}>
      {label && <label className="color-picker-label">{label}</label>}

      {/* Seçilmiş rəng */}
      <button
        type="button"
        className="color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: value }}
      >
        <span className="color-value">{value.toUpperCase()}</span>
      </button>

      {/* Picker Modal */}
      {isOpen && (
        <div className="color-picker-dropdown">
          {/* Gradient Dairə - Hue seçimi */}
          <div className="color-wheel-container">
            <div
              className="color-wheel"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const angle = Math.atan2(y, x) * (180 / Math.PI);
                const newHue = (angle + 360) % 360;
                handleHueChange(newHue);
              }}
            >
              {/* Seçim nöqtəsi */}
              <div
                className="color-wheel-pointer"
                style={{
                  transform: `rotate(${hue}deg) translateX(80px)`,
                }}
              />
            </div>
          </div>

          {/* Saturation Slider */}
          <div className="color-slider">
            <label className="slider-label">Doyma</label>
            <input
              type="range"
              min="0"
              max="100"
              value={saturation}
              onChange={(e) => handleSaturationChange(Number(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`,
              }}
            />
            <span className="slider-value">{Math.round(saturation)}%</span>
          </div>

          {/* Lightness Slider */}
          <div className="color-slider">
            <label className="slider-label">İşıq</label>
            <input
              type="range"
              min="0"
              max="100"
              value={lightness}
              onChange={(e) => handleLightnessChange(Number(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`,
              }}
            />
            <span className="slider-value">{Math.round(lightness)}%</span>
          </div>

          {/* Rəng məlumatı */}
          <div className="color-info">
            <div className="color-preview" style={{ backgroundColor: value }} />
            <div className="color-codes">
              <span className="color-code">HEX: {value.toUpperCase()}</span>
              <span className="color-code">
                HSL: {Math.round(hue)}°, {Math.round(saturation)}%, {Math.round(lightness)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}