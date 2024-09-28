import { Chip, Button } from '@mantine/core';
import classNames from 'classnames';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../../../context/formContext';

const initialState = ['Basic Information', 'Select Spaces', 'Cover Image'];

const Header = ({ setFormStep, formStep, handleFormSubmit, disabled, loading }) => {
  const { onSubmit } = useFormContext();
  const navigate = useNavigate();
  const handleCampaigns = () => navigate('/campaigns');
  const handleBack = () => {
    if (formStep === 1) {
      navigate('/campaigns');
    } else {
      setFormStep(formStep - 1);
    }
  };

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <div className="flex gap-6 relative">
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
      <div className="flex gap-4">
        <Button onClick={handleCampaigns} className="border-black radius-md text-black">
          Cancel
        </Button>
        <Button onClick={handleBack} className="bg-black">
          <ChevronLeft className="mr-2 h-4" />
          Back
        </Button>

        <Button
          type="submit"
          onClick={onSubmit(e => handleFormSubmit(e, 'save'))}
          className="bg-purple-450"
          disabled={disabled}
          loading={loading}
        >
          {formStep === 3 ? 'Preview' : formStep === 4 ? 'Save' : 'Next'}
          {formStep < 3 && <ChevronRight className="ml-1 h-4" />}
        </Button>
        {formStep === 4 && (
          <Button
            type="submit"
            onClick={onSubmit(e => handleFormSubmit(e, 'publish'))}
            className="bg-purple-450"
            disabled={disabled}
            loading={loading}
          >
            Save &amp; Publish
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
