import { Button } from '@mantine/core';
import classNames from 'classnames';

const Header = ({ tabs, setTabs }) => (
  <div className="h-[70px] border-b border-gray-450 flex items-center overflow-x-auto">
    <div className="flex pl-5 gap-6 items-center">
      <Button
        onClick={() => setTabs(0)}
        className={classNames(
          tabs === 0
            ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
            : 'text-black',
          'font-medium tracking-wide px-0',
        )}
      >
        Notification Settings
      </Button>
      <Button
        onClick={() => setTabs(1)}
        className={classNames(
          tabs === 1
            ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
            : 'text-black',
          'font-medium tracking-wide',
        )}
      >
        Change Password
      </Button>
      <Button
        onClick={() => setTabs(2)}
        className={classNames(
          tabs === 2
            ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
            : 'text-black',
          'font-medium tracking-wide px-0',
        )}
      >
        Upload Signature & Stamp
      </Button>
      <Button
        onClick={() => setTabs(3)}
        className={classNames(
          tabs === 3
            ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
            : 'text-black',
          'font-medium tracking-wide px-0',
        )}
      >
        SMTP Setup
      </Button>
      <Button
        onClick={() => setTabs(4)}
        className={classNames(
          tabs === 4
            ? 'text-purple-450 after:content[""] after:block after:w-full after:h-0.5 after:relative after:top-3  after:bg-purple-450'
            : 'text-black',
          'font-medium tracking-wide px-0',
        )}
      >
        Delete Account
      </Button>
    </div>
  </div>
);

export default Header;
