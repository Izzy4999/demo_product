import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
  variant?: "blue" | "orange" | "green" | "purple";
}

const variants = {
  blue: { bg: "bg-[#EBF5FB]", border: "border-[#2E86C1]", icon: "text-[#2E86C1]" },
  orange: { bg: "bg-[#FEF3E2]", border: "border-[#BE0303]", icon: "text-[#BE0303]" },
  green: { bg: "bg-[#EAFAF1]", border: "border-[#BE0303]", icon: "text-[#BE0303]" },
  purple: { bg: "bg-[#F5EEF8]", border: "border-[#BE0303]", icon: "text-[#BE0303]" },
};

export default function NarratorBox({ children, label = "Presenter Script", variant = "blue" }: Props) {
  const v = variants[variant];
  return (
    <div className={`${v.bg} border-l-4 ${v.border} rounded-r-xl p-4 my-4`}>
      <div className="flex items-start gap-3">
        <svg className={`w-5 h-5 ${v.icon} mt-0.5 shrink-0`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.5 10h-2v5h2v-5zm5 0h-2v5h2v-5zm8.5 7H4v2h16v-2zm-3.5-7h-2v5h2v-5zM11.99 1L2 6v2h20V6l-8.01-5z"/>
        </svg>
        <div>
          <p className={`text-xs font-bold uppercase tracking-wide ${v.icon} mb-2`}>{label}</p>
          <div className="text-sm text-gray-700 italic leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
