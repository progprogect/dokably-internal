import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import InputBase from './InputBase';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  defaultValue?: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
  errorClassName?: string;
}

const Input: React.FC<InputProps> = ({
  defaultValue = '',
  onChange,
  name,
  ...rest
}) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={name}
        render={({ field }) => (
          <InputBase
            {...field}
            {...rest}
            errors={errors}
            name={name}
            onChange={(event) => {
              onChange?.(event);
              field.onChange(event);
            }}
          />
        )}
      />
    </>
  );
};

export default Input;
