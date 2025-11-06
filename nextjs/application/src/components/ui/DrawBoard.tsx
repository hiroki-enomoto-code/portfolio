import React, { FC, useEffect, useRef, useState, useCallback, memo } from "react";
import imageCompression from "browser-image-compression";

import {
    Box, Card, parseColor, Flex, Tabs,
    ColorPicker, IconButton, SegmentGroup, Icon, Grid, GridItem,
    Popover, VStack, Portal, HStack, Show, Button, useSlider, Slider
} from "@chakra-ui/react";
import { HiPaintBrush } from "react-icons/hi2";
import { LuEraser, LuCheck, LuType, LuPlus } from "react-icons/lu";
import { IoReturnDownBack } from "react-icons/io5";
import { RiResetLeftLine } from "react-icons/ri";
import { TbSend2 } from "react-icons/tb";

type Props = {
    onExport: (image: string) => void;
};

const defaultColor = "#111827";

const DrawBoard: FC<Props> = memo(({ onExport }) => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const historyIndexRef = useRef<number>(-1);
    const renderVersion = useRef(0);
    const hasMovedRef = useRef(false);

    const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
    const [penSize, setPenSize] = useState(6);

    const [color, setColor] = useState(parseColor("#FF0000"))
    const [view, setView] = useState<"picker" | "swatch">("swatch")
    const [swatches, setSwatches] = useState<string[]>([
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
    ]);

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
        ctx.lineWidth = penSize;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = activeTool === "pen" ? color.toString('hex') : "#ffffff";
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
            cursorRef.current!.style.transform = `translate(${e.clientX - (penSize / 2)}px, ${e.clientY - (penSize / 2)}px)`;
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
    }, [isDrawing, penSize, color, activeTool, snapshot]);

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

    return (
        <Box
            padding="2"
            bg="white"
            width="fit-content"
            rounded="md"
        >
            <Grid gap="2">
                <GridItem>
                    <Card.Root>
                        <Card.Body
                            padding="1"
                            ref={wrapperRef}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{ borderRadius: 4 }}
                            />
                        </Card.Body>
                    </Card.Root>
                </GridItem>
                <GridItem>
                    <Flex
                        gap="4"
                        justify="space-between"
                        width="100%"
                    >
                        <Flex
                            gap="4"
                            align="center"
                        >
                            <SegmentGroup.Root
                                size="sm"
                                defaultValue={activeTool}
                                onValueChange={(e) => setActiveTool(e.value as 'pen' | 'eraser')}
                            >
                                <SegmentGroup.Indicator />
                                <SegmentGroup.Items
                                    items={[
                                        {
                                            value: "pen",
                                            label: (
                                                <HiPaintBrush />
                                            ),
                                        },
                                        {
                                            value: "eraser",
                                            label: (
                                                <LuEraser />
                                            ),
                                        }
                                    ]}

                                />
                            </SegmentGroup.Root>

                            <ColorPicker.Root
                                defaultValue={color}
                                onValueChange={(e) => setColor(e.value)}
                                maxW="200px"
                            >
                                <ColorPicker.HiddenInput />
                                <ColorPicker.Control>
                                    <ColorPicker.Trigger data-fit-content>
                                        <VStack gap="1">
                                            <LuType />
                                            <ColorPicker.ValueSwatch h="2" />
                                        </VStack>
                                    </ColorPicker.Trigger>
                                </ColorPicker.Control>

                                <Portal>
                                    <ColorPicker.Positioner style={{ zIndex: 1500 }}>
                                        <ColorPicker.Content>
                                            <Show when={view === "picker"}>
                                                <ColorPicker.Area />
                                                <HStack>
                                                    <ColorPicker.EyeDropper size="sm" variant="outline" />
                                                    <ColorPicker.Sliders />
                                                </HStack>
                                                <Button
                                                    onClick={() => {
                                                        setSwatches((prev) => [...prev, color.toString("css")])
                                                        setView("swatch")
                                                    }}
                                                >
                                                    Save Swatch
                                                </Button>
                                            </Show>
                                            <Show when={view === "swatch"}>
                                                <ColorPicker.SwatchGroup>
                                                    {swatches.map((swatch) => (
                                                        <ColorPicker.SwatchTrigger key={swatch} value={swatch}>
                                                            <ColorPicker.Swatch value={swatch}>
                                                                <ColorPicker.SwatchIndicator>
                                                                    <LuCheck />
                                                                </ColorPicker.SwatchIndicator>
                                                            </ColorPicker.Swatch>
                                                        </ColorPicker.SwatchTrigger>
                                                    ))}
                                                    <IconButton
                                                        variant="outline"
                                                        size="xs"
                                                        onClick={() => setView("picker")}
                                                    >
                                                        <LuPlus />
                                                    </IconButton>
                                                </ColorPicker.SwatchGroup>
                                            </Show>
                                        </ColorPicker.Content>
                                    </ColorPicker.Positioner>
                                </Portal>
                            </ColorPicker.Root>

                            <Slider.Root
                                size="sm"
                                width="100px"
                                value={[penSize]}
                                onValueChange={(e) => setPenSize(e.value[0])}
                            >
                                <Slider.Control>
                                    <Slider.Track>
                                        <Slider.Range />
                                    </Slider.Track>
                                    <Slider.Thumbs />
                                </Slider.Control>
                            </Slider.Root>

                            <Flex gap="2">
                                <IconButton
                                    size="sm"
                                    variant="outline"
                                    onClick={undo}
                                    height="30px"
                                >
                                    <IoReturnDownBack />
                                </IconButton>

                                <IconButton
                                    size="sm"
                                    variant="outline"
                                    onClick={redo}
                                    height="30px"
                                    transform="scaleX(-1)"
                                >
                                    <IoReturnDownBack />
                                </IconButton>

                                <IconButton
                                    size="sm"
                                    variant="outline"
                                    onClick={clearCanvas}
                                    height="30px"
                                >
                                    <RiResetLeftLine />
                                </IconButton>
                            </Flex>
                        </Flex>

                        <IconButton
                            size="sm"
                            variant="outline"
                            height="30px"
                            onClick={exportCompressed}
                        >
                            <TbSend2 />
                        </IconButton>
                    </Flex>
                </GridItem>
            </Grid>
            <div
                ref={cursorRef}
                style={{
                    position: "fixed",
                    transform: "translate(-9999px, -9999px)",
                    left: 0,
                    top: 0,
                    width: penSize,
                    height: penSize,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    border: activeTool === "eraser" ? "1px solid #000" : "1px solid #fff",
                    background: activeTool === "eraser" ? "rgba(255,255,255,0.5)" : color.toString("hex"),
                }}
            />
        </Box>
    );
});

export default DrawBoard;