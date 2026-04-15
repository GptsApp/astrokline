import { useEffect, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import {
  CONFIGURED_SECRET_MASK,
  isConfiguredSecretMask,
} from '@/shared/lib/admin-console';
import { Input as InputComponent } from '@/shared/components/ui/input';
import { FormField } from '@/shared/types/blocks/form';

export function Input({
  field,
  formField,
  data,
}: {
  field: FormField;
  formField: ControllerRenderProps<Record<string, unknown>, string>;
  data?: any;
}) {
  const isMaskedSecret =
    field.type === 'password' && isConfiguredSecretMask(formField.value);
  const [restoreMaskedSecret, setRestoreMaskedSecret] = useState(false);
  const [inputType, setInputType] = useState(
    isMaskedSecret ? 'text' : field.type || 'text'
  );

  useEffect(() => {
    setInputType(isMaskedSecret ? 'text' : field.type || 'text');
  }, [field.type, isMaskedSecret]);

  return (
    <InputComponent
      value={formField.value as string}
      onChange={formField.onChange}
      onFocus={() => {
        if (isMaskedSecret) {
          setRestoreMaskedSecret(true);
          setInputType('password');
          formField.onChange('');
        }
      }}
      onBlur={() => {
        if (
          field.type === 'password' &&
          restoreMaskedSecret &&
          formField.value === ''
        ) {
          formField.onChange(CONFIGURED_SECRET_MASK);
          setInputType('text');
        }

        setRestoreMaskedSecret(false);

        formField.onBlur();
      }}
      type={inputType}
      placeholder={field.placeholder}
      className="bg-background placeholder:text-base-content/50 "
      {...field.attributes}
    />
  );
}
