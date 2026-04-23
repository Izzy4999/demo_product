"use client";
import { useRef, useEffect, useState } from "react";

interface Props {
  code: string;
  onScratched?: () => void;
}

export default function ScratchCard({ code, onScratched }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scratched, setScratched] = useState(false);
  const [percent, setPercent] = useState(0);
  const isDrawing = useRef(false);
  const calledBack = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with silver stripe pattern
    const size = 8;
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = size * 2;
    patternCanvas.height = size * 2;
    const pc = patternCanvas.getContext("2d")!;
    pc.fillStyle = "#b0b0b0";
    pc.fillRect(0, 0, size * 2, size * 2);
    pc.fillStyle = "#c8c8c8";
    pc.beginPath();
    pc.moveTo(0, 0); pc.lineTo(size, 0); pc.lineTo(0, size); pc.closePath();
    pc.fill();
    pc.beginPath();
    pc.moveTo(size, size); pc.lineTo(size * 2, size); pc.lineTo(size * 2, size * 2); pc.lineTo(size, size * 2); pc.closePath();
    pc.fill();

    const pattern = ctx.createPattern(patternCanvas, "repeat");
    ctx.fillStyle = pattern!;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Overlay text
    ctx.fillStyle = "rgba(80,80,80,0.7)";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✦  Scratch to reveal  ✦", canvas.width / 2, canvas.height / 2 + 5);
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function scratch(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas || scratched) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // measure cleared %
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 0) cleared++;
    const pct = Math.round((cleared / (canvas.width * canvas.height)) * 100);
    setPercent(pct);
    if (pct > 55 && !calledBack.current) {
      calledBack.current = true;
      setScratched(true);
      onScratched?.();
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white select-none"
        style={{ width: 240, height: 120 }}
      >
        {/* Code underneath — always rendered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
          <p className="text-xs text-gray-500 mb-1">Your Verification Code</p>
          <p className="text-lg font-black tracking-widest text-[#BE0303] font-mono">{code}</p>
          <p className="text-[10px] text-gray-400 mt-1">Send to 38353</p>
        </div>

        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          width={480}
          height={240}
          className="absolute inset-0 w-full h-full"
          style={{
            touchAction: "none",
            cursor: scratched ? "default" : "crosshair",
            opacity: scratched ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
          onMouseDown={(e) => { isDrawing.current = true; scratch(e); }}
          onMouseMove={(e) => { if (isDrawing.current) scratch(e); }}
          onMouseUp={() => { isDrawing.current = false; }}
          onMouseLeave={() => { isDrawing.current = false; }}
          onTouchStart={(e) => { e.preventDefault(); isDrawing.current = true; scratch(e); }}
          onTouchMove={(e) => { e.preventDefault(); if (isDrawing.current) scratch(e); }}
          onTouchEnd={() => { isDrawing.current = false; }}
        />
      </div>

      {!scratched ? (
        <p className="text-xs text-gray-400">
          {percent === 0 ? "Click and drag to scratch the label" : `${percent}% scratched — keep going!`}
        </p>
      ) : (
        <p className="text-xs text-green-600 font-semibold">Code revealed! Copy and send to 38353</p>
      )}
    </div>
  );
}
