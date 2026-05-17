// components/DashboardSidebar.tsx
'use client';

import React, { useRef } from 'react';
import styled from 'styled-components';
import LiquidGlass from 'liquid-glass-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  Settings, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'داشبورد' },
  { href: '/friends', icon: Users, label: 'دوستان' },
  { href: '/schedule', icon: Calendar, label: 'زمان‌بندی' },
  { href: '/history', icon: Clock, label: 'تاریخچه' },
  { href: '/settings', icon: Settings, label: 'تنظیمات' },
];

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <SidebarContainer ref={sidebarRef}>
      <LiquidGlass
        mouseContainer={sidebarRef}
        displacementScale={60}
        blurAmount={0.12}
        saturation={125}
        aberrationIntensity={1.8}
        elasticity={0.2}
        cornerRadius={0}
        padding="2rem 1rem"
        style={{
          height: '100%',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <SidebarContent>
          <Logo>MovieSync</Logo>
          
          <MenuList>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <MenuItem key={item.href}>
                  <LiquidGlass
                    displacementScale={70}
                    blurAmount={0.08}
                    saturation={135}
                    aberrationIntensity={2.2}
                    elasticity={0.3}
                    cornerRadius={12}
                    padding="12px 16px"
                    onClick={() => {}}
                    style={{
                      width: '100%',
                      background: isActive 
                        ? 'rgba(102, 126, 234, 0.2)' 
                        : 'transparent',
                    }}
                  >
                    <MenuLink href={item.href} $isActive={isActive}>
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </MenuLink>
                  </LiquidGlass>
                </MenuItem>
              );
            })}
          </MenuList>

          <BottomSection>
            <LiquidGlass
              displacementScale={70}
              blurAmount={0.08}
              saturation={135}
              aberrationIntensity={2.2}
              elasticity={0.3}
              cornerRadius={12}
              padding="12px 16px"
              onClick={() => console.log('Logout')}
              style={{
                width: '100%',
                background: 'rgba(220, 38, 38, 0.15)',
              }}
            >
              <LogoutButton>
                <LogOut size={20} />
                <span>خروج</span>
              </LogoutButton>
            </LiquidGlass>
          </BottomSection>
        </SidebarContent>
      </LiquidGlass>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside`
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  z-index: 100;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: center;
`;

const MenuList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const MenuItem = styled.li`
  width: 100%;
`;

const MenuLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.$isActive ? '#667eea' : 'var(--text-primary)'};
  font-weight: ${props => props.$isActive ? '600' : '500'};
  text-decoration: none;
  width: 100%;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }
`;

const BottomSection = styled.div`
  margin-top: auto;
  padding-top: 1rem;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ef4444;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  font-family: inherit;
  transition: color 0.2s;

  &:hover {
    color: #dc2626;
  }
`;

export { DashboardSidebar };
