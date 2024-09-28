import { Divider } from '@mantine/core';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../../utils/constants';

const ViewContact = ({ contactData }) => (
  <div className="py-4">
    <div className="text-lg font-bold">Basic Information</div>
    <div className="grid grid-cols-2 py-4 gap-4">
      <div>
        <div className="text-base text-gray-400 font-normal">Name</div>
        <div>{contactData?.name || '-'} </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">Contact Number</div>
        <div>{contactData?.contactNumber || '-'} </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">Email</div>
        <div>{contactData?.email || '-'} </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">Department</div>
        <div>{contactData?.department || '-'} </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">Company Name</div>
        <div>{contactData?.company?.companyName || '-'} </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">Parent Company Name</div>
        <div>{contactData?.parentCompany?.companyName || '-'} </div>
      </div>

      <div>
        <div className="text-base text-gray-400 font-normal">City</div>
        <div>{contactData?.address?.city || '-'} </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">State and State Code</div>
        <div>
          {contactData?.address?.stateCode
            ? `(${contactData?.address?.stateCode}) ${contactData?.address?.state}`
            : '-'}{' '}
        </div>
      </div>
      <div>
        <div className="text-base text-gray-400 font-normal">Birthday</div>
        <div>{dayjs(contactData?.birthDate).format(DATE_FORMAT) || '-'} </div>
      </div>
    </div>

    <Divider className="my-4" />
  </div>
);

export default ViewContact;
