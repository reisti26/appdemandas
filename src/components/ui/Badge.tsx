import { ReactNode } from 'react';

export type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple' | 'amber';

export interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
}

export function Badge({ children, color = 'blue' }: BadgeProps) {
  const colors: Record<BadgeColor, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
