import React from 'react';
import { v4 as uuid4 } from 'uuid';

const useForceUpdate = (): [string, () => void] => {
  const [state, updateState] = React.useState<string>('');
  const forceUpdate = React.useCallback(() => updateState(uuid4()), []);
  return [state, forceUpdate];
};

export default useForceUpdate;
