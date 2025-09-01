import { useState } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';

import { selectCurrentUser } from '@app/redux/features/userSlice';
import Button from '@shared/common/Button';
import Input from '@shared/common/input';

const WorkspaceDetails = ({ methods }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const user = useSelector(selectCurrentUser);

  return (
    <div className='animate__animated animate__fadeIn'>
      <div className='flex justify-between'>
        <div className='h-0.75 w-full'></div>
      </div>
      <div className='font-medium text-2xl2 mt-10'>What is the name of your company or team?</div>
      <div className='mt-4 mb-10 text-text60 text-sml'>This will be the name of your Dokably workspace.</div>
      <Input
        id='companyName'
        key='companyName'
        name='companyName'
        type='text'
        placeholder='Set a name for your workspace'
      />
      <div
        className={cn('w-full flex mt-15 items-center', {
          'justify-between': !user.isLoggedIn,
          'justify-end': user.isLoggedIn,
        })}
      >
        <Button
          styleType='small-black'
          label='Next'
          type='submit'
          isLoading={isLoading}
          onClick={async () => {
            const valid = await methods.trigger('companyName');

            if (valid) {
              setIsLoading(true);
            }
          }}
        />
      </div>
    </div>
  );
};

export default WorkspaceDetails;
