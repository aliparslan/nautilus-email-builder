"use client";

import { Drawer } from "@puckeditor/core";
import { ImagePlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { fileToDataUrl } from "@/components/fields/ImageField";
import { MISTER_ASSETS } from "@/brands/mister";
import type { EmailData } from "@/email/config";
import { imageSources, type ImageAsset } from "./editor-data";

export function AssetsPanel({
  data,
  onInsert,
  onDragStart,
}: {
  data: EmailData;
  onInsert: (src: string, alt?: string) => void;
  onDragStart: (asset: ImageAsset | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const brandSources = new Set(MISTER_ASSETS.map((asset) => asset.src));
  const images = imageSources(data).filter((src) => !brandSources.has(src));

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      onInsert(await fileToDataUrl(file));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to read that image.",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6 p-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-divide bg-white text-sm font-semibold text-charcoal-800 hover:border-brand/60 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        <ImagePlus className="size-4" />
        {busy ? "Uploading…" : "Upload image"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <AssetSection title="Mister Car Wash">
        <Drawer>
          <div className="grid grid-cols-2 gap-2">
            {MISTER_ASSETS.map((asset) => (
              <AssetTile
                key={asset.id}
                id={asset.id}
                name={asset.name}
                alt={asset.alt}
                thumbnail={asset.thumbnail}
                src={asset.src}
                onInsert={onInsert}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        </Drawer>
      </AssetSection>
      {images.length ? (
        <AssetSection title="In this email">
        <Drawer>
          <div className="grid grid-cols-2 gap-2">
            {images.map((src, index) => (
              <AssetTile
                key={src}
                id={`asset-${index}`}
                name={`Draft image ${index + 1}`}
                alt=""
                thumbnail={src}
                src={src}
                onInsert={onInsert}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        </Drawer>
        </AssetSection>
      ) : null}
    </div>
  );
}

function AssetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="px-1 pb-3 text-xs font-semibold text-charcoal-800 dark:text-neutral-200">{title}</h3>
      {children}
    </section>
  );
}

function AssetTile({ id, name, alt, thumbnail, src, onInsert, onDragStart }: {
  id: string;
  name: string;
  alt: string;
  thumbnail: string;
  src: string;
  onInsert: (src: string, alt?: string) => void;
  onDragStart: (asset: ImageAsset | null) => void;
}) {
  // Puck uses Drawer.Item's child as a component type; keep it stable across document edits.
  const latest = useRef({ name, alt, thumbnail, src, onInsert, onDragStart });
  useEffect(() => {
    latest.current = { name, alt, thumbnail, src, onInsert, onDragStart };
  }, [name, alt, thumbnail, src, onInsert, onDragStart]);
  const renderTile = useCallback(() => {
    const current = latest.current;
    const activate = () => {
      current.onDragStart(null);
      current.onInsert(current.src, current.alt);
    };
    return (
      <div
        role="button"
        tabIndex={0}
        onPointerDown={() =>
          current.onDragStart({ src: current.src, alt: current.alt })
        }
        onDragEnd={() => current.onDragStart(null)}
        onPointerCancel={() => current.onDragStart(null)}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }}
        title={`Insert ${current.name}; drag to place`}
        className="group cursor-grab focus-visible:outline-2 focus-visible:outline-brand active:cursor-grabbing"
      >
        <span className="block aspect-[4/3] overflow-hidden rounded-lg border border-divide bg-white p-2 transition-colors group-hover:border-brand/60 dark:border-neutral-700 dark:bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- supports local, remote, and data URL assets */}
          <img src={current.thumbnail} alt="" draggable={false} className="h-full w-full object-contain" />
        </span>
        <span className="mt-1.5 block truncate text-[11px] font-medium text-charcoal-800 dark:text-neutral-200">{current.name}</span>
      </div>
    );
  }, []);
  return (
    <Drawer.Item id={id} name="Image" label={name}>
      {renderTile}
    </Drawer.Item>
  );
}
