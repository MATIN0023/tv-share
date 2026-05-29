// components/MovieCard.tsx
'use client';

import React from 'react';
import styled from 'styled-components';
import LiquidGlass from 'liquid-glass-react';
import { Play, Clock } from 'lucide-react';

interface MovieCardProps {
  title: string;
  thumbnail: string;
  duration: string;
  onClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  title, 
  thumbnail, 
  duration, 
  onClick 
}) => {
  return (
    <CardWrapper>
      <LiquidGlass
        displacementScale={75}
        blurAmount={0.09}
        saturation={140}
        aberrationIntensity={2.5}
        elasticity={0.4}
        cornerRadius={16}
        padding="0"
        onClick={onClick}
        style={{
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <CardContent>
          <Thumbnail style={{ backgroundImage: `url(${thumbnail})` }}>
            <Overlay>
              <PlayButton>
                <Play size={32} fill="white" />
              </PlayButton>
            </Overlay>
          </Thumbnail>
          
          <CardInfo>
            <Title>{title}</Title>
            <Duration>
              <Clock size={14} />
              <span>{duration}</span>
            </Duration>
          </CardInfo>
        </CardContent>
      </LiquidGlass>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  width: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-size: cover;
  background-position: center;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;

  ${CardWrapper}:hover & {
    opacity: 1;
  }
`;

const PlayButton = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const CardInfo = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const Duration = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

export { MovieCard };
