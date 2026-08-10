import {
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  Users,
  BadgeCheck,
  GraduationCap,
  BarChart3,
  FileText,
  History,
  MessageCircle,
  UserCog,
  Settings,
  BookOpen,
  Home,
  User,
  Bell,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  Users,
  BadgeCheck,
  GraduationCap,
  BarChart3,
  FileText,
  History,
  MessageCircle,
  UserCog,
  Settings,
  BookOpen,
  Home,
  User,
  Bell,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} strokeWidth={1.5} />;
}
