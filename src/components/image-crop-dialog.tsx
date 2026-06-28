import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Move, ZoomIn } from "lucide-react";
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
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const computeCrop = useCallback((): CropArea | null => {
    const img = imgRef.current;
    if (!img) return null;
    const base = centerCropArea(img.naturalWidth, img.naturalHeight, aspect);
    const scaledW = base.width / zoom;
    const scaledH = base.height / zoom;
    const maxPanX = Math.max(0, (base.width - scaledW) / 2);
    const maxPanY = Math.max(0, (base.height - scaledH) / 2);
    return {
      x: base.x + (base.width - scaledW) / 2 - pan.x * maxPanX,
      y: base.y + (base.height - scaledH) / 2 - pan.y * maxPanY,
      width: scaledW,
      height: scaledH,
    };
  }, [aspect, zoom, pan]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = (e.clientX - dragStart.current.x) / 120;
    const dy = (e.clientY - dragStart.current.y) / 120;
    setPan({
      x: Math.max(-1, Math.min(1, dragStart.current.panX + dx)),
      y: Math.max(-1, Math.min(1, dragStart.current.panY + dy)),
    });
  };

  const onPointerUp = () => setDragging(false);

  const handleConfirm = async () => {
    if (!file) return;
    const crop = computeCrop();
    if (!crop) return;
    setBusy(true);
    try {
      const cropped = await cropImageFile(file, crop);
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
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Move className="h-3.5 w-3.5" /> Glissez pour rogner · zoomez si besoin
        </p>
        <div
          className="relative mt-4 touch-none overflow-hidden rounded-xl bg-black"
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            ref={imgRef}
            src={preview}
            alt=""
            draggable={false}
            className="h-full w-full object-cover select-none"
            style={{
              transform: `scale(${zoom}) translate(${pan.x * 12}%, ${pan.y * 12}%)`,
              transition: dragging ? "none" : "transform 0.15s ease",
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-white/80 ring-inset" />
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
