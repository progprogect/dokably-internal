import { useState } from 'react';

const useEmbedded = () => {
  const [isEmbedded] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('embedded') === 'true';
  });

  return isEmbedded;
};

export default useEmbedded;