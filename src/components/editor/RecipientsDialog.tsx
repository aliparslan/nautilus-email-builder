"use client";

import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import type { useRecipients } from "@/hooks/useRecipients";
import {
  MAX_RECIPIENTS,
  parseAddresses,
  type RecipientGroup,
} from "@/lib/recipients";
import { Button } from "../ui/Button";
import { Dialog, DialogBody, DialogFooter } from "../ui/Dialog";
import { IconButton } from "../ui/IconButton";
import { RecipientsInput } from "./RecipientsInput";

type RecipientState = ReturnType<typeof useRecipients>;

export function RecipientsDialog({
  open,
  onClose,
  recipients,
}: {
  open: boolean;
  onClose: () => void;
  recipients: RecipientState;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Recipients" size="lg">
      {open && <RecipientsContent recipients={recipients} onClose={onClose} />}
    </Dialog>
  );
}

function RecipientsContent({
  recipients,
  onClose,
}: {
  recipients: RecipientState;
  onClose: () => void;
}) {
  const { groups, selection, addresses, setSelection, saveGroup, deleteGroup } =
    recipients;
  const [editing, setEditing] = useState<RecipientGroup | "new" | null>(null);
  const [name, setName] = useState("");
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function startEdit(group: RecipientGroup | "new") {
    setEditing(group);
    setName(group === "new" ? "" : group.name);
    setRaw(group === "new" ? "" : group.emails.join("\n"));
    setError(null);
  }

  function save() {
    const parsed = parseAddresses(raw);
    const trimmedName = name.trim();
    if (!trimmedName) return setError("Enter a group name.");
    if (
      groups.some(
        (group) =>
          group.name.toLowerCase() === trimmedName.toLowerCase() &&
          (editing === "new" || group.id !== editing?.id),
      )
    ) {
      return setError("A group with that name already exists.");
    }
    if (parsed.invalid.length)
      return setError(`Check these addresses: ${parsed.invalid.join(", ")}`);
    if (!parsed.emails.length)
      return setError("Add at least one email address.");
    if (parsed.emails.length > MAX_RECIPIENTS)
      return setError(`A group can contain up to ${MAX_RECIPIENTS} addresses.`);
    const id = editing === "new" ? crypto.randomUUID() : editing!.id;
    saveGroup({ id, name: trimmedName, emails: parsed.emails });
    if (editing === "new") {
      setSelection((current) => ({
        ...current,
        groupIds: [...current.groupIds, id],
      }));
    }
    setEditing(null);
    setError(null);
  }

  function toggleGroup(id: string) {
    setSelection((current) => ({
      ...current,
      groupIds: current.groupIds.includes(id)
        ? current.groupIds.filter((groupId) => groupId !== id)
        : [...current.groupIds, id],
    }));
  }

  return (
    <>
      <DialogBody className="space-y-6 p-6">
        <section>
          <h3 className="mb-2 text-sm font-semibold">Email addresses</h3>
          <RecipientsInput
            value={selection.direct}
            onChange={(direct) =>
              setSelection((current) => ({ ...current, direct }))
            }
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Groups</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              icon={<Plus className="size-4" />}
              onClick={() => startEdit("new")}
            >
              New group
            </Button>
          </div>
          {groups.length ? (
            <ul className="divide-y divide-divide overflow-hidden rounded-lg border border-divide dark:divide-neutral-800 dark:border-neutral-800">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex min-h-12 items-center gap-2 px-3"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      checked={selection.groupIds.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="accent-brand"
                    />
                    <Users
                      className="size-4 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {group.name}
                    </span>
                    <span className="text-xs tabular-nums text-gray-600 dark:text-neutral-400">
                      {group.emails.length}
                    </span>
                  </label>
                  <IconButton
                    label={`Edit ${group.name}`}
                    onClick={() => startEdit(group)}
                  >
                    <Pencil className="size-3.5" />
                  </IconButton>
                  <IconButton
                    label={`Delete ${group.name}`}
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </IconButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-divide px-4 py-6 text-center text-sm text-gray-600 dark:border-neutral-800 dark:text-neutral-400">
              No groups yet. Create one from a list of email addresses.
            </p>
          )}
        </section>

        {editing && (
          <section className="space-y-3 rounded-xl border border-divide bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {editing !== "new" && (
              <h3 className="text-sm font-semibold">Edit {editing.name}</h3>
            )}
            <label className="block text-xs font-medium" htmlFor="group-name">
              Group name
            </label>
            <input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              className="h-10 w-full rounded-lg border border-divide bg-white px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950"
            />
            <label
              className="block text-xs font-medium"
              htmlFor="group-addresses"
            >
              Addresses
            </label>
            <textarea
              id="group-addresses"
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={5}
              placeholder="name@example.com, another@example.com"
              className="w-full rounded-lg border border-divide bg-white p-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-brand dark:border-neutral-700 dark:bg-neutral-950"
            />
            <p className="text-xs text-gray-600 dark:text-neutral-400">
              Separate addresses with commas, semicolons, spaces, or new lines.
            </p>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={save}>
                Save group
              </Button>
            </div>
          </section>
        )}
      </DialogBody>
      <DialogFooter>
        <span
          className={`mr-auto text-sm tabular-nums ${addresses.length > MAX_RECIPIENTS ? "text-danger" : "text-gray-600 dark:text-neutral-400"}`}
          role="status"
        >
          {addresses.length} / {MAX_RECIPIENTS} unique recipients
        </span>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
}
