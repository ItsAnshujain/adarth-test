import React, { useEffect } from 'react';
import { useFormContext } from '../../../../../context/formContext';
import NumberInput from '../../../../shared/NumberInput';
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

const PurchaseOrder = ({ totalPrice }) => {
  const { errors, setFieldValue } = useFormContext();

  useEffect(() => {
    setFieldValue('total', totalPrice);
  }, [totalPrice]);

  return (
    <>
      <div className="px-5 pt-4 pb-5 border-b">
        <p className="font-bold text-2xl pb-2">Invoice To</p>
        <div className="grid grid-cols-2 gap-5">
          <TextInput
            styles={styles}
            label="Company Name"
            name="supplierName"
            withAsterisk
            errors={errors}
            placeholder="Write..."
          />
          <NumberInput
            styles={styles}
            label="Voucher No"
            name="invoiceNo"
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
            name="buyerName"
            withAsterisk
            errors={errors}
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

export default PurchaseOrder;
