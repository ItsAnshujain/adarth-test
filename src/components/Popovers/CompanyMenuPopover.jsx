import { Button, Card, Menu } from '@mantine/core';
import { useModals } from '@mantine/modals';
import { Link, useNavigate } from 'react-router-dom';
import modalConfig from '../../utils/modalConfig';
import MenuIcon from '../Menu';
import DeleteCompanyContent from '../modules/company/DeleteCompanyContent';

const CompanyMenuPopover = ({ itemId, toggleEdit, tab, type }) => {
  const modals = useModals();
  const navigate = useNavigate();

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      modalId: 'deleteCompany',
      innerProps: {
        modalBody: (
          <DeleteCompanyContent
            id={itemId}
            classNames="px-8 mt-4"
            onClickCancel={() => modals.closeModal('deleteCompany')}
            onConfirm={() => navigate(`/repository/${type}?tab=${tab}`)}
          />
        ),
      },
      ...modalConfig,
    });

  return (
    <Menu shadow="md" width={120}>
      <Menu.Target>
        <Button>
          <MenuIcon />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Link to={`/repository/${type}/${tab}/${itemId}`} className="p-0">
          <Menu.Item>View</Menu.Item>
        </Link>
        <Card onClick={toggleEdit} className="p-0">
          <Menu.Item>Edit</Menu.Item>
        </Card>
        <Card onClick={toggleDeleteModal} className="p-0">
          <Menu.Item>Delete</Menu.Item>
        </Card>
      </Menu.Dropdown>
    </Menu>
  );
};

export default CompanyMenuPopover;
