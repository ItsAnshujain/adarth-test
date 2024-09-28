import { Chip, Button } from '@mantine/core';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const initialState = ['Basic Information', 'Specifications'];

const Header = ({ setFormStep, formStep, isProposalLoading, proposalId }) => {
  const { values } = useFormContext();
  const navigate = useNavigate();
  const handleBack = () => {
    if (formStep === 1) {
      if (proposalId) {
        navigate(`/proposals/view-details/${proposalId}`, { replace: true });
      } else {
        navigate('/proposals');
      }
    } else {
      setFormStep(formStep - 1);
    }
  };
  const handleHome = () => navigate('/proposals');

  return (
    <div className="h-20 border-gray-450 flex justify-between items-center w-full">
      <div className="flex gap-6 relative">
        {initialState.map((val, index) => (
          <Chip
            className={classNames(
              'relative bg-transparent',
              formStep > 1 &&
                index === 0 &&
                'after:content-[""] after:absolute after:h-[2px] after:w-8 after:top-[50%] after:bg-purple-450',
            )}
            key={val}
            styles={() => ({
              checkIcon: {
                position: 'absolute',
                top: '6px',
                padding: '2px',
                height: '20px',
                width: '20px',
                borderRadius: '100px',
                backgroundColor: index + 1 <= formStep ? '#4B0DAF' : 'white',
                color: index + 1 <= formStep ? 'white' : 'black',
              },
              label: { cursor: 'default' },
            })}
            checked
            variant="filled"
            color="gray"
            radius="xs"
            size="md"
            classNames={{ label: 'bg-transparent' }}
          >
            <span className={classNames(index + 1 <= formStep ? 'text-purple-450' : 'text-black')}>
              {val}
            </span>
          </Chip>
        ))}
      </div>

      <div className="flex gap-4">
        <Button onClick={handleHome} className="border-black text-black radius-md">
          Cancel
        </Button>
        <Button
          onClick={handleBack}
          className="bg-black"
          disabled={isProposalLoading || values?.spaces.find(item => !item.unit)}
        >
          <ChevronLeft className="mr-2 h-4" />
          Back
        </Button>
        {formStep === 1 ? (
          <Button type="submit" className="bg-purple-450 order-3">
            Next
            <ChevronRight className="ml-1 h-4" />
          </Button>
        ) : null}
        {formStep === 2 ? (
          <Button
            type="submit"
            className="bg-purple-450 order-3"
            disabled={isProposalLoading || values?.spaces.find(item => !item.unit)}
            loading={isProposalLoading}
          >
            {isProposalLoading ? 'Saving...' : 'Save'}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
