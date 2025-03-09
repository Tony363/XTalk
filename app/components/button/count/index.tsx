import React, { useRef, useEffect } from "react";

interface CanvasCircleAnimationProps {
  duration: number;
  messageId: string;
}

const CanvasCircleAnimation: React.FC<CanvasCircleAnimationProps> = ({
  duration,
  messageId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const centerX = canvas.width / 2 / dpr;
      const centerY = canvas.height / 2 / dpr;
      const radius = 12;

      let startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2;
      const startTime = performance.now();

      const drawBaseCircle = () => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(65, 77 ,89)";
        ctx.fill();
      };

      const drawSector = (currentAngle: number) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
        ctx.closePath();
        ctx.fillStyle = "rgb(8, 17 ,25)";
        ctx.fill();
      };

      const drawText = (text: string) => {
        ctx.font = "bold 16px Jost";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, centerX, centerY + 2);
      };

      const animate = (now: number) => {
        const elapsedTime = now - startTime;
        const remainingTime = Math.max(duration - elapsedTime, 0);
        const currentAngle =
          startAngle +
          ((Math.PI * 2) / (duration / (1000 / 60))) *
            (elapsedTime / (1000 / 60));
        const text = (remainingTime / 1000).toFixed(0);
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        drawBaseCircle();
        drawSector(currentAngle);
        drawText(text);

        if (remainingTime > 0) {
          requestAnimationFrame(animate);
        } else {
          const event = new CustomEvent("countdownEnd", {
            detail: { messageId },
          });
          window.dispatchEvent(event);
        }
      };

      requestAnimationFrame(animate);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "30px",
        height: "30px",
      }}
    ></canvas>
  );
};

export { CanvasCircleAnimation };
