import { formLabelStyles } from '../../../../utils';
import ControlledTextInput from '../../../shared/FormInputs/Controlled/ControlledTextInput';

const BasicInformationForm = () => (
  <div className="mt-4">
    <p className="text-xl font-bold">Basic Information</p>
    <article className="grid grid-cols-2 gap-8 mt-4">
      <section className="flex flex-col gap-4">
        <ControlledTextInput
          label="Company Name"
          name="client.companyName"
          withAsterisk
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
        <ControlledTextInput
          label="Client Email"
          name="client.email"
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
        <ControlledTextInput
          label="Client Pan Number"
          name="client.panNumber"
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
        <ControlledTextInput
          label="Brand Display Name"
          name="displayBrands"
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
      </section>

      <section className="flex flex-col gap-4">
        <ControlledTextInput
          label="Client Name"
          name="client.name"
          withAsterisk
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
        <ControlledTextInput
          label="Client Contact Number"
          name="client.contactNumber"
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
        <ControlledTextInput
          label="Client GST Number"
          name="client.gstNumber"
          placeholder="Write..."
          maxLength={200}
          classNames={formLabelStyles}
        />
      </section>
    </article>
  </div>
);

export default BasicInformationForm;
