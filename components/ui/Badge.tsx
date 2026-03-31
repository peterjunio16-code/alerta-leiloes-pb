import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  novo: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  ativo: "bg-green-500/20 text-green-300 border-green-500/30",
  pendente: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  publicado: "bg-green-500/20 text-green-300 border-green-500/30",
  encerrado: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  cancelado: "bg-red-500/20 text-red-300 border-red-500/30",
  contatado: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export function Badge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        variants[status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"
      )}
    >
      {status}
    </span>
  );
}
