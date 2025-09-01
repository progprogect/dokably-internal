import { ContentBlock, ContentState } from "draft-js";
import { ComponentType } from "react";

export type WrappedComponentType<Type> = ComponentType<Type> & {
  WrappedComponent?: ComponentType<Type>;
};

export interface DecoratorParams extends React.HTMLAttributes<HTMLElement> {
  block: ContentBlock;
  contentState: ContentState;
  ref: React.ForwardedRef<unknown>;
}