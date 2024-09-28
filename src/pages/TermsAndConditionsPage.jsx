import { Button, Group, Modal } from '@mantine/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { FormProvider, useForm } from '../context/formContext';
import { useUpdateUsers } from '../apis/queries/users.queries';
import useUserStore from '../store/user.store';
import banner from '../assets/login.svg';
import TermsAndConditionsContent from '../components/modules/policies/TermsAndConditionsContent';

const TermsAndConditionsPage = () => {
  const navigate = useNavigate();
  const form = useForm();
  const userId = useUserStore(state => state.id);
  const [opened, { open, close }] = useDisclosure(false);

  const { setHasAcceptedTerms } = useUserStore(
    state => ({
      setHasAcceptedTerms: state.setHasAcceptedTerms,
    }),
    shallow,
  );

  const { mutateAsync: updateUser, isLoading: isUserUpdateLoading } = useUpdateUsers();
  const handleSubmit = async () => {
    const data = { hasAcceptedTerms: true };

    updateUser(
      { userId, data },
      {
        onSuccess: () => {
          showNotification({
            title: 'User updated successfully',
            color: 'green',
          });
          navigate('/home');
          setHasAcceptedTerms(true);
        },
      },
    );
  };

  return (
    <div className="flex">
      <div className="hidden md:mr-16 md:block">
        <img src={banner} alt="login" className="h-screen" />
      </div>
      <div className="flex h-screen w-full flex-col justify-center px-5 md:w-[35%] md:px-0">
        <FormProvider form={form}>
          <form>
            <h3 className="font-bold text-xl underline">Terms and Conditions</h3>
            <p className="text-sm">
              Thank you for visiting our website. Before you proceed to use our services, you will
              need to accept the terms and conditions.
            </p>
            <Button className="text-purple-450 px-0 underline text-sm mb-2" onClick={open}>
              Click here to read more
            </Button>

            {form.errors ? <p className="text-red-450">{form.errors.hasAcceptedTerms}</p> : null}
            <Group mt="xs">
              <Button
                className="primary-button"
                onClick={form.onSubmit(e => handleSubmit(e))}
                disabled={isUserUpdateLoading}
                loading={isUserUpdateLoading}
              >
                Accept
              </Button>
            </Group>
          </form>
        </FormProvider>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        centered
        size="xl"
        overlayBlur={3}
        overlayOpacity={0.55}
        radius={0}
        padding={0}
        classNames={{
          header: 'pt-2',
          body: 'py-4',
          close: 'mr-4',
        }}
      >
        <TermsAndConditionsContent />
      </Modal>
    </div>
  );
};

export default TermsAndConditionsPage;
