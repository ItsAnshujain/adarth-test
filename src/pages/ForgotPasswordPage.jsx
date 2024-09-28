import React from 'react';
import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useForgotPassword } from '../apis/queries/auth.queries';
import banner from '../assets/login.svg';
import ControlledTextInput from '../components/shared/FormInputs/Controlled/ControlledTextInput';

const schema = yup.object({
  email: yup.string().trim().required('Email is required').email('Invalid Email'),
});

const ForgotPasswordPage = () => {
  const form = useForm({ resolver: yupResolver(schema) });
  const forgotPassword = useForgotPassword();

  const onSubmit = form.handleSubmit(async formData =>
    forgotPassword.mutate(formData, {
      onSuccess: () => {
        form.reset();
      },
    }),
  );

  return (
    <div className="flex">
      <div className="hidden md:mr-16 md:block">
        <img src={banner} alt="login" className="h-screen" />
      </div>
      <div className="flex h-screen w-full flex-col justify-center px-5 md:w-[31%] md:px-0">
        <p className="mb-1 text-2xl font-bold">Forgot Password</p>
        <p className="mb-5">Please use registered email id</p>
        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <ControlledTextInput
              name="email"
              label="Email"
              placeholder="Your Email"
              className="mb-4"
            />
            <Button
              type="submit"
              className="primary-button w-full text-base"
              loading={forgotPassword.isLoading}
            >
              Send Link
            </Button>
          </form>
        </FormProvider>
        <p className="mt-4">
          <Link to="/login">
            <span className="text-purple-450 ml-1 cursor-pointer">Back to Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
