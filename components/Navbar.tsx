// components/Navbar.tsx
'use client';

import React from 'react';
import styled from 'styled-components';
import LiquidGlass from 'liquid-glass-react';
import { ThemeSwitch } from './ThemeSwitch';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <NavbarContainer>
      <div className="liquid-glass">
        <NavbarContent className="pt-6">
          <Logo href="/">مــــــــــــوی سیـــــــنک</Logo>

          <RightSection>
            <ThemeSwitch />
            
            <NavItem className="li" href="/login">ورود</NavItem>
            <NavItem href="/register">ثبت‌نام</NavItem>
          </RightSection>
        </NavbarContent>
      </div>
        
      
    </NavbarContainer>
  );
};

const NavbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
`;

const NavbarContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavItem = styled(Link)`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 12px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export { Navbar };