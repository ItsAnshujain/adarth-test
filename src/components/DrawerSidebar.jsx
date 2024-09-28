import { Drawer } from '@mantine/core';
import SidebarContent from './SidebarContent';

const DrawerSidebar = ({ opened, setOpened }) => (
  <Drawer
    className="hidden sm:inline-block"
    opened={opened}
    onClose={() => setOpened(false)}
    padding="xl"
    size="md"
  >
    <SidebarContent className="gap-2" />
  </Drawer>
);

export default DrawerSidebar;
