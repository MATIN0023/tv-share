// components/Modal.tsx
'use client';

import React, { useRef } from 'react';
import styled from 'styled-components';
import LiquidGlass from 'liquid-glass-react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalWrapper ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <LiquidGlass
          mouseContainer={modalRef}
          displacementScale={80}
          blurAmount={0.15}
          saturation={130}
          aberrationIntensity={2}
          elasticity={0.3}
          cornerRadius={24}
          padding="2rem"
          style={{
            maxWidth: '600px',
            width: '90%',
          }}
        >
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              <CloseButton onClick={onClose}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>{children}</ModalBody>
          </ModalContent>
        </LiquidGlass>
      </ModalWrapper>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  width: 100%;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  color: var(--text-primary);
`;

export { Modal };
