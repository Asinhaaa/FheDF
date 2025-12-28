import { useEffect, useRef, useState } from 'react';

export function useCustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);
  const [isActive, setIsActive] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    // Create cursor element
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    cursorRef.current = cursor;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Create trail effect
      if (Math.random() > 0.7) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = `${e.clientX - 5}px`;
        trail.style.top = `${e.clientY - 5}px`;
        document.body.appendChild(trail);
        trailRef.current.push(trail);

        // Remove trail after animation
        setTimeout(() => {
          trail.remove();
          trailRef.current = trailRef.current.filter(t => t !== trail);
        }, 600);
      }
    };

    // Mouse down handler
    const handleMouseDown = () => {
      setIsActive(true);
      if (cursorRef.current) {
        cursorRef.current.classList.add('active');
      }
    };

    // Mouse up handler
    const handleMouseUp = () => {
      setIsActive(false);
      if (cursorRef.current) {
        cursorRef.current.classList.remove('active');
      }
    };

    // Animation loop for smooth cursor movement
    const animate = () => {
      if (cursorRef.current) {
        // Smooth easing
        cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.2;
        cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.2;

        cursorRef.current.style.left = `${cursorPos.current.x - 10}px`;
        cursorRef.current.style.top = `${cursorPos.current.y - 10}px`;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Start animation
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      if (cursorRef.current && cursorRef.current.parentNode) {
        cursorRef.current.parentNode.removeChild(cursorRef.current);
      }

      // Clean up trails
      trailRef.current.forEach(trail => {
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      });
    };
  }, []);

  return null;
}
