import React, { useEffect } from 'react';
import { ActionIcon, Button, Image, Skeleton } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { showNotification } from '@mantine/notifications';
import { XCircle } from 'react-feather';
import { useQueryClient } from '@tanstack/react-query';
import PreviewCard from '../Create/PreviewCard';
import UserImage from '../../../../assets/placeholders/user.png';
import ControlledNumberInput from '../../../shared/FormInputs/Controlled/ControlledNumberInput';
import { useUpdateUsers } from '../../../../apis/queries/users.queries';
import useUserStore from '../../../../store/user.store';

const schema = yup.object({
  salesTarget: yup
    .number()
    .typeError('Must be a number')
    .nullable()
    .required('Amount is required')
    .min(0, 'Value must be greater than or equal to zero')
    .integer('Value must be an integer'),
});

const OverviewUserDetails = ({ userDetails, isUserDetailsLoading = false, userId }) => {
  const queryClient = useQueryClient();
  const form = useForm({ resolver: yupResolver(schema) });
  const updateUser = useUpdateUsers();
  const meId = useUserStore(state => state.id);

  const myDetails = queryClient.getQueryData(['users-by-id', meId]);
  const isPeer = myDetails?.peer?.includes(userId);

  const onSubmit = form.handleSubmit(async formData => {
    updateUser.mutate(
      { userId, data: { ...formData } },
      {
        onSuccess: () => {
          showNotification({
            title: `Sales Target ${userDetails?.salesTarget ? 'updated' : 'added'} successfully`,
            color: 'green',
          });
          showNotification({
            title: 'User updated successfully',
            color: 'green',
          });
          form.reset();
        },
      },
    );
  });

  const handleResetTarget = () => form.setValue('salesTarget', undefined);

  useEffect(() => {
    if (userDetails?.salesTarget) {
      form.setValue('salesTarget', userDetails?.salesTarget);
    }
  }, [userDetails?.salesTarget]);

  return (
    <div className="pl-5 flex justify-between mt-8 mb-8">
      <div className="grid grid-cols-4 gap-8">
        <div className="flex flex-col col-span-1 gap-8">
          {!isUserDetailsLoading ? (
            <div className="flex gap-4">
              <div>
                <Image
                  src={userDetails?.image || UserImage}
                  alt="profile pic"
                  height={120}
                  width={120}
                  className="bg-gray-450 rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-bold">{userDetails?.name || 'NA'}</p>
                <p className="text-[#914EFB] capitalize">{userDetails?.role || 'NA'}</p>
                <p>{userDetails?.company || 'NA'}</p>
              </div>
            </div>
          ) : (
            <Skeleton height={180} width={270} radius="sm" />
          )}
          {!isUserDetailsLoading ? (
            <>
              <div>
                <p>{userDetails?.about || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">Email</p>
                <p className="font-semibold">{userDetails?.email || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="font-semibold">+91 {userDetails?.number || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">Address</p>
                <p className="font-semibold">{userDetails?.address || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">City</p>
                <p className="font-semibold">{userDetails?.city || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">Pincode</p>
                <p className="font-semibold">{userDetails?.pincode || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">Pan</p>
                <p className="font-semibold">{userDetails?.pan || 'NA'}</p>
              </div>
              <div>
                <p className="text-slate-400">Aadhar</p>
                <p className="font-semibold">{userDetails?.aadhaar || 'NA'}</p>
              </div>
            </>
          ) : (
            <Skeleton height={500} width={270} radius="sm" />
          )}
        </div>
        {!userDetails ? (
          <>
            <Skeleton height={180} width={290} radius="sm" />
            <Skeleton height={180} width={290} radius="sm" />
            <Skeleton height={180} width={290} radius="sm" />
          </>
        ) : null}
        <div className="col-span-3 flex flex-col px-5">
          <FormProvider {...form}>
            <form className="mb-8 relative" onSubmit={onSubmit}>
              {((myDetails?.role === 'supervisor' && userId === meId) ||
                myDetails?.role === 'admin' ||
                myDetails?.role === 'management') &&
              !isPeer ? (
                <ControlledNumberInput
                  label={
                    <div className="flex flex-row items-start">
                      <p>Sales Target ₹ </p>
                      {myDetails?.role !== 'supervisor' ? (
                        <p className="ml-1 text-red-450">*</p>
                      ) : null}
                      <p className="self-end text-sm italic ml-2">**Current Financial Year</p>
                    </div>
                  }
                  name="salesTarget"
                  placeholder={myDetails?.role !== 'supervisor' ? 'Write...' : ''}
                  className="w-[300px] mr-3"
                  rightSection={
                    myDetails?.role !== 'supervisor' ? (
                      <ActionIcon onClick={handleResetTarget} className="mr-3">
                        <XCircle className="h-4" />
                      </ActionIcon>
                    ) : null
                  }
                  readOnly={myDetails?.role === 'supervisor'}
                  disabled={myDetails?.role === 'supervisor'}
                />
              ) : null}
              {myDetails?.role !== 'supervisor' && !isPeer ? (
                <Button
                  type="submit"
                  className="primary-button self-end static md:absolute top-8 left-96"
                  loading={updateUser.isLoading}
                >
                  {userDetails?.salesTarget ? 'Edit' : 'Save'}
                </Button>
              ) : null}
            </form>
          </FormProvider>

          <div className="col-span-2 grid grid-cols-2 gap-8">
            {userDetails?.docs?.map(doc => (
              <div className="col-span-1" key={uuidv4()}>
                <PreviewCard
                  filename={doc}
                  cardText={doc}
                  cardSubtext={doc}
                  showTrashBtn={false}
                  preview
                  fileExtensionType={doc?.aadhaar || doc?.pan}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewUserDetails;
