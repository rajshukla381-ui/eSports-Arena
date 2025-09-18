
'use client';

import React, { useState, useEffect } from 'react';
import styles from './spin-wheel.module.css';
import { cn } from '@/lib/utils';
import { CircleDollarSign } from 'lucide-react';

const prizes = [100, 500, 1000, 20, 5000, 0, 200, 10];
const totalPrizes = prizes.length;
const anglePerSlice = 360 / totalPrizes;

type SpinWheelProps = {
    onSpinFinish: (prize: number) => void;
    startSpin: boolean;
};

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinFinish, startSpin }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (startSpin) {
      spin();
    }
  }, [startSpin]);

  const spin = () => {
    const randomSpin = Math.floor(Math.random() * 360);
    const prizeIndex = Math.floor((360 - (randomSpin % 360)) / anglePerSlice);
    
    // Add multiple rotations for visual effect
    const fullRotations = Math.floor(Math.random() * 4) + 4;
    const newRotation = rotation + (fullRotations * 360) + randomSpin;
    
    setRotation(newRotation);

    setTimeout(() => {
      onSpinFinish(prizes[prizeIndex]);
    }, 5000); // Corresponds to the animation duration
  };

  return (
    <div className={styles.wheelContainer}>
      <div className={styles.wheelMarker} />
      <div
        className={styles.wheel}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {prizes.map((prize, i) => (
          <div
            key={i}
            className={styles.slice}
            style={{ transform: `rotate(${i * anglePerSlice}deg)` }}
          >
            <div className={cn(styles.sliceContent, prize > 0 ? 'text-primary-foreground' : 'text-muted-foreground')}>
              {prize > 0 ? (
                <>
                  <CircleDollarSign className="w-4 h-4" />
                  {prize.toLocaleString()}
                </>
              ) : (
                'Try Again'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpinWheel;

