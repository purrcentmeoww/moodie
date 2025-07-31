import React, { useEffect, useRef } from "react";
const BubbleBackground = () => {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);
  const resizeTimeout = useRef(null);

  class Bubble {
    constructor(x, y, radius, speed, color, alphaSpeed) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.speed = speed;
      this.color = color;
      this.alpha = Math.random() * 0.5 + 0.3;
      this.alphaSpeed = alphaSpeed;
      this.directionX = (Math.random() - 0.5) * 0.5;
    }

    update(canvasHeight, canvasWidth) {
      this.y -= this.speed;
      this.x += this.directionX;
      this.alpha += this.alphaSpeed;
      if (this.alpha <= 0.3 || this.alpha >= 0.8) this.alphaSpeed *= -1;

      if (this.y + this.radius < 0) {
        this.y = canvasHeight + this.radius;
        this.x = Math.random() * canvasWidth;
      }

      if (this.x - this.radius < 0) this.x = this.radius;
      if (this.x + this.radius > canvasWidth) this.x = canvasWidth - this.radius;
    }

    draw(ctx) {
      const gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        this.radius * 0.1,
        this.x,
        this.y,
        this.radius
      );
      gradient.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
      gradient.addColorStop(1, `rgba(${this.color}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const colors = [
      "255, 197, 228",
      "238, 178, 255",
      "248, 255, 178",
      "178, 232, 255",
    ];

    const createBubbles = (num, width, height) => {
      bubbles.current = [];
      for (let i = 0; i < num; i++) {
        const radius = Math.random() * 40 + 20;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const speed = Math.random() * 0.5 + 0.3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const alphaSpeed =
          (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
        bubbles.current.push(new Bubble(x, y, radius, speed, color, alphaSpeed));
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // สร้าง bubbles ใหม่ให้เหมาะกับขนาดใหม่
      createBubbles(50, canvas.width, canvas.height);
    };

    resizeCanvas();

    let animationFrameId;
    const animate = () => {
      console.log("Rendering bubbles...");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach((bubble) => {
        bubble.update(canvas.height, canvas.width);
        bubble.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // debounce resize event ให้ไม่เรียกซ้ำเร็วเกินไป
    const handleResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        resizeCanvas();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};

export default BubbleBackground;
