import { Button, Image } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import ControlledTextInput from '../../shared/FormInputs/Controlled/ControlledTextInput';
import ControlledNumberInput from '../../shared/FormInputs/Controlled/ControlledNumberInput';
import ControlledSelect from '../../shared/FormInputs/Controlled/ControlledSelect';
import { useAddContact, useUpdateContact } from '../../../apis/queries/contacts.queries';
import {
  useInfiniteCompanies,
  useStateAndStateCode,
} from '../../../apis/queries/companies.queries';
import ControlledDatePickerInput from '../../shared/FormInputs/Controlled/ControlledDatePickerInput';
import DropdownWithHandler from '../../shared/SelectDropdown/DropdownWithHandler';
import { mobileRegexMatch } from '../../../utils';
import CalendarIcon from '../../../assets/calendar.svg';
import SelectLeadCompanyItem from '../leads/SelectLeadCompanyItem';

const AddContactContent = ({ onCancel, mode, contactData, onSuccess = () => {} }) => {
  const schema = yup.object({
    name: yup.string().trim().required('Name is required'),
    email: yup.string().trim().email('Invalid Email'),
    contactNumber: yup
      .string()
      .trim()
      .matches(mobileRegexMatch, { message: 'Must be a valid number', excludeEmptyString: true })
      .notRequired(),
  });

  const form = useForm({
    resolver: yupResolver(schema),
  });

  const addContactHandler = useAddContact();
  const updateContactHandler = useUpdateContact();
  const stateAndStateCodeQuery = useStateAndStateCode('');
  const companiesQuery = useInfiniteCompanies({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    type: 'lead-company',
    isParent: false,
  });

  const onSubmit = form.handleSubmit(formData => {
    const {
      name,
      email,
      contactNumber,
      department,
      city,
      stateAndStateCode,
      birthDate,
      company,
      parentCompanyId,
    } = formData;
    const data = {
      name,
      email: email || undefined,
      contactNumber: contactNumber ? contactNumber?.toString() : '',
      department,
      birthDate: birthDate && dayjs(birthDate).endOf('day')?.toISOString(),
      company,
      parentCompany: parentCompanyId || null,
      address: {
        address: null,
        city,
        pincode: null,
        stateCode: stateAndStateCode?.split(/\((\d+)\)\s*(.+)/)?.[1],
        state: stateAndStateCode?.split(/\((\d+)\)\s*(.+)/)?.[2],
      },
      id: contactData?._id,
    };

    if (mode === 'add') {
      addContactHandler.mutate(data, {
        onSuccess: () => {
          showNotification({
            title: 'Contact added successfully',
            color: 'green',
          });
          onCancel();
          onSuccess();
        },
      });
    } else {
      updateContactHandler.mutate(data, {
        onSuccess: () => {
          showNotification({
            title: 'Contact updated successfully',
            color: 'green',
          });
          onCancel();
        },
      });
    }
  });

  const memoizedStateAndStateCodeList = useMemo(
    () =>
      stateAndStateCodeQuery?.data?.map(stateDoc => ({
        label: `(${stateDoc.gstCode}) ${stateDoc.name}`,
        value: `(${stateDoc.gstCode}) ${stateDoc.name}`,
        ...stateDoc,
      })) || [],
    [stateAndStateCodeQuery?.data],
  );

  const memoizedCompanies = useMemo(() => {
    const temp =
      companiesQuery.data?.pages
        .reduce((acc, { docs }) => [...acc, ...docs], [])
        .map(doc => ({
          ...doc,
          label: doc.companyName,
          value: doc._id,
        })) || [];

    temp.push({ label: '', value: '', addMore: true });
    return temp;
  }, [companiesQuery?.data]);

  const companiesDropdown = useMemo(
    () =>
      DropdownWithHandler(
        () => companiesQuery.fetchNextPage(),
        companiesQuery.isFetchingNextPage,
        companiesQuery.hasNextPage,
      ),
    [companiesQuery],
  );

  useEffect(() => {
    const company = memoizedCompanies.filter(({ value }) => value === form.watch('company'))?.[0];

    form.setValue('parentCompany', company?.parentCompany?.companyName);
    form.setValue('parentCompanyId', company?.parentCompany?._id);
  }, [form.watch('company')]);

  useEffect(() => {
    if (contactData) {
      form.reset({
        ...contactData,
        ...contactData?.address,
        parentCompany: contactData?.parentCompany?.companyName,
        parentCompanyId: contactData?.parentCompany?._id,
        company: contactData?.company?._id,
        stateAndStateCode: `(${contactData?.address?.stateCode}) ${contactData?.address?.state}`,
        contactNumber: Number(contactData?.contactNumber) || '',
        birthDate: contactData?.birthDate && new Date(contactData?.birthDate),
      });
    }
  }, [contactData]);

  const labelClass = 'font-bold text-base';
  const datePickerClass = { icon: 'flex justify-end w-full pr-2', input: 'pl-2' };

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit}>
        <div className="px-8 pt-4">
          <div className="text-2xl font-bold">Basic information</div>
          <div className="grid grid-cols-2 py-4 gap-2">
            <ControlledTextInput
              name="name"
              label="Name"
              withAsterisk
              classNames={{ label: labelClass }}
            />
            <ControlledNumberInput
              type="number"
              name="contactNumber"
              label="Contact Number"
              classNames={{ label: labelClass }}
            />
            <ControlledTextInput name="email" label="Email" classNames={{ label: labelClass }} />
            <ControlledTextInput
              name="department"
              label="Department"
              classNames={{ label: labelClass }}
            />
            <ControlledSelect
              data={memoizedCompanies}
              name="company"
              label="Company Name"
              placeholder="Select..."
              clearable
              searchable
              classNames={{ label: labelClass }}
              dropdownComponent={companiesDropdown}
              itemComponent={SelectLeadCompanyItem}
            />
            <ControlledTextInput
              name="parentCompany"
              label="Parent Company Name"
              disabled
              classNames={{ label: labelClass }}
            />

            <ControlledSelect
              data={memoizedStateAndStateCodeList}
              name="stateAndStateCode"
              label="State & State Code"
              placeholder="Select..."
              clearable
              searchable
              classNames={{ label: labelClass }}
            />
            <ControlledTextInput name="city" label="City" classNames={{ label: labelClass }} />
            <ControlledDatePickerInput
              label="Birthday"
              name="birthDate"
              errors={form.errors}
              clearable
              icon={<Image src={CalendarIcon} alt="icon" width={20} />}
              classNames={{ label: labelClass, ...datePickerClass }}
            />
          </div>

          <div className="flex gap-2 py-4 float-right">
            <Button className="bg-black" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="bg-purple-450"
              type="submit"
              loading={addContactHandler.isLoading || updateContactHandler.isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddContactContent;
