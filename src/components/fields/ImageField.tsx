"use client";

import { useRef, useState } from "react";

const MAX_EDGE = 1200;
const MAX_BYTES = 1_500_000;

export type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  id: string;
};

/**
 * URL-or-upload control for image blocks. Uploads are downscaled in the browser and stored
 * as a data URL inside the document so no storage service is needed; at send time they
 * become inline (CID) attachments, see src/email/inline-images.ts.
 */
export function ImageField({
  label,
  value,
  onChange,
  readOnly,
  id,
}: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUpload = value?.startsWith("data:");

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      onChange(await fileToDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="puck-field">
      <div className="puck-field__label">{label}</div>
      <div className="puck-field__row">
        <input
          type="text"
          id={id}
          className="puck-field__input"
          value={isUpload ? "" : (value ?? "")}
          placeholder={isUpload ? "Uploaded image" : "https://"}
          disabled={readOnly || isUpload}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value.trim())}
        />
        <button
          type="button"
          className="puck-field__button"
          disabled={readOnly || busy}
          onClick={() => (isUpload ? onChange("") : fileRef.current?.click())}
        >
          {busy ? "Reading…" : isUpload ? "Clear" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>
      {isUpload && (
        <div className="puck-field__thumb">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
          <img src={value} alt="" />
          <span>Inline image · {formatBytes(dataUrlBytes(value))}</span>
        </div>
      )}
      {error && <div className="puck-field__error">{error}</div>}
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  // GIFs lose animation through a canvas; keep small ones untouched.
  if (file.type === "image/gif" && file.size <= MAX_BYTES)
    return readAsDataUrl(file);

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const keepPng = file.type === "image/png" && hasTransparency(canvas);
  const url = keepPng
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.85);
  if (dataUrlBytes(url) > MAX_BYTES) {
    throw new Error(
      `Image is too large after compression (max ${formatBytes(MAX_BYTES)})`,
    );
  }
  return url;
}

function hasTransparency(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.floor((base64.length * 3) / 4);
}

function formatBytes(bytes: number): string {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} KB`;
}
