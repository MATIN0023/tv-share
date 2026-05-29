// components/Navbar.tsx
"use client";

import React from "react";
import styled from "styled-components";
import { LiquidButton } from "./ui/liquid-button";
import { ThemeSwitch } from "./ThemeSwitch";
import Link from "next/link";
import { BorderMagicButton } from "@/components/ui/border-magic-button";

const Navbar: React.FC = () => {
  return (
    <NavbarContainer>
      <div className="liquid-glass">
        <NavbarContent className="pt-6">
          <Logo href="/">مــــــــــــوی سیـــــــنک</Logo>

          <RightSection>
            
            <Link href="/login">
  <BorderMagicButton>ورود</BorderMagicButton>
</Link>
<Link href="/signup">
  <BorderMagicButton>ثبت‌نام</BorderMagicButton>
</Link>
         <ThemeSwitch /> </RightSection>
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
