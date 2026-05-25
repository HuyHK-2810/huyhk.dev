import Image from "next/image";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

export default function BrandMark({
  size = 48,
  className = "",
}: BrandMarkProps) {
  return (
    <Image
      src="/brand/hkh-logo.png"
      alt="huyhk.dev"
      width={size}
      height={size}
      priority
      className={`select-none ${className}`}
    />
  );
}
