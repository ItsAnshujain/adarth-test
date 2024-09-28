import { Stepper } from '@mantine/core';
import classNames from 'classnames';

const ViewLeadStepper = ({ activeStep }) => (
  <Stepper
    className="py-5 pl-5 leadStepper"
    classNames={{
      separator: 'hidden',
      steps: 'gap-0',
      stepIcon: 'hidden',
    }}
  >
    <div className="flex w-full h-10">
      <div className="flex w-full bg-gray-400">
        <Stepper.Step
          label="Initiate Discussion"
          className={classNames(
            'w-full stepperItem',
            activeStep === 'initiateDiscussion' ||
              activeStep === 'inProgress' ||
              activeStep === 'converted' ||
              activeStep === 'lost'
              ? ' text-white bg-orange-350'
              : 'bg-gray-200 text-gray-400',
          )}
          classNames={{ stepWrapper: 'hidden' }}
        />
        <Stepper.Step
          label="In Progress"
          className={classNames(
            'w-full pl-4 stepperItem',
            activeStep === 'inProgress' || activeStep === 'converted' || activeStep === 'lost'
              ? ' text-white bg-purple-350'
              : 'bg-gray-200 text-gray-400',
          )}
          classNames={{ stepWrapper: 'hidden' }}
        />

        <Stepper.Step
          label="Converted"
          className={classNames(
            'w-full pl-4 stepperItem',
            activeStep === 'converted' || activeStep === 'lost'
              ? ' text-white bg-green-350'
              : 'bg-gray-200 text-gray-400',
          )}
          classNames={{ stepWrapper: 'hidden' }}
        />
      </div>
      <Stepper.Step
        label="Lost"
        className={classNames(
          'w-64 p-2 pl-4 stepperItem',
          activeStep === 'lost' ? ' text-white bg-red-350' : 'bg-gray-200 text-gray-400',
        )}
        classNames={{ stepWrapper: 'hidden' }}
      />
    </div>
  </Stepper>
);

export default ViewLeadStepper;
