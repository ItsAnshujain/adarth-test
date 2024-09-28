import { ActionIcon, Tabs } from '@mantine/core';
import { IconArrowLeft, IconPencil, IconTrash } from '@tabler/icons';
import classNames from 'classnames';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useModals } from '@mantine/modals';
import ViewCompany from './ViewCompany';
import DeleteCompanyContent from './DeleteCompanyContent';
import modalConfig from '../../../utils/modalConfig';
import AddCompanyContent from './AddCompanyContent';
import { useCompanyById } from '../../../apis/queries/companies.queries';
import AddSisterCompanyContent from '../co-company/AddSisterCompanyContent';

const updatedModalConfig = {
  ...modalConfig,
  size: '1000px',
  classNames: {
    title: 'font-dmSans text-2xl font-bold px-4',
    header: 'p-4 border-b border-gray-450',
    body: '',
    close: 'mr-4',
  },
};

const ViewCompanyHeader = ({ type, tab }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const modals = useModals();

  const { id } = useParams();
  const companyQuery = useCompanyById(id, !!id);

  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      modalId: 'deleteCompanyModal',
      innerProps: {
        modalBody: (
          <DeleteCompanyContent
            classNames="px-8 mt-4"
            onClickCancel={() => modals.closeModal('deleteCompanyModal')}
            onConfirm={() => navigate(`/repository/${type}?tab=${tab}`)}
            id={companyQuery?.data?._id}
          />
        ),
      },
      ...modalConfig,
    });

  const toggleEditCompanyModal = () => {
    modals.openModal({
      title: 'Edit Company',
      modalId: 'editCompanyModal',
      children: (
        <AddCompanyContent
          type={type}
          tab="companies"
          onCancel={() => modals.closeModal('editCompanyModal')}
          companyData={companyQuery?.data}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleEditParentCompanyModal = () => {
    modals.openModal({
      title: 'Edit Parent Company',
      modalId: 'editCompanyModal',
      children: (
        <AddCompanyContent
          type={type}
          tab="parent-companies"
          onCancel={() => modals.closeModal('editCompanyModal')}
          companyData={companyQuery?.data}
        />
      ),
      ...updatedModalConfig,
    });
  };

  const toggleEditSisterCompanyModal = () => {
    modals.openModal({
      title: 'Edit Sister Company',
      modalId: 'editSisterCompanyModal',
      children: (
        <AddSisterCompanyContent
          type={type}
          tab="sister-companies"
          onCancel={() => modals.closeModal('editSisterCompanyModal')}
          companyData={companyQuery?.data}
        />
      ),
      ...updatedModalConfig,
    });
  };

  return (
    <div className="flex justify-between pb-4 pt-2">
      <Tabs className="w-full" value={activeTab}>
        <Tabs.List className="border-b">
          <div className="flex justify-between w-full pb-0">
            <div className="flex gap-4 mb-0">
              <ActionIcon component={Link} to={`/repository/${type}?tab=${tab}`}>
                <IconArrowLeft color="black" />
              </ActionIcon>
              <Tabs.Tab
                value="overview"
                className={classNames(
                  'p-0 border-0 text-lg pb-2',
                  activeTab === 'overview'
                    ? 'border border-b-2 border-purple-450 text-purple-450'
                    : '',
                )}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </Tabs.Tab>
            </div>
            <div className="flex">
              <ActionIcon
                onClick={() =>
                  type === 'company' && tab !== 'parent-companies'
                    ? toggleEditCompanyModal()
                    : tab === 'sister-companies'
                    ? toggleEditSisterCompanyModal()
                    : toggleEditParentCompanyModal()
                }
                disabled={companyQuery.isLoading}
              >
                <IconPencil color="black" />
              </ActionIcon>
              <ActionIcon onClick={toggleDeleteModal} disabled={companyQuery.isLoading}>
                <IconTrash className="text-purple-450" />
              </ActionIcon>
            </div>
          </div>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <ViewCompany
            type={type}
            tab={tab}
            companyData={companyQuery?.data}
            isLoading={companyQuery.isLoading}
          />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default ViewCompanyHeader;
