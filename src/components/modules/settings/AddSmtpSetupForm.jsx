import React, { useEffect } from 'react';
import { Button } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { showNotification } from '@mantine/notifications';
import { SMTP_SERVICES } from '../../../utils/constants';
import { useFetchUsersById, useUpdateUsers } from '../../../apis/queries/users.queries';
import useUserStore from '../../../store/user.store';
import ControlledNumberInput from '../../shared/FormInputs/Controlled/ControlledNumberInput';
import ControlledTextInput from '../../shared/FormInputs/Controlled/ControlledTextInput';
import ControlledPasswordInput from '../../shared/FormInputs/Controlled/ControlledPasswordInput';
import ControlledSelect from '../../shared/FormInputs/Controlled/ControlledSelect';

const schema = yup.object({
  service: yup.string().trim().required('Service is required'),
  username: yup.string().trim().required('Username is required'),
  password: yup.string().trim().required('Password is required'),
  host: yup
    .string()
    .trim()
    .when('service', {
      is: 'others',
      then: yup.string().trim().required('SMTP host is required'),
    }),
  port: yup
    .number()
    .positive('Must be a positive number')
    .typeError('Must be a number')
    .nullable()
    .when('service', {
      is: 'others',
      then: yup
        .number()
        .positive('Must be a positive number')
        .typeError('Must be a number')
        .nullable()
        .required('SMTP port is required'),
    }),
});

const AddSmtpSetupForm = () => {
  const form = useForm({ resolver: yupResolver(schema) });
  const userId = useUserStore(state => state.id);
  const updateUser = useUpdateUsers();
  const { data: userData } = useFetchUsersById(userId);
  const watchService = form.watch('service');

  const onSubmit = form.handleSubmit(async formData => {
    const data = { ...formData };

    if (data.service !== 'others') {
      delete data.host;
      delete data.port;
    }

    updateUser.mutate(
      { userId, data: { smtp: data } },
      {
        onSuccess: () => {
          showNotification({
            title: 'User updated successfully',
            color: 'green',
          });
          form.reset();
        },
      },
    );
  });

  useEffect(() => {
    if (userData?.smtp) {
      form.reset({
        service: userData?.smtp?.service,
        username: userData?.smtp?.username,
        host: userData?.smtp?.host || '',
        port: userData?.smtp?.port || null,
      });
    }
  }, [userData?.smtp]);

  return (
    <article className="px-5 mt-4">
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <div className="grid gap-3 grid-cols-3 mb-4">
            <ControlledSelect
              label="Services"
              name="service"
              withAsterisk
              placeholder="Select a service"
              data={SMTP_SERVICES}
              rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
              rightSectionWidth={40}
              className="col-start-1 col-span-1"
            />
            <ControlledTextInput
              label="Username"
              name="username"
              withAsterisk
              placeholder="Enter username"
              className="col-start-1 col-span-1"
            />
            <ControlledPasswordInput
              label="Password"
              name="password"
              withAsterisk
              placeholder="Enter password"
              className="col-start-2 col-span-1"
            />
            {watchService === 'others' ? (
              <>
                <ControlledTextInput
                  label="SMTP host"
                  name="host"
                  withAsterisk
                  placeholder="Enter host"
                  className="col-start-1 col-span-1"
                />
                <ControlledNumberInput
                  label="SMTP port"
                  name="port"
                  withAsterisk
                  placeholder="Enter port"
                  className="col-start-2 col-span-1"
                />
              </>
            ) : null}
          </div>

          <Button className="primary-button" type="submit" loading={updateUser.isLoading}>
            Submit
          </Button>
        </form>
      </FormProvider>
    </article>
  );
};

export default AddSmtpSetupForm;
