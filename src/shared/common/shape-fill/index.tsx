export interface ShapeFillProps {
  d: string;
  color: string;
}

export function getShapeFillSvg({ d, color }: ShapeFillProps) {
  const gEl = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const path1El = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  path1El.setAttribute('d', d);
  path1El.setAttribute('fill', color);

  const path2El = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  path2El.setAttribute('d', d);
  path2El.setAttribute('fill', `url(#hash_pattern)`);

  gEl.appendChild(path1El);
  gEl.appendChild(path2El);
  return gEl;
}
