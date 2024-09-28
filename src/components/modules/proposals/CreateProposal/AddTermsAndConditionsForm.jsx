import { ActionIcon, Box, Button, Group, Input, TextInput } from '@mantine/core';
import React, { useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { showNotification } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import * as he from 'he';
import { IconTrash, IconX } from '@tabler/icons';

import ControlledTextInput from '../../../shared/FormInputs/Controlled/ControlledTextInput';
import {
  useCreateProposalTerms,
  useUpdateProposalTerms,
} from '../../../../apis/queries/proposal.queries';
import RichTextEditorComponent from '../../../shared/rte/RichTextEditorComponent';
import htmlConverter from '../../../../utils/htmlConverter';

const schema = yup.object({
  name: yup.string().required('Title is required'),
  description: yup.mixed(),
  descriptionHtml: yup.mixed(),
});

const AddTermsAndConditionsForm = ({
  onClose,
  termsAndConditionData,
  mode = 'Add',
  onSuccess = () => {},
  toggleDelete = () => {},
}) => {
  const queryClient = useQueryClient();
  const form = useForm({ resolver: yupResolver(schema) });
  const editorRef = useRef();
  const createProposalTerms = useCreateProposalTerms();
  const updateProposalTerms = useUpdateProposalTerms();

  const onSubmit = form.handleSubmit(async formData => {
    const data = { ...formData };

    if (data.description) {
      if (editorRef.current !== null) {
        const latestEditorState = editorRef.current.parseEditorState(data.description);
        editorRef.current.setEditorState(latestEditorState);
        const parsedHtml = htmlConverter(editorRef.current);
        data.descriptionHtml = he.encode(parsedHtml);
      }
    }

    if (termsAndConditionData?._id) {
      updateProposalTerms.mutate(
        { id: termsAndConditionData?._id, ...data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['proposal-terms']);
            showNotification({
              title: 'Terms & Conditions updated successfully',
              color: 'green',
            });
            onClose();
          },
        },
      );
    } else {
      createProposalTerms.mutate(data, {
        onSuccess: () => {
          queryClient.invalidateQueries(['proposal-terms']);
          showNotification({
            title: 'Terms & Conditions added successfully',
            color: 'green',
          });
          onClose();
          onSuccess();
        },
      });
    }
  });

  useEffect(() => {
    if (termsAndConditionData?.name) {
      form.reset({
        name: termsAndConditionData?.name,
        description: termsAndConditionData?.description?.[0],
      });
    }
  }, [termsAndConditionData]);

  return (
    <Box className="border-t p-2">
      <div className="w-full flex justify-between px-3 pt-4">
        <div className="font-bold text-xl">{mode === 'Add' ? 'Add ' : ''}Terms & Conditions</div>
        {mode === 'Edit' ? (
          <div className="flex gap-2">
            <ActionIcon onClick={toggleDelete}>
              <IconTrash size={20} />
            </ActionIcon>

            <ActionIcon onClick={onClose}>
              <IconX size={20} />
            </ActionIcon>
          </div>
        ) : (
          <ActionIcon onClick={onClose}>
            <IconX size={20} />
          </ActionIcon>
        )}
      </div>
      <FormProvider {...form}>
        <form className="px-3 pt-3" onSubmit={onSubmit}>
          <ControlledTextInput
            label="Title"
            name="name"
            withAsterisk
            placeholder="Write..."
            maxLength={200}
            className="mb-4"
            classNames={{ label: 'font-bold' }}
          />
          <section className="mb-4">
            <p className="font-medium text-black">Description</p>
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <RichTextEditorComponent
                  {...field}
                  lexicalJson=""
                  onChange={value => field.onChange(value)}
                  defaultValue={
                    !form.getFieldState('description').isDirty
                      ? JSON.stringify(form.getValues('description'))
                      : undefined
                  }
                  error={form.formState.errors.description?.message}
                  title="Description"
                  placeholder="Write..."
                  ref={editorRef}
                />
              )}
            />
          </section>
          

          <Group position="right">
            <Button
              className="dark-button"
              onClick={onClose}
              disabled={createProposalTerms.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="primary-button"
              loading={createProposalTerms.isLoading || updateProposalTerms.isLoading}
            >
              {mode === 'Add' ? 'Add' : 'Save'}
            </Button>
          </Group>
        </form>
      </FormProvider>
    </Box>
  );
};

export default AddTermsAndConditionsForm;
