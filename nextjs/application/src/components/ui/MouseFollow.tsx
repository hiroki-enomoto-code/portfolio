import { useState, useEffect, useRef } from 'react';

type Props = {
    spring?: number;
    friction?: number;
    initialPosition?: { x: number; y: number };
    children?: React.ReactNode;
}

const MouseFollow: React.FC<Props> = ({
    initialPosition = { x: 0, y: 0 },
    children,
}) => {

    const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // State for the target (mouse) position
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Ref for animation frame
  const requestRef = useRef(0);
  
  // Physics parameters
  const spring = 0.08; // Spring strength (0-1): higher = faster response
  const friction = 0.8; // Friction (0-1): higher = less damping
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Animation loop using requestAnimationFrame
  useEffect(() => {
    let velocity = { x: 0, y: 0 };
    
    const animateCircle = () => {
      // Calculate distance between current position and target (mouse)
      const dx = mousePosition.x - position.x;
      const dy = mousePosition.y - position.y;
      
      // Apply spring force
      velocity.x += dx * spring;
      velocity.y += dy * spring;
      
      // Apply friction
      velocity.x *= friction;
      velocity.y *= friction;
      
      // Update position
      setPosition(prevPos => ({
        x: prevPos.x + velocity.x,
        y: prevPos.y + velocity.y
      }));
      
      // Continue animation loop
      requestRef.current = requestAnimationFrame(animateCircle);
    };
    
    // Start animation loop
    requestRef.current = requestAnimationFrame(animateCircle);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [position, mousePosition, spring, friction]);

    return (
        <div 
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: 'transform 0.05s linear',
                position: 'fixed',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#6DE7CB',
                pointerEvents: 'none',
                left: 0,
                top: 0,
            }}
        >
            {children}
        </div>
    );
};

export default MouseFollow;