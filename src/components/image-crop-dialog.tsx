import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ZoomIn } from "lucide-react";
import { centerCropArea, cropImageFile, type CropArea } from "@/lib/image-crop";

type Props = {
  file: File | null;
  aspect: number;
  title: string;
  onClose: () => void;
  onConfirm: (file: File) => void;
};

export function ImageCropDialog({ file, aspect, title, onClose, onConfirm }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState<CropArea | null>(null);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setZoom(1);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    setCrop(centerCropArea(img.naturalWidth, img.naturalHeight, aspect));
  }, [aspect]);

  const handleConfirm = async () => {
    if (!file || !crop || !imgRef.current) return;
    setBusy(true);
    try {
      const img = imgRef.current;
      const base = centerCropArea(img.naturalWidth, img.naturalHeight, aspect);
      const scale = 1 / zoom;
      const w = base.width * scale;
      const h = base.height * scale;
      const x = base.x + (base.width - w) / 2;
      const y = base.y + (base.height - h) / 2;
      const cropped = await cropImageFile(file, { x, y, width: w, height: h });
      onConfirm(cropped);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!file || !preview) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-xl">
        <h3 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Ajustez le zoom puis validez.</p>
        <div className="relative mt-4 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: String(aspect) }}>
          <img
            ref={imgRef}
            src={preview}
            alt=""
            onLoad={onImgLoad}
            className="h-full w-full object-cover transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
        <label className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <ZoomIn className="h-4 w-4 shrink-0" />
          <input type="range" min={1} max={2.5} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
        </label>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2.5 text-xs font-semibold uppercase">
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-vsm-red py-2.5 text-xs font-semibold uppercase text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
          </button>
        </div>
      </div>
    </div>
  );
}
