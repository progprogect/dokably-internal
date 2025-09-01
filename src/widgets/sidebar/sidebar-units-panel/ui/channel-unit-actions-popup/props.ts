import { ReactElement } from "react"

export type ChannelUnitType = 'document' | 'whiteboard'

export type ChannelUnitActionsPopupProps = {
  trigger: ReactElement
  open: boolean
  onCreateUnit: (unitType: ChannelUnitType) => void
  onOpenChange: (open: boolean) => void
  wrapTriggerWith?: (trigger: ReactElement) => ReactElement
}