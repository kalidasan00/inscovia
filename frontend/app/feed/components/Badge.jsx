// components/Badge.jsx
// Role badge shown next to author name: Professor / Institute / Student

import { GraduationCap, Building2, User } from "lucide-react";

const ROLE_MAP = {
  professor: {
    label: "Professor",
    cls: "bg-purple-50 text-purple-700 border border-purple-100",
    Icon: GraduationCap,
  },
  institute: {
    label: "Institute",
    cls: "bg-blue-50 text-blue-700 border border-blue-100",
    Icon: Building2,
  },
  student: {
    label: "Student",
    cls: "bg-green-50 text-green-700 border border-green-100",
    Icon: User,
  },
};

export default function Badge({ role }) {
  const cfg = ROLE_MAP[role];
  if (!cfg) return null;
  const { Icon } = cfg;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.cls}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}