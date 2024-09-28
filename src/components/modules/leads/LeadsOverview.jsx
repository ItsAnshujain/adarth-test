import { Badge, Divider, Select } from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { indianCurrencyInDecimals } from '../../../utils';
import { DATE_FORMAT, leadProspectOptions, leadSourceOptions } from '../../../utils/constants';
import { useUpdateLead } from '../../../apis/queries/leads.queries';
import { useInfiniteUsers } from '../../../apis/queries/users.queries';

const LeadsOverview = ({ leadData }) => {
  const updateLeadHandler = useUpdateLead();

  const handleUpdateLead = (val, key) => {
    const data = {
      [key]: val,
    };
    updateLeadHandler.mutate({ id: leadData?._id, ...data });
  };

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
        ?.map(doc => ({
          ...doc,
          label: doc.name,
          value: doc._id,
        })) || [],
    [usersQuery?.data],
  );

  const primaryInChargeOptions = useMemo(
    () =>
      leadData?.primaryInCharge
        ? [{ label: leadData?.primaryInCharge?.name, value: leadData?.primaryInCharge?._id }]
        : [],
    [leadData],
  );
  const secondaryInChargeOptions = useMemo(
    () =>
      leadData?.secondaryInCharge
        ? [{ label: leadData?.secondaryInCharge?.name, value: leadData?.secondaryInCharge?._id }]
        : [],
    [leadData],
  );
  return (
    <div>
      <div className="flex gap-2">
        <div className="border border-gray-200 flex items-center text-gray-400 text-base rounded-md px-2 w-fit">
          <div className="text-base">Primary Incharge - </div>
          <Select
            clearable
            searchable
            placeholder="Select..."
            name="primaryIncharge"
            data={
              leadData?.primaryInCharge?._id &&
              memoizedUsers?.filter(item => item.value === leadData?.primaryInCharge?._id).length <=
                0
                ? [
                    ...memoizedUsers,
                    {
                      value: leadData?.primaryInCharge?._id,
                      label: leadData?.primaryInCharge?.name,
                    },
                  ] || []
                : memoizedUsers || []
            }
            value={primaryInChargeOptions?.[0]?.value}
            className="w-28"
            classNames={{
              input: 'border-none',
              dropdown: 'w-56',
              rightSection: 'pointers-none',
            }}
            onChange={val => {
              handleUpdateLead(val, 'primaryInCharge');
            }}
            withAsterisk
            rightSection={<ChevronDown size={20} />}
            styles={{ rightSection: { pointerEvents: 'none' } }}
          />
        </div>
        <div className="border border-gray-200 flex items-center text-gray-400 text-md rounded-md px-2 w-fit">
          <div className="text-base">Secondary Incharge - </div>
          <Select
            clearable
            searchable
            placeholder="Select..."
            name="secondaryIncharge"
            data={
              leadData?.secondaryInCharge?._id &&
              memoizedUsers?.filter(item => item.value === leadData?.secondaryInCharge?._id)
                .length <= 0
                ? [
                    ...memoizedUsers,
                    {
                      value: leadData?.secondaryInCharge?._id,
                      label: leadData?.secondaryInCharge?.name,
                    },
                  ] || []
                : memoizedUsers || []
            }
            value={secondaryInChargeOptions?.[0]?.value}
            withAsterisk
            rightSection={<ChevronDown size={20} />}
            className="w-28"
            classNames={{
              input: 'border-none',
              dropdown: 'w-56',
              rightSection: 'pointers-none',
            }}
            onChange={val => {
              handleUpdateLead(val, 'secondaryInCharge');
            }}
            styles={{ rightSection: { pointerEvents: 'none' } }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 py-4">
        <div className="text-xl font-bold">{leadData?.leadCompany?.companyName}</div>
        <div className="text-base text-black/80">{leadData?.objective}</div>
        <div className="text-lg font-bold">Basic information</div>
        <div className="flex">
          <div className="flex flex-col w-1/3">
            <div className="text-base text-gray-500 pb-1">Start Date</div>
            <div className="text-base">
              {leadData?.targetStartDate
                ? dayjs(leadData?.targetStartDate).format(DATE_FORMAT)
                : '-'}
            </div>
          </div>
          <div className="flex flex-col w-1/3">
            <div className="text-base text-gray-500 pb-1">End Date</div>
            <div className="text-base">
              {' '}
              {leadData?.targetEndDate ? dayjs(leadData?.targetEndDate).format(DATE_FORMAT) : '-'}
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-col  w-1/3">
            <div className="text-base text-gray-500 pb-1">Contact Person</div>
            <div className="text-base">{leadData?.contact?.name}</div>
          </div>
          <div className="flex flex-col  w-1/3">
            <div className="text-base text-gray-500 pb-1">Contact Number</div>
            <div className="text-base">
              {leadData?.contact?.contactNumber ? `+91${leadData?.contact?.contactNumber}` : '-'}
            </div>
          </div>
        </div>
        <div className="flex flex-col  w-1/3">
          <div className="text-base text-gray-500 pb-1">Display Brand</div>
          <div className="text-base">{leadData?.brandDisplay || '-'}</div>
        </div>
        <div className="flex flex-col  w-1/3">
          <div className="text-base text-gray-500 pb-1">Company Representing</div>
          <div className="text-base">{leadData?.companyRepresenting?.companyName || '-'}</div>
        </div>
        <Divider className="my-6" />
        <div className="text-base font-bold">Other information</div>
        <div className="flex">
          <div className="flex flex-col  w-1/3">
            <div className="text-base text-gray-500 pb-1">Overall Budget</div>
            <div className="text-base">
              {indianCurrencyInDecimals(leadData?.overAllBudget || 0)}
            </div>
          </div>
          <div className="flex flex-col  w-1/3">
            <div className="text-base text-gray-500 pb-1">Lead Close Date</div>
            <div className="text-base">
              {leadData?.leadCloseDate ? dayjs(leadData?.leadCloseDate).format(DATE_FORMAT) : '-'}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-base text-gray-500 pb-1">Target Audience</div>
          <div className="flex gap-2">
            {leadData?.targetAudience?.[0]?.length
              ? leadData?.targetAudience?.map(target => (
                  <Badge size="xs" className="bg-purple-450 text-white w-fit p-3 my-1 capitalize">
                    {target}
                  </Badge>
                ))
              : '-'}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-base text-gray-500 pb-1">Campaign Theme</div>
          {leadData?.campaignTheme ? (
            <Badge size="xs" className="bg-purple-450 text-white w-fit p-3 my-1 capitalize">
              {leadData?.campaignTheme}
            </Badge>
          ) : (
            '-'
          )}
        </div>
        <div className="flex flex-col">
          <div className="text-base text-gray-500 pb-1">Brand Competitor</div>

          <div className="flex gap-2">
            {leadData?.brandCompetitors?.[0]?.length
              ? leadData?.brandCompetitors?.map(competitor => (
                  <Badge size="xs" className="bg-purple-450 text-white w-fit p-3 my-1 capitalize">
                    {competitor}
                  </Badge>
                ))
              : '-'}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-base text-gray-500 pb-1">Prospect</div>
          <div className="text-base">
            {leadProspectOptions?.filter(prospect => prospect.value === leadData?.prospect)?.[0]
              ?.label || '-'}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-base text-gray-500 pb-1">Lead Source</div>
          <div className="text-base">
            {leadSourceOptions?.filter(({ value }) => value === leadData?.leadSource)?.[0]?.label ||
              '-'}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-base text-gray-500 pb-1">Remarks</div>
          <div className="text-base">{leadData?.remarksComments || '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default LeadsOverview;
