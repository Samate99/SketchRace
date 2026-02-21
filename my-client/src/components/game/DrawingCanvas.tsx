import { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";
import { Eraser, Pen, Undo2, Trash2 } from "lucide-react";
import { t, type Lang } from "../../lib/i18n";
import HandDrawn from "../ui/HandDrawn";

interface DrawingCanvasProps {
    isDrawer: boolean;
    drawLines: any[];
    onDraw: (data: { points: number[]; color: string; strokeWidth: number; tool: string }) => void;
    onClear: () => void;
    onUndo: () => void;
    lang: Lang;
}

const COLORS = [
    "#1e293b", // Ink
    "#64748b", // Grey
    "#ef4444", // Red
    "#f97316", // Orange
    "#eab308", // Yellow
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#ffffff", // White (Eraser/Correction)
];

const STROKE_WIDTHS = [
    { size: 2, label: 'Thin' },
    { size: 6, label: 'Medium' },
    { size: 12, label: 'Thick' },
    { size: 24, label: 'Bold' },
];

export default function DrawingCanvas({
    isDrawer,
    drawLines,
    onDraw,
    onClear,
    onUndo,
    lang,
}: DrawingCanvasProps) {
    const stageRef = useRef<Konva.Stage>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<number[]>([]);
    const [color, setColor] = useState("#1e293b");
    const [strokeWidth, setStrokeWidth] = useState(6);
    const [tool, setTool] = useState<"pen" | "eraser">("pen");
    const [stageSize, setStageSize] = useState({ width: 700, height: 500 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Responsive canvas sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const w = containerRef.current.clientWidth;
                const h = Math.min(w * 0.7, window.innerHeight - 350);
                setStageSize({ width: w, height: Math.max(h, 400) });
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handleMouseDown = useCallback(
        (e: any) => {
            if (!isDrawer) return;
            setIsDrawing(true);
            const pos = e.target.getStage()?.getPointerPosition();
            if (pos) {
                setCurrentPoints([pos.x, pos.y]);
            }
        },
        [isDrawer]
    );

    const handleMouseMove = useCallback(
        (e: any) => {
            if (!isDrawing || !isDrawer) return;
            const pos = e.target.getStage()?.getPointerPosition();
            if (pos) {
                setCurrentPoints((prev) => [...prev, pos.x, pos.y]);
            }
        },
        [isDrawing, isDrawer]
    );

    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !isDrawer) return;
        setIsDrawing(false);
        if (currentPoints.length >= 4) {
            onDraw({
                points: currentPoints,
                color: tool === "eraser" ? "#ffffff" : color,
                strokeWidth: tool === "eraser" ? strokeWidth * 4 : strokeWidth,
                tool,
            });
        }
        setCurrentPoints([]);
    }, [isDrawing, isDrawer, currentPoints, color, strokeWidth, tool, onDraw]);

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-1 min-h-[400px] bg-white relative cursor-crosshair group flex items-center justify-center p-4"
            >
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                >
                    <Layer>
                        {/* Render synced lines */}
                        {drawLines.map((line: any, i: number) => (
                            <Line
                                key={i}
                                points={line.points}
                                stroke={line.color || "#000000"}
                                strokeWidth={line.strokeWidth || 3}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                                globalCompositeOperation={
                                    line.tool === "eraser" ? "destination-out" : "source-over"
                                }
                            />
                        ))}
                        {/* Current drawing line (not yet committed) */}
                        {isDrawing && currentPoints.length >= 4 && (
                            <Line
                                points={currentPoints}
                                stroke={tool === "eraser" ? "#ffffff" : color}
                                strokeWidth={tool === "eraser" ? strokeWidth * 4 : strokeWidth}
                                tension={0.5}
                                lineCap="round"
                                lineJoin="round"
                                globalCompositeOperation={
                                    tool === "eraser" ? "destination-out" : "source-over"
                                }
                            />
                        )}
                    </Layer>
                </Stage>
            </div>

            {/* Drawing Tools */}
            {isDrawer && (
                <div className="flex flex-wrap items-center gap-6 justify-center py-2 shrink-0">
                    {/* Colors palette */}
                    <HandDrawn type="bubble" className="p-2 flex gap-2 bg-yellow-50/30">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setTool("pen"); }}
                                className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${color === c && tool === "pen"
                                    ? "border-slate-800 scale-125 z-10 shadow-md"
                                    : "border-slate-300"
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </HandDrawn>

                    {/* Stroke Widths */}
                    <HandDrawn type="bubble" className="p-2 flex gap-3">
                        {STROKE_WIDTHS.map((w) => (
                            <button
                                key={w.size}
                                onClick={() => setStrokeWidth(w.size)}
                                className={`flex items-center justify-center p-2 rounded-lg transition-all ${strokeWidth === w.size
                                    ? "bg-slate-100 text-slate-800 font-bold"
                                    : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <div
                                    className="rounded-full bg-current transition-all"
                                    style={{ width: Math.max(4, w.size / 1.5), height: Math.max(4, w.size / 1.5) }}
                                />
                            </button>
                        ))}
                    </HandDrawn>

                    {/* Tools & Actions */}
                    <HandDrawn type="bubble" className="p-2 flex gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTool("pen")}
                                className={`sketch-button p-2 ${tool === "pen" ? "bg-slate-800 text-white" : "text-slate-600"}`}
                                title={t("canvas.pen", lang)}
                            >
                                <Pen className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setTool("eraser")}
                                className={`sketch-button p-2 ${tool === "eraser" ? "bg-slate-800 text-white" : "text-slate-600"}`}
                                title={t("canvas.eraser", lang)}
                            >
                                <Eraser className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-px h-8 bg-slate-200" />

                        <div className="flex gap-2">
                            <button
                                onClick={onUndo}
                                className="sketch-button p-2 text-slate-600"
                                title={t("canvas.undo", lang)}
                            >
                                <Undo2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClear}
                                className="sketch-button p-2 text-red-500 hover:bg-red-50"
                                title={t("canvas.clear", lang)}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </HandDrawn>
                </div>
            )}
        </div>
    );
}

