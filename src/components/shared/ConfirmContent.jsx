import { Button } from '@mantine/core';
import React from 'react';

const ConfirmContent = ({ onCancel, onConfirm, loading, description, classNames }) => (
  <article className={classNames}>
    {description || (
      <h3 className="mb-6 text-base text-primary">Are you sure you want to delete?</h3>
    )}
    <div className="grid grid-cols-2 gap-3">
      <Button
        className="bg-black text-white rounded-md text-sm px-8 py-3"
        size="md"
        onClick={onCancel}
        disabled={loading}
      >
        No
      </Button>

      <Button className="primary-button" size="md" onClick={onConfirm} loading={loading}>
        Yes
      </Button>
    </div>
  </article>
);

export default ConfirmContent;
