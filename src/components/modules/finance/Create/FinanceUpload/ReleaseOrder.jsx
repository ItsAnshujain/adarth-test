import React, { useEffect } from 'react';
import { useFormContext } from '../../../../../context/formContext';
import TextInput from '../../../../shared/TextInput';

const styles = {
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    letterSpacing: '0.5px',
  },
  input: {
    borderRadius: 0,
    padding: 8,
  },
};

const ReleaseOrder = ({ totalPrice }) => {
  const { errors, setFieldValue } = useFormContext();

  useEffect(() => {
    setFieldValue('total', totalPrice);
  }, [totalPrice]);

  return (
    <>
      <div className="pl-5 pr-7 pt-4 pb-8 border-b">
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            styles={styles}
            label="Release Order No"
            name="releaseOrderNo"
            withAsterisk
            errors={errors}
            placeholder="Write..."
          />
        </div>
      </div>
      <div className="px-5 pt-4 pb-5 border-b">
        <p className="font-bold text-2xl pb-2">To</p>
        <div className="grid grid-cols-2 gap-5">
          <TextInput
            styles={styles}
            label="Company Name"
            name="companyName"
            withAsterisk
            errors={errors}
            placeholder="Write..."
          />
          <TextInput
            styles={styles}
            label="Contact Person"
            name="contactPerson"
            withAsterisk
            errors={errors}
            placeholder="Write..."
          />
        </div>
      </div>

      <div className="px-5 pt-4 pb-5 border-b">
        <p className="font-bold text-2xl pb-2">Supplier</p>
        <div className="grid grid-cols-2  gap-5">
          <TextInput
            styles={styles}
            label="Supplier Name"
            name="supplierName"
            withAsterisk
            placeholder="Write..."
          />
          <TextInput
            styles={styles}
            label="Amount Chargeable"
            name="total"
            placeholder="Write..."
          />
        </div>
      </div>
    </>
  );
};

export default ReleaseOrder;
