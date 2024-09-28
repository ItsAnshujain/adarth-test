import { Button, Image } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ControlledSelect from '../../shared/FormInputs/Controlled/ControlledSelect';
import ControlledTextarea from '../../shared/FormInputs/Controlled/ControlledTextarea';
import { leadCommunicationTypeOptions, leadStageOptions } from '../../../utils/constants';
import useUserStore from '../../../store/user.store';
import { useInfiniteUsers } from '../../../apis/queries/users.queries';
import DropdownWithHandler from '../../shared/SelectDropdown/DropdownWithHandler';
import ControlledDatePickerInput from '../../shared/FormInputs/Controlled/ControlledDatePickerInput';
import CalendarIcon from '../../../assets/calendar.svg';
import useAddFollowUp, { useUpdateFollowUp } from '../../../apis/queries/followup.queries';

const validationSchema = yup.object({
  followUpDate: yup.date().required('FollowUp date is required'),
  nextFollowUpDate: yup
    .date()
    .nullable()
    .when(
      'followUpDate',
      (followUpDate, schema) =>
        followUpDate &&
        schema.min(followUpDate, 'Next Follow Up date must be after Follow Up date'),
    )
    .notRequired(),
});

const AddFollowUpContent = ({ onCancel, leadId, followUpData }) => {
  const addFollowUpHandler = useAddFollowUp();
  const updateFollowUpHandler = useUpdateFollowUp();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: yupResolver(validationSchema),
  });
  const userId = useUserStore(state => state.id);
  const user = queryClient.getQueryData(['users-by-id', userId]);

  const usersQuery = useInfiniteUsers({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filter: 'team',
  });

  const memoizedUsers = useMemo(
    () =>
      usersQuery.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        .map(doc => ({
          ...doc,
          label: doc.name,
          value: doc._id,
        })) || [],
    [usersQuery?.data],
  );

  const usersDropdown = useMemo(
    () =>
      DropdownWithHandler(
        () => usersQuery.fetchNextPage(),
        usersQuery.isFetchingNextPage,
        usersQuery.hasNextPage,
      ),
    [usersQuery?.data],
  );

  const onSubmit = form.handleSubmit(formData => {
    const {
      primaryInCharge,
      secondaryInCharge,
      leadStage,
      communicationType,
      notes,
      followUpDate,
      nextFollowUpDate,
    } = formData;

    if (
      !primaryInCharge &&
      !secondaryInCharge &&
      !leadStage &&
      !communicationType &&
      !notes &&
      !followUpDate &&
      !nextFollowUpDate
    ) {
      showNotification({
        message: 'Please fill the form',
        color: 'red',
      });
      return;
    }

    if (primaryInCharge === secondaryInCharge) {
      showNotification({
        message: 'Primary and Secondary Incharge should not be same.',
        color: 'red',
      });
      return;
    }

    const data = {
      leadStage,
      communicationType,
      followUpDate: followUpDate ? dayjs(followUpDate).toISOString() : undefined,
      notes: notes || undefined,
      nextFollowUpDate: nextFollowUpDate ? dayjs(nextFollowUpDate).toISOString() : null,
      primaryInCharge,
      secondaryInCharge,
      id: followUpData?._id ? followUpData?._id : leadId,
    };

    if (followUpData?._id) {
      updateFollowUpHandler.mutate(data, {
        onSuccess: () => {
          showNotification({
            message: 'Follow Up updated successfully',
          });
          onCancel();
        },
      });
    } else {
      addFollowUpHandler.mutate(data, {
        onSuccess: () => {
          showNotification({
            message: 'Follow Up added successfully',
          });
          onCancel();
        },
      });
    }
  });

  useEffect(() => {
    form.setValue('primaryInCharge', user?._id);
    form.setValue('leadStage', leadStageOptions[0].value);
    form.setValue('communicationType', leadCommunicationTypeOptions[0].value);
    form.setValue('followUpDate', dayjs());
  }, [user]);

  useEffect(() => {
    if (followUpData) {
      form.reset({
        communicationType: followUpData?.communicationType,
        followUpDate: followUpData?.followUpDate ? new Date(followUpData?.followUpDate) : null,
        leadStage: followUpData?.leadStage,
        primaryInCharge: followUpData?.primaryInCharge?._id,
        secondaryInCharge: followUpData?.secondaryInCharge?._id,
        nextFollowUpDate: followUpData?.nextFollowUpDate
          ? new Date(followUpData?.nextFollowUpDate)
          : null,
        notes: followUpData?.notes,
      });
    }
  }, [followUpData]);

  const labelClass = 'font-bold text-base';
  const datePickerClass = { icon: 'flex justify-end w-full pr-2', input: 'pl-2', calendar: 'h-72' };

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <div className="py-4">
          <div className="text-xl font-bold w-full py-4">Basic Information</div>
          <div className="grid grid-cols-2 gap-6">
            <ControlledSelect
              searchable
              placeholder="Select..."
              name="leadStage"
              label="Lead Stage"
              data={leadStageOptions}
              classNames={{ label: labelClass }}
            />
            <ControlledSelect
              searchable
              placeholder="Select..."
              name="communicationType"
              label="Communication Type"
              data={leadCommunicationTypeOptions}
              classNames={{ label: labelClass }}
            />
            <ControlledDatePickerInput
              name="followUpDate"
              label="Follow Up Date"
              classNames={{ label: labelClass, ...datePickerClass }}
              icon={<Image src={CalendarIcon} alt="icon" width={20} />}
            />
            <ControlledDatePickerInput
              name="nextFollowUpDate"
              label="Next Follow Up Date"
              classNames={{ label: labelClass, ...datePickerClass }}
              icon={<Image src={CalendarIcon} alt="icon" width={20} />}
            />
            <ControlledSelect
              searchable
              placeholder="Select..."
              name="primaryInCharge"
              label="Primary Incharge"
              data={
                followUpData?.primaryInCharge?._id &&
                memoizedUsers?.filter(item => item.value === followUpData?.primaryInCharge?._id)
                  .length <= 0
                  ? [
                      ...memoizedUsers,
                      {
                        value: followUpData?.primaryInCharge?._id,
                        label: followUpData?.primaryInCharge?.name,
                      },
                    ] || []
                  : memoizedUsers || []
              }
              dropdownComponent={usersDropdown}
              classNames={{ label: labelClass }}
            />
            <ControlledSelect
              clearable
              searchable
              placeholder="Select..."
              name="secondaryInCharge"
              label="Secondary Incharge"
              data={
                followUpData?.secondaryInCharge?._id &&
                memoizedUsers?.filter(item => item.value === followUpData?.secondaryInCharge?._id)
                  .length <= 0
                  ? [
                      ...memoizedUsers,
                      {
                        value: followUpData?.secondaryInCharge?._id,
                        label: followUpData?.secondaryInCharge?.name,
                      },
                    ] || []
                  : memoizedUsers || []
              }
              dropdownComponent={usersDropdown}
              classNames={{ label: labelClass }}
            />
          </div>
          <ControlledTextarea
            name="notes"
            label="Notes"
            minRows={4}
            className="pt-4"
            classNames={{ label: labelClass }}
          />
          <div className="pt-6 pb-4 flex gap-6 justify-end">
            <Button
              variant="default"
              color="dark"
              className="font-normal bg-black text-white"
              onClick={onCancel}
              disabled={addFollowUpHandler.isLoading || updateFollowUpHandler.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-purple-450 font-normal text-white"
              loading={addFollowUpHandler.isLoading || updateFollowUpHandler.isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddFollowUpContent;
