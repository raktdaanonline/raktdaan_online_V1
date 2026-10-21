export const EVENT_CATEGORIES = [
  { value: "Birthday", label: "Birthday", icon: "🎂", color: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8" },
  { value: "Anniversary", label: "Anniversary", icon: "💍", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  { value: "Blood Donation Camp", label: "Blood Donation Camp", icon: "🩸", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { value: "Awareness Day", label: "Awareness Day", icon: "🎗️", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { value: "Health Campaign", label: "Health Campaign", icon: "🏥", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { value: "Meeting", label: "Meeting", icon: "💼", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { value: "Festival", label: "Festival", icon: "🪔", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  { value: "General Event", label: "General Event", icon: "📅", color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
  { value: "Other", label: "Other", icon: "📌", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
];

export const getCategoryMeta = (catName) => {
  return (
    EVENT_CATEGORIES.find((c) => c.value === catName) || {
      value: catName || "Other",
      label: catName || "Other",
      icon: "📌",
      color: "#475569",
      bg: "#f8fafc",
      border: "#e2e8f0",
    }
  );
};

export const REMINDER_OFFSET_PRESETS = [
  { days: 30, label: "30 days before" },
  { days: 15, label: "15 days before" },
  { days: 10, label: "10 days before" },
];

export const REMINDER_CHANNELS = [
  { value: "in_app", label: "In-App Notification", icon: "🔔" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
];

export const RECURRENCE_OPTIONS = [
  { value: "none", label: "No Recurrence (One-time)" },
  { value: "weekly", label: "Every Week" },
  { value: "monthly", label: "Every Month" },
  { value: "yearly", label: "Every Year" },
];
