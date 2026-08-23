import Image from "next/image";
import { basePath } from "@/utils/basePath";
export default function IconGuitar({ className, size = 24 }: { className?: string; color?: string; size?: number }) {
  return (
    <Image
      src={`${basePath}/icons/guitar-icon-transparent.svg`}
      width={size}
      height={size}
      alt="Guitar Icon"
      className={className}
    />
  );
}
