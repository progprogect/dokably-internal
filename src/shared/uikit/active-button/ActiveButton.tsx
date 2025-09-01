import { forwardRef } from "react";
import ActiveElement from "@shared/uikit/active-element";
import { cn } from "@app/utils/cn";
import { ActiveButtonProps } from "./types";

const ActiveButton = forwardRef<HTMLButtonElement, ActiveButtonProps>(function ActiveButton({
  children,
  className,
  leftSection,
  ...props
}, ref) {
  return (
    <ActiveElement size='l' variant='transparent'>
      {({ className: activeElementClassName }) => (
        <button ref={ref} className={cn('flex items-center w-full p-2', activeElementClassName, className)} {...props}>
          {leftSection && <span className="mr-2">{leftSection}</span>}
          {children}
        </button>
      )}
    </ActiveElement>
  )
})

export default ActiveButton