import { Button, Divider, Text } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import shallow from 'zustand/shallow';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import randomWords from 'random-words';
import { showNotification } from '@mantine/notifications';
import { FormProvider, useForm } from 'react-hook-form';
import { useDeleteAccount } from '../../../apis/queries/settings.queries';
import useUserStore from '../../../store/user.store';
import ControlledPasswordInput from '../../shared/FormInputs/Controlled/ControlledPasswordInput';
import ControlledTextInput from '../../shared/FormInputs/Controlled/ControlledTextInput';

const schema = yup.object({
  randomText: yup.string().trim().required('Field is required'),
  password: yup
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters long')
    .max(32, 'Password must be at most 32 characters long')
    .required('Password is required'),
});

const TwoStepDeleteAccountContent = ({ onClickCancel = () => {}, navigate }) => {
  const { setToken, setId, id } = useUserStore(
    state => ({
      setToken: state.setToken,
      setId: state.setId,
      id: state.id,
    }),
    shallow,
  );
  const [currentStep, setCurrentStep] = useState(1);
  const deleteAccount = useDeleteAccount();

  const form = useForm({ resolver: yupResolver(schema) });
  const [typeWord, setTypeWord] = useState('');

  const handleAccountDelete = form.handleSubmit(formData => {
    const data = { ...formData };
    if (data.randomText?.toLowerCase() !== typeWord?.toLowerCase()) {
      showNotification({
        title: 'The entered word does not match the given word',
        color: 'red',
      });

      return;
    }

    delete data.randomText;
    deleteAccount.mutate(
      { userId: id, data },
      {
        onSuccess: () => {
          form.reset();
          setToken(null);
          setId(null);
          onClickCancel();
          navigate('/login');
        },
      },
    );
  });

  useEffect(() => {
    if (currentStep === 2) {
      const word = randomWords();
      setTypeWord(word);
    }
  }, [currentStep]);

  return (
    <div>
      <Divider />
      {currentStep === 1 ? (
        <div className="px-4 py-5">
          <Text size="md" mb={16}>
            Are you sure? Your profile and related information will be deleted from our site.
          </Text>
          <div className="flex gap-2  justify-end">
            <Button onClick={onClickCancel} className="bg-black text-white rounded-md text-sm">
              No, I have changed my mind
            </Button>
            <Button
              className="bg-purple-450 text-white rounded-md text-sm"
              onClick={() => setCurrentStep(2)}
            >
              Yes, contine
            </Button>
          </div>
        </div>
      ) : currentStep === 2 ? (
        <div className="px-4 py-5">
          <FormProvider {...form}>
            <form onSubmit={handleAccountDelete}>
              <Text size="md" mb={16}>
                Please enter <span className="capitalize font-medium">{`"${typeWord}"`}</span> and
                your password to confirm that you wish to close your account.
              </Text>
              <div className="mb-10">
                <ControlledTextInput
                  name="randomText"
                  label="Type the text:"
                  disabled={deleteAccount.isLoading}
                  withAsterisk
                  placeholder="Write..."
                  className="mb-4"
                  autoComplete="off"
                />
                <ControlledPasswordInput
                  name="password"
                  label="Enter your password:"
                  disabled={deleteAccount.isLoading}
                  withAsterisk
                  placeholder="Your Password"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-2  justify-end">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="bg-black text-white rounded-md text-sm"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={deleteAccount.isLoading}
                  loading={deleteAccount.isLoading}
                  className="bg-red-450 text-white rounded-md text-sm"
                >
                  Delete Account
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      ) : null}
    </div>
  );
};

export default TwoStepDeleteAccountContent;
