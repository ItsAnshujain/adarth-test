import { ActionIcon, Divider, Drawer, Tabs, Loader } from '@mantine/core';
import { IconX } from '@tabler/icons';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown } from 'react-feather';
import { useEffect, useState } from 'react';
import { useModals } from '@mantine/modals';
import Select from '../../shared/FormInputs/Select';
import ViewLeadStepper from './ViewLeadStepper';
import LeadsOverview from './LeadsOverview';
import LeadFollowUps from './LeadFollowUps';
import LeadMenuPopover from '../../Popovers/LeadMenuPopover';
import AddFollowUpContent from './AddFollowUpContent';
import modalConfig from '../../../utils/modalConfig';
import { useLeadById, useUpdateLead } from '../../../apis/queries/leads.queries';
import { leadPriorityOptions, leadStageOptions } from '../../../utils/constants';
import { useFollowUps } from '../../../apis/queries/followup.queries';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-2xl font-bold px-4',
    header: 'p-4 border-b border-gray-450',
    body: 'px-8',
    close: 'mr-4',
  },
  size: 800,
};

const ViewLeadDrawer = ({ isOpened, styles, onClose, leadId }) => {
  const leadByIdQuery = useLeadById(leadId, !!leadId);
  const modals = useModals();
  const [searchParams, setSearchParams] = useSearchParams({
    leadDetailTab: 'overview',
  });
  const [activeStep, setActiveStep] = useState('');
  const leadDetailTab = searchParams.get('leadDetailTab');
  const updateLeadHandler = useUpdateLead();

  const toggleAddFollowUp = id =>
    modals.openModal({
      title: 'Add Follow Up',
      modalId: 'addFollowUpModal',
      children: (
        <AddFollowUpContent onCancel={() => modals.closeModal('addFollowUpModal')} leadId={id} />
      ),
      ...updatedModalConfig,
    });

  const query = {
    page: 1,
    limit: 20,
    sortBy: 'followUpDate',
    sortOrder: 'desc',
  };

  const handleUpdateLead = (val, key) => {
    const data = {
      [key]: val,
    };
    updateLeadHandler.mutate({ id: leadId, ...data });
  };

  const followUpsQuery = useFollowUps({ ...query, id: leadId }, !!leadId);

  useEffect(() => setActiveStep(leadByIdQuery?.data?.stage), [leadByIdQuery?.data]);

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="xl"
      position="right"
      opened={isOpened}
      styles={styles}
      withCloseButton={false}
      classNames={{
        title: 'text-xl font-semibold',
        header: 'px-6 mb-0 z-20 h-16 sticky top-0 bg-white',
        closeButton: 'text-black',
        body: 'p-0',
      }}
    >
      <div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-xl font-bold">Lead Details</div>
          <div className="flex items-center gap-2">
            <LeadMenuPopover
              itemId={leadId}
              toggleAddFollowUp={() => toggleAddFollowUp(leadId)}
              onClose={onClose}
            />
            <ActionIcon onClick={onClose}>
              <IconX />
            </ActionIcon>
          </div>
        </div>
        <Divider />
        <div className="py-2">
          {leadByIdQuery.isLoading || leadByIdQuery.isFetching || leadByIdQuery?.isRefetching ? (
            <div className="h-full">
              <Loader className="m-auto" />
            </div>
          ) : (
            <Tabs className="w-full" value={leadDetailTab}>
              <Tabs.List className="border-b">
                <div className="flex justify-between w-full pb-0  px-6">
                  <div className="flex gap-4 mb-0">
                    <Tabs.Tab
                      value="overview"
                      className={classNames(
                        'p-0 border-0 text-lg pb-2 hover:bg-transparent',
                        leadDetailTab === 'overview'
                          ? 'border border-b-2 border-purple-450 text-purple-450'
                          : '',
                      )}
                      onClick={() => {
                        searchParams.set('leadDetailTab', 'overview');
                        searchParams.set('page', 1);
                        setSearchParams(searchParams, { replace: true });
                      }}
                    >
                      Overview
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="followUps"
                      className={classNames(
                        'p-0 border-0 text-lg pb-2 hover:bg-transparent',
                        leadDetailTab === 'followUps'
                          ? 'border border-b-2 border-purple-450 text-purple-450'
                          : '',
                      )}
                      onClick={() => {
                        searchParams.set('leadDetailTab', 'followUps');
                        searchParams.set('page', 1);
                        setSearchParams(searchParams, { replace: true });
                      }}
                    >
                      Follow Ups
                    </Tabs.Tab>
                  </div>
                  <div className="mb-2 flex gap-3">
                    <div className="border border-gray-200 flex items-center text-gray-400 text-sm rounded-md px-2 w-fit">
                      <div>Stage - </div>
                      <Select
                        clearable
                        searchable
                        placeholder="Select..."
                        name="stage"
                        data={leadStageOptions}
                        value={leadByIdQuery?.data?.stage}
                        onChange={val => {
                          handleUpdateLead(val, 'stage');
                        }}
                        withAsterisk
                        rightSection={<ChevronDown size={20} />}
                        className="w-28"
                        classNames={{
                          input: 'border-none',
                          dropdown: 'w-40',
                        }}
                      />
                    </div>
                    <div className="border border-gray-200 flex items-center text-gray-400 text-sm rounded-md px-2 w-fit">
                      <div>Priority - </div>
                      <Select
                        clearable
                        searchable
                        placeholder="Select..."
                        name="priority"
                        data={leadPriorityOptions}
                        value={leadByIdQuery?.data?.priority}
                        onChange={val => {
                          handleUpdateLead(val, 'priority');
                        }}
                        withAsterisk
                        rightSection={<ChevronDown size={20} />}
                        className="w-28"
                        classNames={{
                          input: 'border-none',
                          dropdown: 'w-40',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Tabs.List>
              <Tabs.Panel value="overview" className="px-6">
                <ViewLeadStepper activeStep={activeStep?.replace(' ', '')} />
                <LeadsOverview leadData={leadByIdQuery?.data} />
              </Tabs.Panel>
              <Tabs.Panel value="followUps" className="px-6">
                <LeadFollowUps leadId={leadByIdQuery?.data?._id} followUpsQuery={followUpsQuery} />
              </Tabs.Panel>
            </Tabs>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ViewLeadDrawer;
