import { ActionIcon, Tabs } from '@mantine/core';
import { IconArrowLeft, IconPencil, IconTrash } from '@tabler/icons';
import classNames from 'classnames';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useModals } from '@mantine/modals';
import ViewContact from './ViewContact';
import modalConfig from '../../../utils/modalConfig';
import AddContactContent from './AddContactContent';
import DeleteContactContent from './DeleteContactContent';
import { useContactById } from '../../../apis/queries/contacts.queries';

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

const ViewContactHeader = ({ type }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { id } = useParams();
  const navigate = useNavigate();
  const contactQuery = useContactById(id, !!id);

  const modals = useModals();
  const toggleDeleteModal = () =>
    modals.openContextModal('basic', {
      modalId: 'deleteContact',
      innerProps: {
        modalBody: (
          <DeleteContactContent
            id={id}
            classNames="px-8 mt-4"
            onClickCancel={() => modals.closeModal('deleteContact')}
            onConfirm={() => navigate('/repository/contact')}
          />
        ),
      },
      ...modalConfig,
    });

  const toggleEditContact = mode => {
    modals.openModal({
      title: `${mode} Contact`,
      modalId: 'editContact',
      children: (
        <AddContactContent
          contactData={contactQuery.data}
          mode="edit"
          onCancel={() => modals.closeModal('editContact')}
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
              <ActionIcon component={Link} to="/repository/contact">
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
                onClick={() => toggleEditContact('Edit')}
                disabled={contactQuery.isLoading}
              >
                <IconPencil color="black" />
              </ActionIcon>
              <ActionIcon onClick={toggleDeleteModal} disabled={contactQuery.isLoading}>
                <IconTrash className="text-purple-450" />
              </ActionIcon>
            </div>
          </div>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <ViewContact type={type} contactData={contactQuery.data} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default ViewContactHeader;
