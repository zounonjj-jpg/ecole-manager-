import Image from "next/image";

export function BrandLogo({ size = 44 }: { size?: number }) {
  return (
    <Image
      src="/brand/school-manager-mark.webp"
      alt=""
      width={size}
      height={size}
      className="brand-logo-image"
    />
  );
}
