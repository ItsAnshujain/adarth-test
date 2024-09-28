import { Button } from '@mantine/core';
import { ChevronLeft } from 'react-feather';
import { useNavigate } from 'react-router-dom';

const Header = ({ isLoading, disabled, type }) => {
  const navigate = useNavigate();
  const handleBack = () => navigate('/users');

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <div className="flex justify-end gap-4 pr-7 w-full">
        <Button className="bg-black" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4" />
          Back
        </Button>
        <Button
          type="submit"
          className="bg-purple-450 order-3"
          loading={isLoading}
          disabled={disabled}
        >
          {type === 'Team' ? 'Send Invite Link' : 'Add Peer'}
        </Button>
      </div>
    </div>
  );
};

export default Header;
