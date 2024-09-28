import { Button } from '@mantine/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../../../context/formContext';
import { orderTitle } from '../../../../utils';

const FormHeader = ({
  type,
  isGeneratePurchaseOrderLoading,
  isGenerateReleaseOrderLoading,
  isGenerateInvoiceLoading,
  isGenerateManualPurchaseOrderLoading,
  isGenerateManualReleaseOrderLoading,
  isGenerateManualInvoiceLoading,
  handleFormSubmit = () => {},
}) => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);
  const { onSubmit } = useFormContext();

  const handleError = errors => {
    const currentField = Object.keys(errors).map(k => k)?.[0];
    if (currentField) {
      const element = document.getElementById(currentField);
      if (element) {
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <header className="h-[60px] border-b flex items-center justify-between sticky top-0 z-50 bg-white">
      <p className="font-bold text-lg">{`Create ${orderTitle[type]}`}</p>
      <div className="flex gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={
            isGeneratePurchaseOrderLoading ||
            isGenerateReleaseOrderLoading ||
            isGenerateInvoiceLoading ||
            isGenerateManualPurchaseOrderLoading ||
            isGenerateManualReleaseOrderLoading ||
            isGenerateManualInvoiceLoading
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          onClick={onSubmit(
            e => handleFormSubmit(e, 'preview'),
            error => handleError(error),
          )}
          className="primary-button"
          variant="filled"
          disabled={
            isGeneratePurchaseOrderLoading ||
            isGenerateReleaseOrderLoading ||
            isGenerateInvoiceLoading ||
            isGenerateManualPurchaseOrderLoading ||
            isGenerateManualReleaseOrderLoading ||
            isGenerateManualInvoiceLoading
          }
        >
          Create
        </Button>
      </div>
    </header>
  );
};

export default FormHeader;
