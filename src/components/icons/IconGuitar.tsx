import Image from "next/image";
export default function IconGuitar({ className, size = 24 }: { className?: string; color?: string; size?: number }) {
  return (
    <Image
      src="/icons/guitar-icon-transparent.svg"
      width={size}
      height={size}
      alt="Guitar Icon"
      className={className}
    />
  );
}
