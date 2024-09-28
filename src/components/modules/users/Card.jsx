import { Avatar, Card as MantineCard, Text } from '@mantine/core';
import { Phone, Mail } from 'react-feather';
import UserImage from '../../../assets/placeholders/user.png';
import { roleTypes } from '../../../utils';

const updatedRoleTypes = { ...roleTypes, 'admin': 'Admin' };

const UserCard = ({
  name = 'NA',
  role = 'NA',
  company = 'NA',
  email = 'NA',
  number = 'NA',
  image,
}) => (
  <MantineCard className="p-4 cursor-pointer min-h-[232px]" withBorder radius="md" shadow="sm">
    <div className="flex gap-4">
      <Avatar size="xl" src={image || UserImage} className="rounded-full" />
      <div className="flex flex-col justify-between overflow-hidden overflow-ellipsis">
        <Text size="xl" weight="bold" lineClamp={2} className="w-full min-h-[62px]" title={name}>
          {name}
        </Text>
        <p className="text-[#914EFB]">{updatedRoleTypes[role] || 'NA'}</p>
        <Text size="md" lineClamp={2} className="w-full" title={name}>
          {company}
        </Text>
      </div>
    </div>
    <div className="flex flex-col gap-1 mt-3">
      <div className="flex items-center">
        <Mail size={18} />
        <p
          className="ml-2 mb-1 text-[#2938F7] text-sm overflow-x-hidden overflow-ellipsis"
          title={email}
        >
          {email}
        </p>
      </div>
      <div className="flex items-center">
        <Phone size={18} />
        <p className="ml-2 text-sm">{number}</p>
      </div>
    </div>
  </MantineCard>
);

export default UserCard;
