import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import React from "react";

interface AnnouncementBadgeProps {
  label?: string;
  message: string;
  href?: string;
  className?: string;
}

export const AnnouncementBadge = ({ 
  label = "New", 
  message, 
  href = "#",
  className 
}: AnnouncementBadgeProps) => {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex justify-center w-fit mx-auto items-center gap-2 rounded-full",
        "bg-primary border-4 border-background shadow-lg",
        "py-1 pl-1 pr-4 text-xs font-semibold",
        "hover:scale-105 transition-transform duration-200",
        className
      )}
    >
      <div className="rounded-full bg-white px-2 py-1 text-[10px] text-black font-bold uppercase tracking-wider">
        {label}
      </div>
      <p className="text-white sm:text-sm text-xs inline-block">
        ✨ {message}
      </p>
      <ArrowRight className="h-3 w-3 text-white" />
    </a>
  );
};
