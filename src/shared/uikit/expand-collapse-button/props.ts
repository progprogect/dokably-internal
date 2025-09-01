import { ComponentPropsWithRef } from "react";

export type CollapseButtonProps = Omit<ComponentPropsWithRef<"button">, 'children'> & {
  isExpanded?: boolean
}