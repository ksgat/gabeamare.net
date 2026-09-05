"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./residue-loader.module.css";

export type ResidueVariant = "congruence" | "legendre";

type ResidueFieldProps = {
  variant: ResidueVariant;
  prime: number;
  phase: number;
};

const BLUE = "#1d0cff";
const WHITE = "#ffffff";

export function ResidueField({ variant, prime, phase }: ResidueFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measure = () => {
      setCanvasSize(Math.round(canvas.getBoundingClientRect().width));
    };
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize === 0) return;

    drawResidueField(canvas, canvasSize, variant, prime, phase);
  }, [canvasSize, phase, prime, variant]);

  return (
    <div className={styles.fieldWrap}>
      <canvas className={styles.field} ref={canvasRef} />
    </div>
  );
}

function drawResidueField(
  canvas: HTMLCanvasElement,
  size: number,
  variant: ResidueVariant,
  prime: number,
  phase: number,
) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * pixelRatio);
  canvas.height = Math.round(size * pixelRatio);

  const context = canvas.getContext("2d");
  if (!context) return;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.fillStyle = BLUE;
  context.fillRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;

  const cellSize = size / prime;
  const inset =
    prime >= 53 ? Math.max(0.28, cellSize * 0.13) : Math.max(0.8, cellSize * 0.08);
  const markSize = Math.max(0.25, cellSize - inset * 2);

  for (let y = 0; y < prime; y += 1) {
    for (let x = 0; x < prime; x += 1) {
      const sum = (x * x + y * y) % prime;
      const active =
        variant === "congruence"
          ? sum === phase
          : legendreSymbol(sum - phase, prime) === 1;

      drawMark(context, variant, active, {
        x: x * cellSize + inset,
        y: y * cellSize + inset,
        size: markSize,
      });
    }
  }
}

function drawMark(
  context: CanvasRenderingContext2D,
  variant: ResidueVariant,
  active: boolean,
  mark: { x: number; y: number; size: number },
) {
  context.fillStyle = active ? WHITE : BLUE;

  if (variant === "congruence" && active) {
    context.beginPath();
    context.arc(
      mark.x + mark.size / 2,
      mark.y + mark.size / 2,
      mark.size / 2,
      0,
      Math.PI * 2,
    );
    context.fill();
    return;
  }

  context.fillRect(mark.x, mark.y, mark.size, mark.size);
}

function legendreSymbol(value: number, prime: number) {
  const normalized = ((value % prime) + prime) % prime;
  if (normalized === 0) return 0;

  let result = 1;
  let base = normalized;
  let exponent = (prime - 1) / 2;

  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % prime;
    base = (base * base) % prime;
    exponent = Math.floor(exponent / 2);
  }

  return result === 1 ? 1 : -1;
}
