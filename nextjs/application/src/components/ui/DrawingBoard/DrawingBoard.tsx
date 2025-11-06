import React, { FC, useEffect, useRef, useState, useCallback, memo } from "react";
import imageCompression from "browser-image-compression";

import PaintBrushIcon from "@/components/icon/PaintBrushIcon";
import EraserIcon from "@/components/icon/EraserIcon";
import ReturnIcon from "@/components/icon/ReturnIcon";
import SendIcon from "@/components/icon/SendIcon";

type Props = {
    onExport: (image: string) => void;
};

const defaultColor = "#111827";

const DrawingBoard: FC<Props> = memo(({ onExport }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const historyIndexRef = useRef<number>(-1);
    const renderVersion = useRef(0);
    const hasMovedRef = useRef(false);

    const [color, setColor] = useState<string>(defaultColor);
    const [colorHistory, setColorHistory] = useState<string[]>([defaultColor]);
    const [size, setSize] = useState<number>(6);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [history, setHistory] = useState<string[]>([]);

    const canvasToBlob = (canvas: HTMLCanvasElement, type = "image/png", quality?: number) =>
        new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, quality);
        }
        );

    const exportCompressed = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const srcBlob = await canvasToBlob(canvas, "image/png");
        const srcFile = new File([srcBlob], "drawing.png", { type: "image/png" });

        const options = {
            maxSizeMB: 0.1,
            maxWidthOrHeight: 500,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.9,
            maxIteration: 10,
        } as const;
        const compressedFile = await imageCompression(srcFile, options);

        const reader = new FileReader();
        reader.onloadend = () => {
            onExport(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
    }, []);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        // 現在の見た目を保持（リサイズ時のみ）
        const prevCanvas = document.createElement("canvas");
        const prevRect = canvas.getBoundingClientRect();
        prevCanvas.width = Math.max(1, Math.floor(prevRect.width));
        prevCanvas.height = Math.max(1, Math.floor(prevRect.height));
        const prevCtx = prevCanvas.getContext("2d");
        if (prevCtx) prevCtx.drawImage(canvas, 0, 0, prevCanvas.width, prevCanvas.height);

        const width = 600;
        const height = 400;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${Math.floor(width)}px`;
        canvas.style.height = `${Math.floor(height)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        if (prevCtx && prevCanvas.width && prevCanvas.height) {
            ctx.drawImage(prevCanvas, 0, 0, prevCanvas.width, prevCanvas.height, 0, 0, width, height);
        } else {
            // 初期化時のみ白背景を敷く
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
        }
    }, []);

    useEffect(() => {
        resizeCanvas();
        const ro = new ResizeObserver(resizeCanvas);
        if (wrapperRef.current) ro.observe(wrapperRef.current);
        return () => ro.disconnect();
    }, [resizeCanvas]);

    const applyHistory = useCallback((index: number) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        const rect = canvas.getBoundingClientRect();

        if (index < 0) {
            // 履歴なし → 白紙
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, rect.width, rect.height);
            return;
        }

        const v = ++renderVersion.current;
        const img = new Image();
        img.onload = () => {
            if (v !== renderVersion.current) return;
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
        };
        img.src = history[index];
    }, [history]);

    const snapshot = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");

        setHistory(prev => {
            let cut = prev.slice(0, historyIndexRef.current + 1);
            cut = cut.concat(url);

            if (cut.length > 15) {
                cut = cut.slice(cut.length - 15);
            }

            const newIndex = cut.length - 1;
            historyIndexRef.current = newIndex;
            return cut;
        });
    }, []);

    const startDraw = (x: number, y: number) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = size;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = tool === "pen" ? color : "#ffffff";
        setIsDrawing(true);

        hasMovedRef.current = false;
    };

    const draw = (x: number, y: number) => {
        const ctx = ctxRef.current;
        if (!ctx || !isDrawing) return;
        ctx.lineTo(x, y);
        ctx.stroke();

        hasMovedRef.current = true;
    };

    const endDraw = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (hasMovedRef.current) {
            snapshot();
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getPos = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };

        const down = (e: PointerEvent) => {
            try { canvas.setPointerCapture(e.pointerId); } catch { }
            const p = getPos(e);
            startDraw(p.x, p.y);
        };
        const move = (e: PointerEvent) => {
            cursorRef.current!.style.transform = `translate(${e.clientX - (size / 2)}px, ${e.clientY - (size / 2)}px)`;
            if (!isDrawing) return;
            const p = getPos(e);
            draw(p.x, p.y);
        };
        const up = (e?: PointerEvent) => {
            if (e) { try { canvas.releasePointerCapture(e.pointerId); } catch { } }
            endDraw();
        };
        const leave = (e: PointerEvent) => {
            cursorRef.current!.style.transform = "translate(-9999px, -9999px)";
            up(e);
        };

        canvas.addEventListener("pointerdown", down);
        canvas.addEventListener("pointermove", move);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointerleave", leave);

        return () => {
            canvas.removeEventListener("pointerdown", down);
            canvas.removeEventListener("pointermove", move);
            canvas.removeEventListener("pointerup", up);
            canvas.removeEventListener("pointerleave", leave);
        };
    }, [isDrawing, size, color, tool, snapshot]);

    const undo = useCallback(() => {
        if (historyIndexRef.current < 0) return;
        const nextIndex = historyIndexRef.current - 1;
        historyIndexRef.current = nextIndex;
        applyHistory(nextIndex);
    }, [applyHistory]);

    const redo = useCallback(() => {
        if (historyIndexRef.current >= history.length - 1) return;
        const nextIndex = historyIndexRef.current + 1;
        historyIndexRef.current = nextIndex;
        applyHistory(nextIndex);
    }, [history.length, applyHistory]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isMod = e.ctrlKey || e.metaKey;
            if (!isMod) return;
            const key = e.key.toLowerCase();
            if (key === "z") {
                e.preventDefault();
                e.shiftKey ? redo() : undo();
            } else if (key === "y") {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [undo, redo]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        snapshot();
    }, [snapshot]);

    useEffect(() => {
        setColorHistory(prev => {
            const newHistory = [...prev, color];
            if (newHistory.length > 10) {
                newHistory.shift();
            }
            return newHistory;
        });
    },[color]);

    // console.log(history);
    // console.log(`History Index: ${historyIndexRef.current}`);

    return (
        <div className="c-DrawingBoard">
            <div className="c-DrawingBoard_main">
                <div ref={wrapperRef} className="c-DrawingBoardPaintarea">
                    <canvas ref={canvasRef} className="canvas-element" />
                </div>
                <div className="c-DrawingBoardColorHistory">
                    {
                        ['#111827', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'].map((c, idx) => (
                            <button
                                key={idx}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            ></button>
                        ))
                    }
                </div>
            </div>

            <div className="c-DrawingBoardControls">
                <div className="c-DrawingBoardControls_inner">
                    <div className="c-DrawingBoardControls_group">
                        <div className={`c-DrawingBoardControlsButton${tool === 'pen' ? ' is-active' : ''}`}>
                            <div className="c-DrawingBoardControlsButton_inner">
                                <button onClick={() => setTool("pen")}><PaintBrushIcon /></button>
                            </div>
                        </div>

                        <div className={`c-DrawingBoardControlsButton${tool === 'eraser' ? ' is-active' : ''}`}>
                            <div className="c-DrawingBoardControlsButton_inner">
                                <button onClick={() => setTool("eraser")}><EraserIcon /></button>
                            </div>
                        </div>
                    </div>

                    <div className="c-DrawingBoardControls_group">
                        <div className="c-DrawingBoardControlsButton">
                            <div className="colorPicker" style={{ backgroundColor: color }}>
                                <span className="colorPicker_color" style={{ width: size, height: size }}></span>
                                <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                            </div>
                        </div>

                        <div className="c-DrawingBoardControlsButton">
                            <div className="range">
                                <input type="range" min={1} max={48} value={size} data-size={size} data-color={color} onChange={e => setSize(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    <div className="c-DrawingBoardControls_group">
                        <div className="c-DrawingBoardControlsButton">
                            <div className="c-DrawingBoardControlsButton_inner">
                                <button onClick={undo}><ReturnIcon /></button>
                            </div>
                        </div>

                        <div className="c-DrawingBoardControlsButton">
                            <div className="c-DrawingBoardControlsButton_inner">
                                <button onClick={redo} className="is-reverse"><ReturnIcon /></button>
                            </div>
                        </div>

                        <div className="c-DrawingBoardControlsButton">
                            <button onClick={clearCanvas} className="is-reverse">Clear</button>
                        </div>
                    </div>
                </div>

                <div className="c-DrawingBoardControls_group">
                    <div className="c-DrawingBoardControlsButton">
                        <div className="c-DrawingBoardControlsButton_inner">
                            <button onClick={exportCompressed}><SendIcon /></button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                ref={cursorRef}
                style={{
                    position: "fixed",
                    transform: "translate(-9999px, -9999px)",
                    left: 0,
                    top: 0,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    border: tool === "eraser" ? "1px solid #000" : "1px solid #fff",
                    background: tool === "eraser" ? "rgba(255,255,255,0.5)" : color,
                }}
            />
        </div>
    );
});

export default DrawingBoard;