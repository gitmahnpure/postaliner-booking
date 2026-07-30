import { useEffect, useRef } from "react";

export default function CanvasScroll({ totalFrames = 150, onProgressChange }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const loadedRef = useRef(new Set());
  const animFrameRef = useRef(null);
  const stateRef = useRef({
    currentFrame: 0,
    targetFrame: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const images = [];
    imagesRef.current = images;
    const loaded = loadedRef.current;

    function getOrLoadImage(index) {
      if (images[index]) return images[index];
      const numStr = String(index + 1).padStart(3, "0");
      const img = new Image();
      img.src = `/assets/frames/frame_${numStr}.jpg`;
      img.onload = () => {
        loaded.add(index);
        if (index === 0) resizeCanvas();
      };
      images[index] = img;
      return img;
    }

    const preloadQueue = [];
    let preloadIndex = 0;
    const PRELOAD_BATCH = 10;

    function queuePreload(start, count) {
      for (let i = start; i < Math.min(start + count, totalFrames); i++) {
        if (!images[i] && !preloadQueue.includes(i)) {
          preloadQueue.push(i);
        }
      }
    }

    function processPreloadQueue() {
      const batch = preloadQueue.splice(0, PRELOAD_BATCH);
      for (const idx of batch) {
        getOrLoadImage(idx);
      }
    }

    queuePreload(0, PRELOAD_BATCH);

    function drawImageCover(img) {
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      let renderW, renderH, x, y;
      if (canvasRatio > imgRatio) {
        renderW = cw;
        renderH = cw / imgRatio;
        x = 0;
        y = (ch - renderH) / 2;
      } else {
        renderH = ch;
        renderW = ch * imgRatio;
        x = (cw - renderW) / 2;
        y = 0;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, x, y, renderW, renderH);
    }

    function renderFrame(index) {
      const idx = Math.max(0, Math.min(totalFrames - 1, Math.floor(index)));
      const img = images[idx];
      if (img && img.complete) {
        drawImageCover(img);
      }
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      renderFrame(stateRef.current.currentFrame);
    }

    function animate() {
      const state = stateRef.current;
      state.currentFrame += (state.targetFrame - state.currentFrame) * 0.14;

      const currentIdx = Math.floor(state.currentFrame);
      const lookahead = Math.min(currentIdx + PRELOAD_BATCH, totalFrames);
      queuePreload(currentIdx + 1, lookahead - currentIdx);
      if (preloadQueue.length > 0 && preloadIndex < 10) {
        preloadIndex++;
        processPreloadQueue();
      } else if (preloadQueue.length > 0) {
        preloadIndex = 0;
        setTimeout(processPreloadQueue, 100);
      }

      renderFrame(state.currentFrame);
      animFrameRef.current = requestAnimationFrame(animate);
    }

    function handleScroll() {
      const track = document.getElementById("scrollTrack");
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const trackHeight = track.offsetHeight - window.innerHeight;
      if (trackHeight <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / trackHeight));
      stateRef.current.targetFrame = progress * (totalFrames - 1);
      if (onProgressChange) {
        onProgressChange(progress);
      }
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleScroll, { passive: true });

    resizeCanvas();
    processPreloadQueue();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [totalFrames, onProgressChange]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          background: "#080D18",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 100% 100% at 50% 30%, rgba(15,23,42,0.35) 0%, rgba(9,13,22,0.85) 100%)",
        }}
      />
    </>
  );
}