"use client";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage, uploadImage, uploadImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Uploads files (or image links) to ImgBB via /api/upload and returns hosted URLs */
export function ImageUploader({
  value,
  onChange,
  max = 1,
  invalid,
  shape = "square",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  invalid?: boolean;
  shape?: "square" | "circle";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState("");
  const [addingLink, setAddingLink] = useState(false);
  const allowLink = shape === "square";

  const onLink = async () => {
    const url = link.trim();
    if (!url) return;
    if (value.length >= max) return toast.info(`You can add up to ${max} image${max > 1 ? "s" : ""}`);
    if (!/^https?:\/\//i.test(url)) return toast.error("Please paste a link that starts with http:// or https://");
    setAddingLink(true);
    try {
      const hosted = await uploadImageUrl(url);
      onChange([...value, hosted]);
      setLink("");
      toast.success("Image added");
    } catch (e) {
      toast.error(`Couldn't add image: ${errorMessage(e)}`);
    } finally {
      setAddingLink(false);
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - value.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) toast.info(`You can upload up to ${max} image${max > 1 ? "s" : ""}`);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of list) urls.push(await uploadImage(f));
      onChange([...value, ...urls]);
      toast.success(urls.length > 1 ? "Images uploaded" : "Image uploaded");
    } catch (e) {
      toast.error(`Upload failed: ${errorMessage(e)}`);
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const tile = shape === "circle" ? "size-24 rounded-full" : "aspect-square w-full rounded-xl";

  const tiles = (
    <div className={cn(shape === "circle" ? "flex items-center gap-4" : "grid grid-cols-3 gap-3 sm:grid-cols-5")}>
      {value.map((src, i) => (
        <div key={src} className={cn("relative overflow-hidden border bg-muted", tile)}>
          <Image src={src} alt={`Upload ${i + 1}`} fill sizes="120px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== src))}
            className="absolute top-1 right-1 grid size-6 cursor-pointer place-items-center rounded-full bg-black/60 text-white hover:bg-destructive"
            aria-label="Remove image"
          >
            <X className="size-3.5" />
          </button>
          {i === 0 && max > 1 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] font-semibold text-white">Cover</span>}
        </div>
      ))}
      {value.length < max && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => ref.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-wait",
            tile,
            invalid && "border-destructive text-destructive",
          )}
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          {uploading ? "Uploading…" : "Add image"}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" multiple={max > 1} hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  );

  if (!allowLink) return tiles;

  return (
    <div className="space-y-3">
      {tiles}
      {value.length < max && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              inputMode="url"
              placeholder="…or paste an image link (https://…)"
              value={link}
              disabled={addingLink}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // don't submit the whole form
                  onLink();
                }
              }}
              className="pl-9"
              aria-label="Image link"
            />
          </div>
          <Button type="button" variant="outline" onClick={onLink} disabled={addingLink || !link.trim()}>
            {addingLink ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {addingLink ? "Adding…" : "Add link"}
          </Button>
        </div>
      )}
    </div>
  );
}
