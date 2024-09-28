import { Button } from '@mantine/core';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useChangePassword } from '../../../apis/queries/settings.queries';
import ControlledPasswordInput from '../../shared/FormInputs/Controlled/ControlledPasswordInput';

const schema = yup.object({
  oldPassword: yup.string().trim().required('Current Password is required'),
  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long')
    .max(32, 'Password must be at most 32 characters long')
    .required('New Password is required'),
  confirmPassword: yup
    .string()
    .trim()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'New password and Confirm password must match'),
});

const ChangePassword = () => {
  const form = useForm({ resolver: yupResolver(schema) });

  const changePassword = useChangePassword();

  const onSubmit = form.handleSubmit(formData => {
    changePassword.mutate({ ...formData }, { onSuccess: () => form.reset() });
  });

  return (
    <div className="pl-5 pr-7 mt-4">
      <p className="font-bold text-xl mb-3">Change Password</p>
      <p className="font-medium text-slate-400 text-sm mt-1 mb-3">
        Please fill the below details to change your password
      </p>
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <div className="flex gap-4 flex-col">
            <ControlledPasswordInput
              label="Current Password"
              name="oldPassword"
              withAsterisk
              placeholder="Your Current Password"
              className="md:w-4/12"
            />
            <ControlledPasswordInput
              label="New Password"
              name="password"
              withAsterisk
              placeholder="Your New Password"
              className="md:w-4/12"
            />
            <ControlledPasswordInput
              label="Confirm Password"
              name="confirmPassword"
              withAsterisk
              placeholder="Confirm New Password"
              className="md:w-4/12"
            />
          </div>
          <Button
            disabled={changePassword.isLoading}
            loading={changePassword.isLoading}
            type="submit"
            className="py-2 px-8 rounded bg-purple-450 text-white mt-4 "
          >
            Save
          </Button>
        </form>
      </FormProvider>
    </div>
  );
};

export default ChangePassword;
