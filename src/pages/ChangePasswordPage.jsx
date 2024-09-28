import * as yup from 'yup';
import { useState } from 'react';
import { Text, Button } from '@mantine/core';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import SuccessModal from '../components/shared/Modal';
import { useResetPassword } from '../apis/queries/auth.queries';
import banner from '../assets/login.svg';
import ControlledPasswordInput from '../components/shared/FormInputs/Controlled/ControlledPasswordInput';

const schema = yup.object({
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

const ChangePasswordPage = () => {
  const [open, setOpenSuccessModal] = useState(false);
  const changePassword = useResetPassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const form = useForm({ resolver: yupResolver(schema) });

  const onSubmit = form.handleSubmit(async formData => {
    changePassword.mutate(
      {
        password: formData.confirmPassword,
        token,
      },
      {
        onSuccess: () => {
          form.reset();
          navigate('/login');
        },
      },
    );
  });

  return (
    <div className="flex">
      <div className="hidden md:mr-16 md:block">
        <img src={banner} alt="login" className="h-screen" />
      </div>
      <div className="flex h-screen w-full flex-col justify-center px-5 md:w-[31%] md:px-0">
        <p className="mb-5 text-2xl font-bold">Change Password</p>
        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <ControlledPasswordInput
              label="New Password"
              name="password"
              placeholder="Your New Password"
              className="mb-4"
            />
            <ControlledPasswordInput
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              className="mb-4"
            />
            <Button
              type="submit"
              className="primary-button w-full text-base"
              loading={changePassword.isLoading}
            >
              Save
            </Button>
          </form>
        </FormProvider>
        <Text className="mt-4">
          <Link to="/login">
            <span className="text-purple-450 ml-1 cursor-pointer">Back to Login</span>
          </Link>
        </Text>
      </div>
      <SuccessModal
        open={open}
        setOpenSuccessModal={setOpenSuccessModal}
        title="Password Successfully Changed"
        text="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        prompt="Login"
        path="login"
      />
    </div>
  );
};

export default ChangePasswordPage;
