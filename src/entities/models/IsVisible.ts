export default interface IsVisible {
  rect?: Rect;
  activeClassName: string; //TODO: deprecated
}

export type Rect = DOMRect;
