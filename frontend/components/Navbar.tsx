// components/Navbar.tsx
"use client";

import React from "react";
import styled from "styled-components";
import { ThemeSwitch } from "./ThemeSwitch";
import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { BorderMagicButton } from "@/components/ui/border-magic-button";
import { InstallPwaButton } from "@/components/pwa/install-pwa-button";
import { useTranslation } from "@/providers/i18n-provider";

const Navbar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavbarContainer>
      <div className="liquid-glass">
        <NavbarContent className="pt-6">
          <AppLogo href="/" size={36} name={t("common.appName")} nameClassName="text-xl" />

          <RightSection>
            <InstallPwaButton variant="inline" />
            <Link href="/login">
              <BorderMagicButton>{t("common.login")}</BorderMagicButton>
            </Link>
            <Link href="/signup">
              <BorderMagicButton>{t("common.signup")}</BorderMagicButton>
            </Link>
            <ThemeSwitch />
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export { Navbar };
