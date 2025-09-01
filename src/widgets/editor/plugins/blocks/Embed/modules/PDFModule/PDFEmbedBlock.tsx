import { useEffect } from 'react';

interface IPDFEmbedBlock {
  url: string;
  setIsLoaded(state: boolean): void;
}

const PDFEmbedBlock: React.FC<IPDFEmbedBlock> = ({ url, setIsLoaded }) => {
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <object data={url} type='application/pdf' height='454px' width='100%'>
      <iframe
        src={`https://docs.google.com/viewer?url=${url}&embedded=true`}
      ></iframe>
    </object>
  );
};

export default PDFEmbedBlock;
