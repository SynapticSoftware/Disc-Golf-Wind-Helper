// Tailwind class tokens shared across web and mobile (NativeWind)

export const discColors = {
  understable: {
    bg:     "bg-sky-900/40",
    border: "border-sky-500",
    accent: "text-sky-400",
    badge:  "bg-sky-500/20 text-sky-300",
    dot:    "bg-sky-400",
  },
  stable: {
    bg:     "bg-emerald-900/40",
    border: "border-emerald-500",
    accent: "text-emerald-400",
    badge:  "bg-emerald-500/20 text-emerald-300",
    dot:    "bg-emerald-400",
  },
  overstable: {
    bg:     "bg-orange-900/40",
    border: "border-orange-500",
    accent: "text-orange-400",
    badge:  "bg-orange-500/20 text-orange-300",
    dot:    "bg-orange-400",
  },
};

export const angleLabels = {
  hyzer:   { label: "Hyzer",   sub: "Disc tilted left" },
  flat:    { label: "Flat",    sub: "Level release" },
  anhyzer: { label: "Anhyzer", sub: "Disc tilted right" },
};

export const confidenceStyle = {
  best:  { label: "BEST",  cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" },
  good:  { label: "GOOD",  cls: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" },
  risky: { label: "RISKY", cls: "bg-red-500/20 text-red-300 border border-red-500/40" },
};
