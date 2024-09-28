import { Chip, Button } from '@mantine/core';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';

const initialState = ['Basic Information', 'Specifications', 'Location'];

const Header = ({ setFormStep, formStep, isLoading, isSaved }) => {
  const navigate = useNavigate();
  const handleInventory = () => navigate('/inventory');
  const handleBack = () => {
    if (formStep === 1) {
      navigate('/inventory');
    } else {
      setFormStep(formStep - 1);
    }
  };
  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center flex-wrap">
      <div className="flex gap-6 pl-5 relative">
        {initialState.map((val, index) => (
          <Chip
            className={classNames(
              'relative',
              formStep >= 3 &&
                index === 1 &&
                'after:content-[""] after:absolute after:h-[2px] after:w-8 after:top-[50%] after:bg-purple-450 before:content-[""] before:absolute before:h-[2px] before:-left-6 before:w-6 before:top-[50%] before:bg-purple-450',
              formStep === 2 &&
                index === 1 &&
                'before:content-[""] before:absolute before:h-[2px] before:-left-6 before:w-6 before:top-[50%] before:bg-purple-450',
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
                backgroundColor: index + 2 <= formStep ? '#4B0DAF' : 'white',
                color: index + 2 <= formStep ? 'white' : 'black',
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
      <div className="flex gap-4 pr-5 flex-wrap">
        <Button className="border-black radius-md text-black" onClick={handleInventory}>
          Cancel
        </Button>
        {!isSaved ? (
          <Button onClick={handleBack} className="bg-black">
            <ChevronLeft className="mr-2 h-4" />
            Back
          </Button>
        ) : null}

        {formStep < 3 ? (
          <Button type="submit" className="bg-purple-450 order-3" disabled={isLoading}>
            Next
            <ChevronRight className="ml-1 h-4" />
          </Button>
        ) : null}
        {formStep === 3 ? (
          <Button type="submit" className="bg-purple-450 order-3">
            Preview
          </Button>
        ) : null}
        {isSaved ? (
          <Chip checked color="lime" variant="filled" size="lg">
            Saved
          </Chip>
        ) : null}
        {formStep === 4 && !isSaved ? (
          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="bg-purple-450 order-3"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
