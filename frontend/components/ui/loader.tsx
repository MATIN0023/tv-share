"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import styles from "./loader.module.css";

export type HamsterLoaderProps = {
  /** Base em size for the wheel animation (default 14px). */
  size?: string;
  className?: string;
};

export function HamsterLoader({ size = "14px", className }: HamsterLoaderProps) {
  return (
    <div
      className={cn(styles.root, className)}
      style={{ "--hamster-size": size } as CSSProperties}
    >
      <div aria-label="Loading" role="img" className={styles.wheelAndHamster}>
        <div className={styles.wheel} />
        <div className={styles.hamster}>
          <div className={styles.hamsterBody}>
            <div className={styles.hamsterHead}>
              <div className={styles.hamsterEar} />
              <div className={styles.hamsterEye} />
              <div className={styles.hamsterNose} />
            </div>
            <div className={styles.hamsterLimbFr} />
            <div className={styles.hamsterLimbFl} />
            <div className={styles.hamsterLimbBr} />
            <div className={styles.hamsterLimbBl} />
            <div className={styles.hamsterTail} />
          </div>
        </div>
        <div className={styles.spoke} />
      </div>
    </div>
  );
}

export default HamsterLoader;




