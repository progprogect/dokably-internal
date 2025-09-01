import { ReactComponent as Loader } from '../images/loader.svg';

type LoadingProps = {
  customClass?: string;
  label?: string;
};

const Loading = ({ customClass = '', label }: LoadingProps) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center ${customClass}`}
    >
      <Loader className='inline w-12 h-12 text-primary animate-spin' />
      <h2 className='loading'>{label ? label : 'Loading, please wait a bit'}</h2>
    </div>
  );
};

export default Loading;
