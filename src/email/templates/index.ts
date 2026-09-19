import type { EmailData } from "../config";
import { padding } from "../fields/shared";
import { block, document } from "./block";
import { newsletter } from "./newsletter";
import { promo } from "./promo";
import { welcome } from "./welcome";

export type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  data: EmailData;
};

const blank = document({ subject: "", previewText: "" }, [
  block("Section", "section", { padding: padding(32), children: [] }),
]);

export const templates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome",
    description: "Onboard a new member and confirm their plan.",
    data: welcome,
  },
  {
    id: "newsletter",
    name: "Monthly report",
    description: "Usage stats plus what's new at the wash.",
    data: newsletter,
  },
  {
    id: "promo",
    name: "Upgrade promo",
    description: "Dark hero, plan comparison, time-boxed offer.",
    data: promo,
  },
  {
    id: "blank",
    name: "Blank",
    description: "One empty section. Start from scratch.",
    data: blank,
  },
];

export const defaultTemplate = templates[0];

// Puck indexes blocks by id; a duplicate sends its tree walk into infinite recursion.
if (process.env.NODE_ENV !== "production") {
  for (const template of templates) assertUniqueIds(template);
}

function assertUniqueIds({ id, data }: EmailTemplate) {
  const seen = new Set<string>();
  const visit = (content: unknown) => {
    if (!Array.isArray(content)) return;
    for (const item of content as Array<{ props: Record<string, unknown> }>) {
      const blockId = String(item.props.id);
      if (seen.has(blockId))
        throw new Error(
          `Template "${id}" has a duplicate block id: ${blockId}`,
        );
      seen.add(blockId);
      Object.values(item.props).forEach(visit);
    }
  };
  visit(data.content);
}
