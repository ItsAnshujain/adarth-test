import { useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import Credentials from '../../components/modules/users/Create/Credentials';
import SuccessModal from '../../components/shared/Modal';
import Header from '../../components/modules/users/Create/Header';
import { FormProvider, useForm } from '../../context/formContext';
import { useCreateUsers, useInvitePeers } from '../../apis/queries/users.queries';
import { serialize } from '../../utils';
import useTokenIdStore from '../../store/user.store';

const schema = yup.object({
  email: yup.string().trim().required('Email is required').email('Invalid Email'),
  role: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('role', 'Role is required', obj => obj.value !== ''),
  name: yup.string().trim().required('Name is required'),
});

const adminSchema = yup.object({
  email: yup.string().trim().required('Email is required').email('Invalid Email'),
  role: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('role', 'Role is required', obj => obj.value !== ''),
  name: yup.string().trim().required('Name is required'),
  companyName: yup
    .object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    })
    .test('organization', 'Organization is required', obj => obj.value !== ''),
});

const initialValues = {
  name: '',
  email: '',
  role: { label: '', value: '' },
};

const initialAdminValues = {
  name: '',
  email: '',
  role: { label: '', value: '' },
  companyName: { label: '', value: '' },
  companyId: '',
};

const CreateUsersPage = () => {
  const queryClient = useQueryClient();
  const userId = useTokenIdStore(state => state.id);
  const userCachedData = queryClient.getQueryData(['users-by-id', userId]);

  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [type, setType] = useState('Team');
  const form = useForm(
    type === 'Team'
      ? {
          validate: yupResolver(userCachedData?.role === 'admin' ? adminSchema : schema),
          initialValues: userCachedData?.role === 'admin' ? initialAdminValues : initialValues,
        }
      : {},
  );
  const { mutate: create, isLoading } = useCreateUsers();
  const { mutate: invite, isLoading: isPeersLoading } = useInvitePeers();
  const [peerId, setPeerId] = useState('');

  const onSubmitUserForm = formData => {
    if (type === 'Team') {
      const data = { ...formData, role: formData.role.value };
      if (userCachedData?.role === 'admin') {
        data.companyName = formData.companyName?.label;
        data.companyId = formData.companyName?.value;
      } else {
        data.companyName = userCachedData?.company;
        data.companyId = userCachedData?.companyId;
      }

      Object.keys(data).forEach(key => {
        if (data[key] === '') {
          delete data[key];
        }
      });

      create(data, {
        onSuccess: () => {
          form.reset();
          setTimeout(() => setOpenSuccessModal(true), 1000);
        },
      });
    } else if (type === 'Peer') {
      if (peerId === '') {
        showNotification({
          title: 'Please select a peer to continue',
          color: 'blue',
        });
        return;
      }

      invite(
        serialize({
          id: peerId || '',
          type: 'add',
        }),
        {
          onSuccess: () => {
            form.reset();
            setTimeout(() => setOpenSuccessModal(true), 1000);
          },
        },
      );
    }
  };

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <FormProvider form={form}>
        <form onSubmit={form.onSubmit(onSubmitUserForm)}>
          <Header
            isLoading={isLoading || isPeersLoading}
            disabled={isLoading || isPeersLoading}
            type={type}
          />
          <Credentials setType={setType} setPeerId={setPeerId} />
        </form>
      </FormProvider>
      <SuccessModal
        title={type === 'Team' ? 'Profile Created Successfully' : 'Peer Added Successfully'}
        prompt="Visit User List"
        open={openSuccessModal}
        setOpenSuccessModal={setOpenSuccessModal}
        path="users"
      />
    </div>
  );
};

export default CreateUsersPage;
