import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement>;
}

export const ViewportPortal: React.FC<PortalProps> = ({ children, containerRef }) => {
  const portalRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  const animate = () => {
    if (containerRef.current && portalRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      portalRef.current.style.width = `${rect.width}px`;
      portalRef.current.style.top = `${rect.top}px`;
      portalRef.current.style.left = `${rect.left + 12}px`;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      const homeLayout = document.getElementById('home-layout');
      if (homeLayout && event.deltaY !== 0) {
        homeLayout.scrollBy({
          top: event.deltaY,
        });
      }
    };

    const element = portalRef.current;
    if (element) {
      element.addEventListener('wheel', handleScroll, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <div
        style={{
          visibility: 'hidden',
          pointerEvents: 'none',
          height: portalRef.current?.offsetHeight,
        }}
      />
      {ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            zIndex: 0,
            pointerEvents: 'auto',
            touchAction: 'pan-y',
            willChange: 'top, left',
          }}
          ref={portalRef}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
};
