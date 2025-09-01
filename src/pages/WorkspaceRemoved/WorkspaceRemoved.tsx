type WorkspaceRemovedProps = {
  customClass?: string;
  label?: string;
};

const WorkspaceRemoved = ({ customClass = '', label }: WorkspaceRemovedProps) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center ${customClass}`}
    >
      <h2 className='loading'>{label || 'Loading, please wait a bit'}</h2>
    </div>
  );
};

export default WorkspaceRemoved;
