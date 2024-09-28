import { Chip, Button } from '@mantine/core';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const initialState = ['Basic Information', 'Order Information', 'Select Spaces'];

const Header = ({ setFormStep, formStep, isLoading, isEditable }) => {
  const form = useFormContext();
  const navigate = useNavigate();
  const handleBooking = () => navigate('/bookings');
  const handleBack = () => {
    if (formStep === 1) {
      navigate('/bookings');
    } else {
      setFormStep(formStep - 1);
    }
  };

  const place = form.getValues('place') || [];

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <div className="flex gap-6 relative">
        {initialState.map((val, index) => (
          <Chip
            className={classNames(
              'relative bg-transparent',
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
      <div className="flex gap-4">
        <Button className="border-black radius-md text-black" onClick={handleBooking}>
          Cancel
        </Button>
        <Button
          onClick={handleBack}
          className="bg-black"
          disabled={isLoading || (formStep === 3 && place.find(item => !item.unit))}
        >
          <ChevronLeft className="mr-2 h-4" />
          Back
        </Button>
        {formStep < 3 ? (
          <Button type="submit" className="bg-purple-450 order-3">
            Next
            <ChevronRight className="ml-1 h-4" />
          </Button>
        ) : null}
        {formStep === 3 ? (
          <Button
            type="submit"
            disabled={isLoading || place.find(item => !item.unit)}
            loading={isLoading}
            className="bg-purple-450 order-3"
          >
            {isLoading ? 'Saving...' : isEditable ? 'Save' : 'Create Order'}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
