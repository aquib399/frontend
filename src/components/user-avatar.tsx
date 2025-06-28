import { cn } from "@/lib/utils";
import Image from "next/image";

export default function UserAvatar({
  avatarUrl,
  className,
  size,
}: {
  avatarUrl:string
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={avatarUrl ?? "/profile-placeholder.png"}
      alt={"profile"}
      aria-label={"profile"}
      width={size ?? 120}
      height={size || 120}
      className={cn(
        "bg-secondary aspect-square size-10 flex-none rounded-full",
        className,
      )}
    />
  );
}
