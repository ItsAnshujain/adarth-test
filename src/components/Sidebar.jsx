import { Button, List, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';
import CookiePolicyContent from './modules/policies/CookiePolicyContent';
import DisclaimerPolicyContent from './modules/policies/DisclaimerPolicyContent';
import PrivacyPolicyContent from './modules/policies/PrivacyPolicyContent';
import SidebarContent from './SidebarContent';

const docTypes = {
  privacyPolicy: PrivacyPolicyContent,
  disclaimerPolicy: DisclaimerPolicyContent,
  cookiePolicy: CookiePolicyContent,
};

const Sidebar = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [currentContent, setCurrentContent] = useState('privacyPolicy');

  const Preview = docTypes[currentContent] ?? <div />;

  const handleModal = type => {
    setCurrentContent(type);
    open();
  };

  return (
    <div className="hidden lg:block lg:col-span-2 pt-4 bg-purple-450 overflow-y-auto valid sidebar-scroll">
      <div className="h-full flex flex-col justify-between">
        <SidebarContent className="gap-3 px-5" />
        <List className="p-5 text-white" listStyleType="disc">
          <List.Item>
            <Button className="p-0 text-xs font-light" onClick={() => handleModal('privacyPolicy')}>
              Privacy Policy
            </Button>
          </List.Item>
          <List.Item>
            <Button
              className="p-0 text-xs font-light"
              onClick={() => handleModal('disclaimerPolicy')}
            >
              Disclaimer policy
            </Button>
          </List.Item>
          <List.Item>
            <Button className="p-0 text-xs font-light" onClick={() => handleModal('cookiePolicy')}>
              Cookie Policy
            </Button>
          </List.Item>
        </List>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        centered
        size="xl"
        overlayBlur={3}
        overlayOpacity={0.55}
        radius={0}
        padding={0}
        classNames={{
          header: 'pt-2',
          body: 'py-4',
          close: 'mr-4',
        }}
      >
        <Preview />
      </Modal>
    </div>
  );
};

export default Sidebar;
