"use client";

import { useEffect, useState } from "react";

import { ResidueField, type ResidueVariant } from "./residue-field";
import styles from "./residue-loader.module.css";

type ResidueLoaderProps = {
  variant: ResidueVariant;
  demo?: boolean;
  minimal?: boolean;
  primeOverride?: number;
};

const PRIMES = [7, 11, 17, 23] as const;
const FINAL_PRIME = PRIMES.at(-1) ?? 23;
const LOAD_DURATION_MS = 1800;
const DEMO_STEPS = 32;

export function ResidueLoader({
  variant,
  demo = false,
  minimal = false,
  primeOverride,
}: ResidueLoaderProps) {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const totalSteps = primeOverride ?? DEMO_STEPS;
  const progress = demo
    ? (step % totalSteps) / totalSteps
    : Math.min(step / totalSteps, 1);
  const primeIndex = Math.min(
    Math.floor(progress * PRIMES.length),
    PRIMES.length - 1,
  );
  const prime =
    primeOverride ?? (variant === "legendre" ? PRIMES[primeIndex] : FINAL_PRIME);
  const phase = primeOverride ? Math.min(step + 1, prime) % prime : step % prime;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !demo) {
      const timeout = window.setTimeout(() => setFinished(true), 280);
      return () => window.clearTimeout(timeout);
    }

    let finishTimeout = 0;
    const interval = window.setInterval(() => {
      setStep((current) => {
        const next = current + 1;

        if (!demo && next >= totalSteps) {
          window.clearInterval(interval);
          finishTimeout = window.setTimeout(() => setFinished(true), 420);
        }

        return demo && next >= totalSteps ? 0 : next;
      });
    }, LOAD_DURATION_MS / totalSteps);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finishTimeout);
    };
  }, [demo, totalSteps]);

  const className = [
    styles.loader,
    finished && styles.finished,
    demo && styles.demo,
    minimal && styles.minimal,
  ]
    .filter(Boolean)
    .join(" ");
  const equation =
    variant === "congruence"
      ? `x² + y² ≡ ${phase} (mod ${prime})`
      : `χ${prime}(x² + y² − ${phase}) = +1`;

  return (
    <div
      className={className}
      aria-hidden={finished && !demo}
      aria-label={demo ? undefined : "Loading gabeamare.net"}
      role={demo ? undefined : "status"}
      onClick={() => !demo && setFinished(true)}
    >
      <header className={styles.header}>
        <span>
          {minimal
            ? "gabeamare.net"
            : variant === "congruence"
              ? "Quadratic congruence"
              : "Legendre field"}
        </span>
        <span>{minimal ? "Loading" : `p = ${prime}`}</span>
      </header>

      <ResidueField variant={variant} prime={prime} phase={phase} />

      {!minimal && (
        <footer className={styles.footer}>
          <span className={styles.equation}>{equation}</span>
        </footer>
      )}
    </div>
  );
}
