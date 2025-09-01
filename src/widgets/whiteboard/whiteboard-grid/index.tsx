import { GRID_STEPS } from '@tldraw/editor';
import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type TLGridComponent = (props: {
  x: number;
  y: number;
  z: number;
  size: number;
}) => JSX.Element | null;

export const DefaultGrid: TLGridComponent = ({ x, y, z, size }) => {
  const gridStep = useMemo(() => {
    const step = GRID_STEPS.filter(({ mid }) => z <= mid)[0];
    return step ? step.step : 1;
  }, [z]);

  return (
    <svg className='tl-grid' version='1.1' xmlns='http://www.w3.org/2000/svg'>
      <defs>
        {GRID_STEPS.map(({ step }, i) => {
          const s = step * size * 2 * z;
          const xo = 0.5 + x * z;
          const yo = 0.5 + y * z;
          const gxo = xo > 0 ? xo % s : s + (xo % s);
          const gyo = yo > 0 ? yo % s : s + (yo % s);
          const opacity = 1;

          return (
            <pattern
              key={`grid-pattern-${i}`}
              id={`grid-${step}`}
              width={s}
              height={s}
              patternUnits='userSpaceOnUse'
            >
              <line
                className='dokably-grid-line'
                x1={gxo - s}
                y1={gyo}
                x2={gxo + s}
                y2={gyo}
                opacity={opacity}
              />
              <line
                className='dokably-grid-line'
                x1={gxo}
                y1={gyo - s}
                x2={gxo}
                y2={gyo + s}
                opacity={opacity}
              />
            </pattern>
          );
        })}
      </defs>
      <rect
        key={`grid-rect-${uuidv4()}`}
        width='100%'
        height='100%'
        fill={`url(#grid-${gridStep})`}
      />
    </svg>
  );
};
