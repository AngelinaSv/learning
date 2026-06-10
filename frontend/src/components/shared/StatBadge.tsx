import { Badge, type BadgeProps } from '../ui/badge';

interface StatBadgeProps extends BadgeProps {
  label: string;
  value: string | number;
}

export function StatBadge({ label, value, variant = 'secondary', ...props }: StatBadgeProps) {
  return (
    <Badge variant={variant} {...props}>
      <span className="text-slate-400">{label}</span>
      <span className="ml-1 text-white">{value}</span>
    </Badge>
  );
}
