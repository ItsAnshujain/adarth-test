import { Button, Card, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons';

const AddCompanyMenuPopover = ({ toggleAddParentCompanyModal, toggleAddCompanyModal }) => (
  <Menu shadow="md" width={180}>
    <Menu.Target>
      <Button
        variant="default"
        className="bg-purple-450 text-white font-normal rounded-md mb-2"
        leftIcon={<IconChevronDown size={20} />}
      >
        Add Company
      </Button>
    </Menu.Target>
    <Menu.Dropdown>
      <Card onClick={toggleAddCompanyModal} className="p-0">
        <Menu.Item>Add Company</Menu.Item>
      </Card>
      <Card onClick={toggleAddParentCompanyModal} className="p-0">
        <Menu.Item>Add Parent Company</Menu.Item>
      </Card>
    </Menu.Dropdown>
  </Menu>
);

export default AddCompanyMenuPopover;
