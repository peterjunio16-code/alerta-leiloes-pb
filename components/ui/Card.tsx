import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("bg-[#16213e] border border-[#0f3460] rounded-xl p-6", className)}>
      {children}
    </div>
  );
}
