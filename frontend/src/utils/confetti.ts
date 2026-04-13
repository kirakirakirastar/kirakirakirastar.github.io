/**
 * A lightweight, dependency-free confetti implementation using Canvas API.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const fireConfetti = (originX: number = 0.5, originY: number = 0.5) => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  let width = canvas.width = window.innerWidth * window.devicePixelRatio;
  let height = canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const particles: Particle[] = [];
  const colors = ['#f472b6', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 8;
    particles.push({
      x: window.innerWidth * originX,
      y: window.innerHeight * originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 3, // Initial upward burst
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  const gravity = 0.2;
  const friction = 0.98;

  const animate = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vx *= friction;
      p.vy *= friction;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.005;

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  };

  requestAnimationFrame(animate);
};
