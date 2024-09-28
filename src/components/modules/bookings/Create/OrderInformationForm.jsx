import { useMemo } from 'react';
import { ChevronDown } from 'react-feather';
import { formLabelStyles, serialize } from '../../../../utils';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import ControlledTextInput from '../../../shared/FormInputs/Controlled/ControlledTextInput';
import ControlledSelect from '../../../shared/FormInputs/Controlled/ControlledSelect';
import ControlledTextarea from '../../../shared/FormInputs/Controlled/ControlledTextarea';

const query = {
  parentId: null,
  limit: 100,
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
};

const OrderInformationForm = () => {
  const industryQuery = useFetchMasters(serialize({ type: 'industry', ...query }));

  const memoizedIndustryQuery = useMemo(
    () =>
      industryQuery.data?.docs.map(type => ({
        label: type.name,
        value: type._id,
      })),
    [industryQuery?.data?.docs],
  );
  return (
    <div className="mt-4">
      <p className="text-xl font-bold">Order Information</p>
      <article className="grid grid-cols-2 gap-8 mt-4">
        <section className="flex flex-col gap-y-4">
          <ControlledTextInput
            label="Campaign Name"
            name="campaignName"
            withAsterisk
            placeholder="Write..."
            maxLength={200}
            classNames={formLabelStyles}
          />
          <ControlledSelect
            label="Industry"
            name="industry"
            withAsterisk
            data={industryQuery.isSuccess ? memoizedIndustryQuery : []}
            placeholder="Select..."
            rightSection={<ChevronDown size={16} />}
            className="mb-7"
            classNames={formLabelStyles}
          />
        </section>
        <section>
          <ControlledTextarea
            label="Description"
            name="description"
            placeholder="Maximun 400 characters"
            maxLength={400}
            classNames={formLabelStyles}
            minRows={7}
          />
        </section>
      </article>
    </div>
  );
};

export default OrderInformationForm;
