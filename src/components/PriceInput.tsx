"use client";

import { useState, useEffect, useRef } from "react";

function formatPriceBR(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function parsePriceBR(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function PriceInput({
  value,
  onChange,
  className = "",
  disabled = false,
  placeholder = "0,00",
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(formatPriceBR(value));
  const [isFocused, setIsFocused] = useState(false);
  const prevValueRef = useRef(value);

  // Sync display when external value changes (and not focused)
  useEffect(() => {
    if (!isFocused && value !== prevValueRef.current) {
      setDisplayValue(formatPriceBR(value));
      prevValueRef.current = value;
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Select all text on focus for easy replacement
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits and comma only, let user type freely
    const sanitized = raw.replace(/[^\d,]/g, "");
    setDisplayValue(sanitized);
    // Update parent with parsed value on every change
    onChange(parsePriceBR(sanitized));
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the display value nicely on blur
    const parsed = parsePriceBR(displayValue);
    setDisplayValue(formatPriceBR(parsed));
    prevValueRef.current = parsed;
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

export { formatPriceBR, parsePriceBR };
