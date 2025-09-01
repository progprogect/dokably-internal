import * as PopperJS from '@popperjs/core';

export interface PopperHookResults {
    styles: { [key: string]: React.CSSProperties };
    attributes: { [key: string]: { [key: string]: string } | undefined };
    state: PopperJS.State | null;
    update: PopperJS.Instance['update'] | null;
    forceUpdate: PopperJS.Instance['forceUpdate'] | null;
  }