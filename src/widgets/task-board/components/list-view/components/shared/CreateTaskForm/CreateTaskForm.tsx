import { FormEvent, useCallback, useEffect, useState } from 'react';
import * as z from 'zod';
import toast from 'react-hot-toast';

import { ReactComponent as EnterIcon } from '@icons/enter.svg';
import { Button } from '@shared/uikit/button/button';
// import { ReactComponent as TrashIcon } from '@shared/images/icons/trash.svg';
// import IconButton from '@shared/uikit/icon-button';
// import Tooltip from '@shared/uikit/tooltip';
import { ReactComponent as SubTaskIcon } from '@icons/subtasks.svg';

import InputText from '../InputText';
import { cn } from '@app/utils/cn';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { isNull } from 'lodash';

type CreateTaskProps = {
  variant: 'task' | 'sub-task';
  className?: string;
  onCreate: (data: { name: string }) => void;
  onCancel: () => void;
  isKanban?: boolean;
};

const validationSchema = z.object({
  name: z
    .string()
    .min(1, 'This value is too short. It should have 1 characters or more.'),
});

function CreateTaskForm({
  onCancel,
  onCreate,
  variant,
  className,
  isKanban,
}: CreateTaskProps) {
	const { ref, isVisible, setIsVisible } = useClickOutside(
    false,
    () => {},
    'mouseup',
  );
  const [value, setValue] = useState<string>('');

  const handleTaskCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { target } = event;
    if (!(target instanceof HTMLFormElement)) return;

    const formData = new FormData(target);
    const result = validationSchema.safeParse({ name: formData.get('name') });

    if (!result.success) {
      result.error.issues.forEach((issue) => toast.error(issue.message));
      return;
    }

    onCreate(result.data);
    setIsVisible(false);
  };

  const callbackRef = useCallback((inputElement: HTMLInputElement | null) => {
    if (inputElement) setTimeout(() => inputElement.focus());
  }, []);

	useEffect(() => {
		if (isNull(isVisible)) onCancel();
	}, [isVisible])

  return (
    <form
      ref={ref}
      className={cn('flex gap-2 items-center w-full', className)}
      onSubmit={handleTaskCreate}
    >
      {variant === 'sub-task' && !isKanban && (
        <SubTaskIcon className='shrink-0 text-text60' />
      )}
      <InputText
        ref={callbackRef}
        value={value}
        placeholder={variant === 'task' ? 'Task name' : 'Sub-task name'}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onFocus={(e) => {
          e.preventDefault();
          setIsVisible(true);
        }}
        style={{ color: "#29282C" }}
        active
        name='name'
      />
      <Button
        className='py-1 px-2 h-6'
        size='sm'
        icon={<EnterIcon className='mr-1' />}
        type='submit'
        disabled={!value.length}
      >
        {isKanban ? "" : "Create"}
      </Button>
      {/* {!isKanban && (
        <Tooltip content='Cancel'>
          <IconButton
            onClick={onCancel}
            aria-label='Cancel creation'
            size='s'
            variant='error'
          >
            <TrashIcon />
          </IconButton>
        </Tooltip>
      )} */}
    </form>
  );
}

export default CreateTaskForm;
