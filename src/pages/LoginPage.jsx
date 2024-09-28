import React from 'react';
import * as yup from 'yup';
import shallow from 'zustand/shallow';
import { Title, Text, Button } from '@mantine/core';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import banner from '../assets/login.svg';
import { useLogin } from '../apis/queries/auth.queries';
import useUserStore from '../store/user.store';
import ControlledPasswordInput from '../components/shared/FormInputs/Controlled/ControlledPasswordInput';
import ControlledTextInput from '../components/shared/FormInputs/Controlled/ControlledTextInput';
const API_URL = import.meta.env.VITE_API_BASE_URL;

const schema = yup.object({
  email: yup.string().trim().required('Email is required').email('Invalid Email'),
  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long')
    .max(32, 'Password must be at most 32 characters long')
    .required('Password is required'),
});
console.log('Environment Variables:', import.meta.env);

console.log("API URL: ", API_URL);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setToken, setId, setHasAcceptedTerms } = useUserStore(
    state => ({
      setToken: state.setToken,
      setId: state.setId,
      id: state.id,
      setHasAcceptedTerms: state.setHasAcceptedTerms,
    }),
    shallow,
  );

  const redirectTo = searchParams.get('redirect_to');
  const login = useLogin();

  const form = useForm({ resolver: yupResolver(schema) });

  const onSubmit = form.handleSubmit(async formData => {
    const response = await login.mutateAsync(formData);
    setToken(response.token);
    setId(response.id);
    setHasAcceptedTerms(response.hasAcceptedTerms);
    if (!response.hasAcceptedTerms) {
      if (location.search.includes('setting')) {
        navigate('/terms-conditions?redirect_to=setting&type=change_password');
      } else {
        navigate('/terms-conditions');
      }
      return;
    }

    if (redirectTo) {
      navigate(`/${redirectTo}`);
    } else {
      navigate('/home');
    }
  });

  return (
    <div className="flex">
      <div className="hidden md:mr-16 md:block">
        <img src={banner} alt="login" className="h-screen" />
      </div>
      <div className="flex h-screen w-full flex-col justify-center px-5 md:w-[31%] md:px-0">
        <Title className="mb-1">Login to Adarth</Title>
        <Text className="mb-5">Please use registered email for login</Text>
        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <ControlledTextInput
              name="email"
              label="Email"
              placeholder="Your Email"
              className="mb-4"
            />
            <ControlledPasswordInput
              name="password"
              label="Password"
              placeholder="Your Password"
              className="mb-4"
            />
            <Button
              type="submit"
              className="primary-button w-full text-base"
              loading={login.isLoading}
            >
              Login
            </Button>
          </form>
        </FormProvider>
        <Text className="mt-4">
          <Link to="/forgot-password">
            <span className="text-purple-450 ml-1 cursor-pointer">Forgot Password</span>
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
