import {
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  LibraryBig,
  SquarePlus,
} from "lucide-react";

/** Share panel icons with onboarding so the illustrated actions match the rail. */
export const PANEL_ICONS = {
  layers: Layers,
  assets: ImageIcon,
  blocks: SquarePlus,
  patterns: LibraryBig,
  templates: LayoutTemplate,
} as const;

export const RAIL_TOP = [
  { id: "layers", label: "Layers", Icon: PANEL_ICONS.layers },
  { id: "assets", label: "Assets", Icon: PANEL_ICONS.assets },
  { id: "blocks", label: "Blocks", Icon: PANEL_ICONS.blocks },
  { id: "patterns", label: "Patterns", Icon: PANEL_ICONS.patterns },
  { id: "templates", label: "Templates", Icon: PANEL_ICONS.templates },
] as const;
