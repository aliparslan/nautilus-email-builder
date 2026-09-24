export const MAX_RECIPIENTS = 50;

export type RecipientGroup = {
  id: string;
  name: string;
  emails: string[];
};

export type RecipientSelection = {
  direct: string[];
  groupIds: string[];
};

export const EMPTY_SELECTION: RecipientSelection = { direct: [], groupIds: [] };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseAddresses(raw: string): { emails: string[]; invalid: string[] } {
  const parts = raw.split(/[\s,;]+/).map((part) => part.trim().toLowerCase()).filter(Boolean);
  return {
    emails: [...new Set(parts.filter((part) => EMAIL.test(part)))],
    invalid: [...new Set(parts.filter((part) => !EMAIL.test(part)))],
  };
}

export function expandRecipients(
  selection: RecipientSelection,
  groups: RecipientGroup[],
): string[] {
  const selected = new Set(selection.groupIds);
  const addresses = [
    ...selection.direct,
    ...groups.filter((group) => selected.has(group.id)).flatMap((group) => group.emails),
  ];
  return [...new Set(addresses.map((email) => email.trim().toLowerCase()).filter(Boolean))];
}
