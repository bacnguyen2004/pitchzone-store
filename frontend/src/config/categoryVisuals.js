import {
  AccessoriesCategoryIcon,
  FootballBootsCategoryIcon,
  JerseyCategoryIcon,
  PackageIcon,
} from "../components/StoreIcons";
import { homeImages } from "./homeImages";

export const categoryVisuals = homeImages.category;

export const categoryGradients = {
  default: "from-emerald-600 to-teal-800",
  "football-boots": "from-slate-700 to-emerald-900",
  clothing: "from-red-600 to-rose-800",
  jerseys: "from-red-600 to-rose-800",
  shorts: "from-blue-600 to-indigo-800",
  socks: "from-violet-600 to-purple-800",
  balls: "from-amber-500 to-orange-700",
  accessories: "from-cyan-600 to-teal-800",
};

export const categoryIcons = {
  "football-boots": FootballBootsCategoryIcon,
  clothing: JerseyCategoryIcon,
  jerseys: JerseyCategoryIcon,
  accessories: AccessoriesCategoryIcon,
};

export const categoryAccentStyles = {
  "football-boots": {
    ring: "ring-emerald-200/80",
    iconBg: "bg-emerald-600",
    softBg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  clothing: {
    ring: "ring-red-200/80",
    iconBg: "bg-red-600",
    softBg: "bg-red-50",
    text: "text-red-700",
  },
  jerseys: {
    ring: "ring-red-200/80",
    iconBg: "bg-red-600",
    softBg: "bg-red-50",
    text: "text-red-700",
  },
  shorts: {
    ring: "ring-blue-200/80",
    iconBg: "bg-blue-600",
    softBg: "bg-blue-50",
    text: "text-blue-700",
  },
  socks: {
    ring: "ring-violet-200/80",
    iconBg: "bg-violet-600",
    softBg: "bg-violet-50",
    text: "text-violet-700",
  },
  balls: {
    ring: "ring-amber-200/80",
    iconBg: "bg-amber-500",
    softBg: "bg-amber-50",
    text: "text-amber-700",
  },
  accessories: {
    ring: "ring-cyan-200/80",
    iconBg: "bg-cyan-600",
    softBg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  default: {
    ring: "ring-slate-200/80",
    iconBg: "bg-primary",
    softBg: "bg-primary-light",
    text: "text-primary",
  },
};

export function getCategoryIcon(slug) {
  return categoryIcons[slug] || PackageIcon;
}

export function getCategoryAccent(slug) {
  return categoryAccentStyles[slug] || categoryAccentStyles.default;
}

export function getCategoryGradient(slug) {
  return categoryGradients[slug] || categoryGradients.default;
}

export function getCategoryImage(slug) {
  return categoryVisuals[slug] || null;
}
