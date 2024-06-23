// Converted from: https://yoannchb-pro.github.io/card3d/index.html
import React, { useRef, useEffect, ReactNode } from 'react';

import styles from './Card3D.module.css';

interface Card3DProps {
  children: ReactNode;
  delta?: number;
  perspective?: number;
  startX?: number;
  startY?: number;
  glareOpacity?: number;
  axis?: 'all' | 'x' | 'y';
  scale?: number;
  reverse?: boolean;
  glare?: boolean;
  gyroscopie?: boolean;
  fullPageListening?: boolean;
  noReset?: boolean;
  stop?: boolean;
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  delta = 10,
  perspective = 500,
  startX = 0,
  startY = 0,
  glareOpacity = 0.5,
  axis = 'all',
  scale = 1,
  reverse = false,
  glare = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gyroscopie = false,
  fullPageListening = false,
  noReset = false,
  stop = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (stop) {
      reset();
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!cardRef.current) return;

      const { clientX, clientY } = event;
      const { left, top, width, height } =
        cardRef.current.getBoundingClientRect();
      const x = clientX - left - width / 2;
      const y = clientY - top - height / 2;
      const rotateX = (y / height) * delta;
      const rotateY = (x / width) * -delta;
      const rotateFactor = reverse ? -1 : 1;

      cardRef.current.style.transform = `
        perspective(${perspective}px)
        rotateX(${axis !== 'x' ? rotateFactor * rotateX : 0}deg)
        rotateY(${axis !== 'y' ? rotateFactor * rotateY : 0}deg)
        scale(${scale})
      `;

      if (glare && glareRef.current) {
        const angle =
          Math.atan2(clientY - top - height / 2, clientX - left - width / 2) *
          (180 / Math.PI);
        glareRef.current.style.opacity = glareOpacity.toString();
        glareRef.current.style.transform = `rotate(${angle}deg) translate(-50%, -50%)`;
      }
    };

    const handleMouseOut = () => {
      if (cardRef.current) {
        cardRef.current.style.transition = '0.5s ease';
        cardRef.current.style.transform = '';
      }
      if (glare && glareRef.current) {
        glareRef.current.style.opacity = '0';
      }
    };

    const targetElement = fullPageListening ? document.body : cardRef.current;
    targetElement?.addEventListener('mousemove', handleMouseMove);
    if (!noReset) {
      targetElement?.addEventListener('mouseout', handleMouseOut);
    }

    return () => {
      targetElement?.removeEventListener('mousemove', handleMouseMove);
      targetElement?.removeEventListener('mouseout', handleMouseOut);
    };
  }, [
    delta,
    perspective,
    startX,
    startY,
    glareOpacity,
    axis,
    scale,
    reverse,
    glare,
    fullPageListening,
    noReset,
    stop,
  ]);

  const reset = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.transition = '';
    }
    if (glare && glareRef.current) {
      glareRef.current.remove();
    }
  };

  return (
    <div className={styles.card3d} ref={cardRef}>
      {glare && <span className={styles.glare} ref={glareRef}></span>}
      {children}
    </div>
  );
};

export default Card3D;
