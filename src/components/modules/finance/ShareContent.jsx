import { Box, Button, Group, Image, Radio } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mail, Link as LinkIcon } from 'react-feather';
import classNames from 'classnames';
import * as yup from 'yup';
import { yupResolver } from '@mantine/form';
import validator from 'validator';
import { showNotification } from '@mantine/notifications';
import whatsapp from '../../../assets/whatsapp.svg';
import { FormProvider, useForm } from '../../../context/formContext';
import TextInput from '../../shared/TextInput';
import { useShareRecord } from '../../../apis/queries/finance.queries';

const placeHolders = {
  email: 'Email Address',
  whatsapp: 'WhatsApp Number',
};

const sendVia = [
  {
    name: 'Email',
    _id: 'email',
    placeholder: 'Email Address',
    icon: <Mail className="text-black h-5" />,
  },
  {
    name: 'WhatsApp',
    _id: 'whatsapp',
    placeholder: 'WhatsApp Number',
    icon: <Image src={whatsapp} alt="whatsapp" />,
  },
  {
    name: 'Copy Link',
    _id: 'copy_link',
    icon: <LinkIcon className="h-4" color="#000" />,
  },
];

const initialEmailValues = {
  shareVia: 'email',
  name: '',
  to: '',
};

const initialWhatsAppValues = {
  shareVia: 'whatsapp',
  name: '',
  to: '',
};

const initialCopyLinkValues = {
  shareVia: 'copy_link',
  name: '',
};

const emailSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  to: yup.string().trim().required('Email is required').email('Email must be valid'),
});

const whatsAppSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  to: yup
    .string()
    .trim()
    .test('valid', 'Must be a valid number', val => validator.isMobilePhone(val, 'en-IN'))
    .required('WhatsApp number is required'),
});

const copyLinkSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
});

const initialValues = {
  email: initialEmailValues,
  whatsapp: initialWhatsAppValues,
  copy_link: initialCopyLinkValues,
};

const schemas = {
  email: emailSchema,
  whatsapp: whatsAppSchema,
  copy_link: copyLinkSchema,
};

const ShareContent = ({ id }) => {
  const [activeShare, setActiveShare] = useState('');
  const form = useForm({
    validate: yupResolver(schemas[activeShare]),
    initialValues: initialValues[activeShare],
  });

  const { mutateAsync: share, isLoading: isShareProposalLoading } = useShareRecord();

  const handleActiveShare = value => {
    setActiveShare(value);
  };

  const handleSubmit = async formData => {
    const data = { ...formData };

    data.shareVia = activeShare;

    const res = await share(
      { id, data },
      {
        onSuccess: () => {
          if (data.shareVia !== 'copy_link') {
            showNotification({
              title: 'Record has been shared successfully',
              color: 'green',
            });
          }
          form.setFieldValue('name', '');
          form.setFieldValue('to', '');
        },
      },
    );
    if (activeShare === 'copy_link' && res?.messageText) {
      navigator.clipboard.writeText(res?.messageText);
      showNotification({
        title: 'Link Copied',
        color: 'blue',
      });
    }
  };

  useEffect(() => {
    form.clearErrors();
    form.setFieldValue('name', '');
    form.setFieldValue('to', '');
  }, [activeShare]);

  return (
    <Box className="flex flex-col px-7">
      <FormProvider form={form}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <div className="my-2 ">
            <Group className="grid grid-cols-2 ">
              <div>
                {sendVia.map(item => (
                  <Group
                    className={classNames(
                      activeShare === item._id && 'bg-gray-100',
                      'col-span-1 grid grid-cols-2 items-start',
                    )}
                    key={uuidv4()}
                  >
                    <Radio
                      onChange={event => handleActiveShare(event.target.value)}
                      label={item.name}
                      defaultValue={item._id}
                      checked={activeShare === item._id}
                      className="font-medium my-2"
                      size="md"
                    />
                  </Group>
                ))}
              </div>
              {activeShare !== '' && (
                <div>
                  <TextInput name="name" placeholder="Name" className="mb-2" errors={form.errors} />
                  {activeShare !== 'copy_link' ? (
                    <TextInput
                      name="to"
                      placeholder={placeHolders[activeShare]}
                      errors={form.errors}
                    />
                  ) : null}
                  <Button
                    className="secondary-button font-medium text-base mt-2 w-full"
                    type="submit"
                    loading={isShareProposalLoading}
                    disabled={isShareProposalLoading}
                  >
                    {activeShare === 'copy_link' ? 'Copy' : 'Send'}
                  </Button>
                </div>
              )}
            </Group>
          </div>
        </form>
      </FormProvider>
    </Box>
  );
};

export default ShareContent;
