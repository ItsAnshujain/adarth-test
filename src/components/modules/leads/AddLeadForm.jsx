import { ActionIcon, Button, Divider, Image, MultiSelect } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { ChevronDown } from 'react-feather';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import { IconPlus } from '@tabler/icons';
import ControlledSelect from '../../shared/FormInputs/Controlled/ControlledSelect';
import ControlledTextInput from '../../shared/FormInputs/Controlled/ControlledTextInput';
import CalendarIcon from '../../../assets/calendar.svg';
import ControlledTextarea from '../../shared/FormInputs/Controlled/ControlledTextarea';
import {
  leadPriorityOptions,
  leadProspectOptions,
  leadSourceOptions,
  leadStageOptions,
} from '../../../utils/constants';
import { useInfiniteUsers } from '../../../apis/queries/users.queries';
import DropdownWithHandler from '../../shared/SelectDropdown/DropdownWithHandler';
import useUserStore from '../../../store/user.store';
import ControlledDatePickerInput from '../../shared/FormInputs/Controlled/ControlledDatePickerInput';
import { useInfiniteContacts } from '../../../apis/queries/contacts.queries';
import { useInfiniteCompanies } from '../../../apis/queries/companies.queries';
import { useAddLead, useLeadById, useUpdateLead } from '../../../apis/queries/leads.queries';
import SuccessModal from '../../shared/Modal';
import SelectLeadCompanyItem from './SelectLeadCompanyItem';
import SelectContactPersonItem from './SelectContactPersonItem';

const schema = yup.object({
  leadCompany: yup
    .string()
    .trim()
    .typeError('Lead company is required')
    .required('Lead company is required'),
  contact: yup
    .string()
    .trim()
    .typeError('Contact person name is required')
    .required('Contact person name is required'),
});

const multiSelectStyles = {
  label: {
    marginBottom: '4px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  value: {
    backgroundColor: 'black',
    color: 'white',
    '& button svg': {
      backgroundColor: 'white',
      borderRadius: '50%',
    },
  },
  icon: {
    color: 'white',
  },
};

const AddLeadForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [successModalOpened, setOpenSuccessModal] = useState(false);
  const [successModalText, setSuccessModalText] = useState('');
  const [brandCompetitor, setBrandCompetitor] = useState('');
  const [brandCompetitorsOptions, setBrandCompetitorsOptions] = useState([]);
  const userId = useUserStore(state => state.id);
  const user = queryClient.getQueryData(['users-by-id', userId]);
  const form = useForm({
    resolver: yupResolver(schema),
  });
  const id = searchParams.get('id');

  const addLeadHandler = useAddLead();
  const updateLeadHandler = useUpdateLead();

  const leadByIdQuery = useLeadById(id, !!id);

  const usersQuery = useInfiniteUsers({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filter: 'team',
  });

  const contactsQuery = useInfiniteContacts({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const leadCompaniesQuery = useInfiniteCompanies({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    type: 'lead-company',
  });

  const companyRepresentingQuery = useInfiniteCompanies({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    type: 'co-company',
  });

  const memoizedUsers = useMemo(
    () =>
      usersQuery.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        ?.map(doc => ({
          ...doc,
          label: doc.name,
          value: doc._id,
        })) || [],
    [usersQuery?.data],
  );

  const memoizedContacts = useMemo(() => {
    const temp =
      contactsQuery.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        ?.map(doc => ({
          ...doc,
          label: doc.name,
          value: doc._id,
        })) || [];

    temp.push({ label: '', value: '', addMore: true });
    return temp;
  }, [contactsQuery?.data]);

  const memoizedLeadCompanies = useMemo(() => {
    const temp =
      leadCompaniesQuery?.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        ?.map(doc => ({
          ...doc,
          label: doc.companyName,
          value: doc._id,
        })) || [];

    temp.push({ label: '', value: '', addMore: true });
    return temp;
  }, [leadCompaniesQuery?.data]);

  const memoizedRepresentingCompanies = useMemo(
    () =>
      companyRepresentingQuery.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        ?.map(doc => ({
          ...doc,
          label: doc.companyName,
          value: doc._id,
        })) || [],
    [companyRepresentingQuery?.data],
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

  const contactsDropdown = useMemo(
    () =>
      DropdownWithHandler(
        () => contactsQuery.fetchNextPage(),
        contactsQuery.isFetchingNextPage,
        contactsQuery.hasNextPage,
      ),
    [contactsQuery?.data],
  );

  const leadCompaniesDropdown = useMemo(
    () =>
      DropdownWithHandler(
        () => leadCompaniesQuery.fetchNextPage(),
        leadCompaniesQuery.isFetchingNextPage,
        leadCompaniesQuery.hasNextPage,
      ),
    [leadCompaniesQuery?.data],
  );

  const representingCompaniesDropdown = useMemo(
    () =>
      DropdownWithHandler(
        () => companyRepresentingQuery.fetchNextPage(),
        companyRepresentingQuery.isFetchingNextPage,
        companyRepresentingQuery.hasNextPage,
      ),
    [companyRepresentingQuery?.data],
  );

  useEffect(() => {
    if (memoizedUsers?.filter(item => item.value === user?._id).length <= 0) {
      memoizedUsers.push({
        value: user?._id,
        label: user?.name,
      });
    }
    form.setValue('primaryInCharge', user?._id);
  }, [user]);

  useEffect(() => {
    if (
      leadByIdQuery?.data?.brandCompetitors?.length > 0 &&
      leadByIdQuery?.data?.brandCompetitors[0].length > 0
    ) {
      setBrandCompetitorsOptions(
        leadByIdQuery?.data?.brandCompetitors?.map(competitor => ({
          label: competitor,
          value: competitor,
        })) || [],
      );
    }

    if (leadByIdQuery.data) {
      form.reset({
        ...leadByIdQuery.data,
        companyRepresenting: leadByIdQuery?.data?.companyRepresenting?._id,
        contact: leadByIdQuery?.data?.contact?._id,
        leadCompany: leadByIdQuery?.data?.leadCompany?._id,
        primaryInCharge: leadByIdQuery?.data?.primaryInCharge?._id,
        secondaryInCharge: leadByIdQuery?.data?.secondaryInCharge?._id,
        targetAudience: leadByIdQuery?.data?.targetAudience?.[0],
        brandCompetitors:
          leadByIdQuery?.data?.brandCompetitors?.length > 0 &&
          leadByIdQuery?.data?.brandCompetitors[0].length > 0
            ? leadByIdQuery?.data?.brandCompetitors
            : [],
        targetStartDate:
          leadByIdQuery?.data?.targetStartDate && new Date(leadByIdQuery?.data?.targetStartDate),
        targetEndDate:
          leadByIdQuery?.data?.targetEndDate && new Date(leadByIdQuery?.data?.targetEndDate),
        leadCloseDate:
          leadByIdQuery?.data?.leadCloseDate && new Date(leadByIdQuery?.data?.leadCloseDate),
      });
    }
  }, [leadByIdQuery.data]);

  const handleOnSuccess = text => {
    setOpenSuccessModal(true);
    setSuccessModalText(text);
  };

  const onSubmit = form.handleSubmit(formData => {
    const {
      leadCompany,
      contact,
      companyRepresenting,
      brandDisplay,
      targetStartDate,
      targetEndDate,
      objective,
      remarksComments,
      primaryInCharge,
      secondaryInCharge,
      priority,
      stage,
      overAllBudget,
      leadCloseDate,
      targetAudience,
      brandCompetitors,
      campaignObjective,
      prospect,
      leadSource,
      campaignTheme,
    } = formData;

    if (!primaryInCharge) {
      showNotification({
        message: 'Please select Primary Incharge',
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
      leadCompany,
      contact,
      companyRepresenting,
      brandDisplay,
      targetStartDate: targetStartDate && dayjs(targetStartDate)?.endOf('day'),
      targetEndDate: targetEndDate && dayjs(targetEndDate)?.endOf('day'),
      objective,
      remarksComments,
      primaryInCharge,
      secondaryInCharge,
      priority,
      stage,
      overAllBudget: Number(overAllBudget) ? Number(overAllBudget) : undefined,
      leadCloseDate: leadCloseDate && dayjs(leadCloseDate)?.endOf('day'),
      targetAudience: [targetAudience] || [''],
      brandCompetitors: brandCompetitors || [''],
      campaignObjective,
      prospect: prospect || undefined,
      leadSource,
      campaignTheme,
      id,
    };

    if (id) {
      updateLeadHandler.mutate(data, {
        onSuccess: () => {
          showNotification({
            message: 'Lead updated successfully',
          });
          navigate(-1);
        },
      });
    } else {
      addLeadHandler.mutate(data, {
        onSuccess: () => {
          showNotification({
            message: 'Lead added successfully',
          });
          handleOnSuccess('Lead');
          setTimeout(() => {
            navigate(-1);
          }, 2000);
        },
      });
    }
  });

  const handleAddBrandCompetitor = () => {
    if (brandCompetitor.length > 0) {
      const watchBrandCompetitors = form.watch('brandCompetitors') || [];
      setBrandCompetitorsOptions([
        ...brandCompetitorsOptions,
        { label: brandCompetitor, value: brandCompetitor },
      ]);
      form.setValue('brandCompetitors', [...watchBrandCompetitors, brandCompetitor]);
      setBrandCompetitor('');
    }
  };

  const labelClass = 'font-bold text-base';
  const datePickerClass = { icon: 'flex justify-end w-full pr-2', input: 'pl-2', calendar: 'h-72' };

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <div className="flex items-center justify-between py-2 px-6">
            <div className="text-xl font-bold">Create Lead</div>
            <div className="flex gap-4 gap-x-6">
              <Button
                variant="default"
                onClick={() => navigate(-1)}
                disabled={
                  addLeadHandler.isLoading || updateLeadHandler.isLoading || !!successModalOpened
                }
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-450"
                type="submit"
                disabled={
                  addLeadHandler.isLoading || updateLeadHandler.isLoading || !!successModalOpened
                }
                loading={addLeadHandler.isLoading || updateLeadHandler.isLoading}
              >
                Save
              </Button>
            </div>
          </div>
          <Divider />
          <div className="py-2 px-6">
            <div className="flex gap-3 justify-end py-4">
              <div />
              <div className="border border-gray-200 flex items-center text-gray-400 text-sm rounded-md px-2 w-fit">
                <div>Primary Incharge - </div>
                <ControlledSelect
                  clearable
                  searchable
                  placeholder="Select..."
                  name="primaryInCharge"
                  data={
                    leadByIdQuery?.data?.primaryInCharge?._id &&
                    memoizedUsers?.filter(
                      item => item.value === leadByIdQuery?.data?.primaryInCharge?._id,
                    ).length <= 0
                      ? [
                          ...memoizedUsers,
                          {
                            value: leadByIdQuery?.data?.primaryInCharge?._id,
                            label: leadByIdQuery?.data?.primaryInCharge?.name,
                          },
                        ] || []
                      : memoizedUsers || []
                  }
                  withAsterisk
                  className="w-32"
                  classNames={{
                    input: 'border-none',
                    dropdown: 'w-56',
                    rightSection: 'pointers-none',
                  }}
                  rightSection={<ChevronDown size={20} />}
                  dropdownComponent={usersDropdown}
                />
              </div>
              <div className="border border-gray-200 flex items-center text-gray-400 text-sm rounded-md px-2 w-fit">
                <div>Secondary Incharge - </div>
                <ControlledSelect
                  clearable
                  searchable
                  placeholder="Select..."
                  name="secondaryInCharge"
                  data={
                    leadByIdQuery?.data?.secondaryInCharge?._id &&
                    memoizedUsers?.filter(
                      item => item.value === leadByIdQuery?.data?.secondaryInCharge?._id,
                    ).length <= 0
                      ? [
                          ...memoizedUsers,
                          {
                            value: leadByIdQuery?.data?.secondaryInCharge?._id,
                            label: leadByIdQuery?.data?.secondaryInCharge?.name,
                          },
                        ] || []
                      : memoizedUsers || []
                  }
                  withAsterisk
                  className="w-32"
                  classNames={{
                    input: 'border-none',
                    dropdown: 'w-56',
                  }}
                  rightSection={<ChevronDown size={20} />}
                  dropdownComponent={usersDropdown}
                />
              </div>
              <div className="border border-gray-200 flex items-center text-gray-400 text-sm rounded-md px-2 w-fit">
                <div>Priority - </div>
                <ControlledSelect
                  clearable
                  searchable
                  placeholder="Select..."
                  name="priority"
                  data={leadPriorityOptions}
                  withAsterisk
                  className="w-32"
                  classNames={{
                    input: 'border-none',
                  }}
                  rightSection={<ChevronDown size={20} />}
                />
              </div>
              <div className="border border-gray-200 flex items-center text-gray-400 text-sm rounded-md px-2 w-fit">
                <div>Stage - </div>
                <ControlledSelect
                  clearable
                  searchable
                  placeholder="Select..."
                  name="stage"
                  data={leadStageOptions}
                  withAsterisk
                  classNames={{
                    input: 'border-none',
                    dropdown: 'w-44',
                  }}
                  rightSection={<ChevronDown size={20} />}
                  className="w-32"
                />
              </div>
            </div>
            <div className="text-xl font-bold w-full">Basic Information</div>
            <div className="grid grid-cols-2 pt-4 gap-4 gap-x-6">
              <ControlledSelect
                clearable
                searchable
                placeholder="Select..."
                name="leadCompany"
                label="Lead Company"
                withAsterisk
                data={memoizedLeadCompanies}
                classNames={{ label: labelClass }}
                dropdownComponent={leadCompaniesDropdown}
                itemComponent={SelectLeadCompanyItem}
              />
              <ControlledSelect
                clearable
                searchable
                placeholder="Select..."
                name="companyRepresenting"
                label="Company Representing"
                data={memoizedRepresentingCompanies}
                dropdownComponent={representingCompaniesDropdown}
                classNames={{ label: labelClass }}
              />
              <ControlledDatePickerInput
                name="targetStartDate"
                label="Target Start Date"
                icon={<Image src={CalendarIcon} alt="icon" width={20} />}
                classNames={{
                  label: labelClass,
                  ...datePickerClass,
                }}
              />
              <ControlledDatePickerInput
                name="targetEndDate"
                label="Target End Date"
                icon={<Image src={CalendarIcon} alt="icon" width={20} />}
                classNames={{
                  label: labelClass,
                  ...datePickerClass,
                }}
              />
              <ControlledSelect
                clearable
                searchable
                placeholder="Select..."
                name="contact"
                label="Contact Person Name"
                withAsterisk
                data={memoizedContacts}
                classNames={{ label: labelClass }}
                dropdownComponent={contactsDropdown}
                itemComponent={SelectContactPersonItem}
              />
              <ControlledTextInput
                name="brandDisplay"
                label="Display Brand"
                classNames={{ label: labelClass }}
              />
            </div>
            <div className="grid grid-cols-1 py-4 gap-4 gap-x-6">
              <ControlledTextInput
                name="objective"
                label="Objective"
                classNames={{ label: labelClass }}
              />
              <ControlledTextarea
                minRows={3}
                name="remarksComments"
                label="Remarks"
                classNames={{
                  label: 'text-primary text-base mb-2 font-bold',
                  input: 'border-gray-450',
                }}
              />
            </div>
            <div className="text-xl font-bold mt-6">Other Information</div>
            <div className="grid grid-cols-2 pt-4 gap-4 gap-x-6">
              <ControlledTextInput
                name="overAllBudget"
                label="Overall Budget"
                classNames={{ label: labelClass }}
              />
              <ControlledDatePickerInput
                name="leadCloseDate"
                label="Lead Close Date"
                icon={<Image src={CalendarIcon} alt="icon" width={20} />}
                classNames={{
                  label: labelClass,
                  ...datePickerClass,
                }}
              />
            </div>
            <div className="grid grid-cols-1 pt-4 gap-4 gap-x-6">
              <ControlledTextInput
                name="targetAudience"
                label="Target Audiences"
                classNames={{ label: labelClass }}
              />
              <MultiSelect
                placeholder="Select..."
                name="brandCompetitors"
                label="Brand Competitor"
                data={brandCompetitorsOptions}
                styles={multiSelectStyles}
                clearable
                searchable
                size="sm"
                onSearchChange={setBrandCompetitor}
                searchValue={brandCompetitor}
                value={form.watch('brandCompetitors') || []}
                onChange={val => form.setValue('brandCompetitors', val)}
                rightSection={
                  <ActionIcon onClick={handleAddBrandCompetitor} className="bg-purple-450">
                    <IconPlus color="white" />
                  </ActionIcon>
                }
                classNames={{ label: labelClass }}
              />

              <ControlledTextInput
                name="campaignTheme"
                label="Campaign Theme"
                classNames={{ label: labelClass }}
              />
              <ControlledTextarea
                minRows={3}
                name="campaignObjective"
                label="Campaign Objective"
                classNames={{
                  label: 'font-bold text-primary text-base mb-2',
                  input: 'border-gray-450',
                }}
              />
            </div>
            <div className="grid grid-cols-2 py-4 gap-4 gap-x-6">
              <ControlledSelect
                clearable
                searchable
                placeholder="Select..."
                name="prospect"
                label="Prospect"
                data={leadProspectOptions}
                classNames={{ label: labelClass }}
              />
              <ControlledSelect
                clearable
                searchable
                placeholder="Select..."
                name="leadSource"
                label="Lead Source"
                data={leadSourceOptions}
                classNames={{ label: labelClass }}
              />
            </div>
          </div>
        </form>
      </FormProvider>
      <SuccessModal
        title={`${successModalText} Successfully Added`}
        prompt="Close"
        open={successModalOpened}
        setOpenSuccessModal={setOpenSuccessModal}
      />
    </>
  );
};

export default AddLeadForm;
