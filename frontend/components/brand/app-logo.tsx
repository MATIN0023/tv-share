import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/icons/logo-transparent.png";

export type AppLogoProps = {
  size?: number;
  showName?: boolean;
  name?: string;
  href?: string | null;
  className?: string;
  imageClassName?: string;
  nameClassName?: string;
};

export function AppLogo({
  size = 32,
  showName = true,
  name,
  href = "/",
  className,
  imageClassName,
  nameClassName,
}: AppLogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", imageClassName)}
      priority
    />
  );

  const label =
    showName && name ? (
      <span className={cn("font-bold leading-none", nameClassName)}>{name}</span>
    ) : null;

  const inner = (
    <>
      {image}
      {label}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-2.5", className)}>
        {inner}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-2.5", className)}>{inner}</div>;
}
