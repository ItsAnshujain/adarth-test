import { useMemo, useState, useEffect } from 'react';
import { Accordion, Button, Drawer, Radio } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { roleTypes } from '../../../utils';

const styles = { title: { fontWeight: 'bold' } };

const Filter = ({ isOpened, setShowFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roles, setRoles] = useState('');
  const role = searchParams.get('role');

  const handleRoleChange = userRole => {
    setRoles(userRole);
    if (userRole === roles) {
      setRoles('');
    }
  };

  const renderRoles = useMemo(
    () =>
      Object.keys(roleTypes).map(item => (
        <div className="flex gap-2 mb-2" key={uuidv4()}>
          <Radio
            onChange={event => handleRoleChange(event.currentTarget.value)}
            label={roleTypes[item]}
            defaultValue={item}
            checked={roles === item}
          />
        </div>
      )),
    [roles],
  );

  const handleNavigationByRoles = () => {
    searchParams.set('role', roles);
    searchParams.set('page', 1);
    setSearchParams(searchParams);
  };
  const handleResetParams = () => {
    searchParams.delete('role');
    setSearchParams(searchParams);
  };

  useEffect(() => {
    setRoles(role ?? '');
  }, [searchParams]);

  return (
    <Drawer
      className="overflow-auto"
      overlayOpacity={0.1}
      overlayBlur={0}
      size="sm"
      transition="slide-down"
      transitionDuration={1350}
      transitionTimingFunction="ease-in-out"
      padding="xl"
      position="right"
      opened={isOpened}
      styles={styles}
      title="Filters"
      onClose={() => setShowFilter(false)}
    >
      <div className="w-full flex justify-end mb-3">
        <Button onClick={handleResetParams} className="border-black text-black radius-md mr-3">
          Reset
        </Button>
        <Button
          variant="default"
          className=" bg-purple-450 text-white"
          onClick={handleNavigationByRoles}
        >
          Apply Filters
        </Button>
      </div>
      <div className="flex text-gray-400 flex-col gap-4">
        <Accordion defaultValue="roles">
          <Accordion.Item value="roles" className="mb-4 rounded-xl border">
            <Accordion.Control>
              <p className="text-lg">Roles</p>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="mt-2">{renderRoles}</div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Drawer>
  );
};

export default Filter;
