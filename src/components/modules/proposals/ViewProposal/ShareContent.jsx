import { Box, Button, Checkbox, Group, Image, Radio } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Mail, Link as LinkIcon, MessageSquare, ChevronDown } from 'react-feather';
import classNames from 'classnames';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { showNotification } from '@mantine/notifications';
import validator from 'validator';
import dayjs from 'dayjs';
import { FormProvider, useForm } from 'react-hook-form';
import { IconCopy } from '@tabler/icons';
import whatsapp from '../../../../assets/whatsapp.svg';
import { useShareProposal } from '../../../../apis/queries/proposal.queries';
import { useShareInventory } from '../../../../apis/queries/inventory.queries';
import { downloadPdf, serialize } from '../../../../utils';
import { OBJECT_FIT_LIST_V2, FILE_TYPE_LIST } from '../../../../utils/constants';
import ControlledTextInput from '../../../shared/FormInputs/Controlled/ControlledTextInput';
import ControlledSelect from '../../../shared/FormInputs/Controlled/ControlledSelect';
import DownloadIcon from '../../../../assets/download-cloud.svg';

const placeHolders = {
  email: 'To: Email Address',
  whatsapp: 'WhatsApp Number',
  message: 'Phone Number',
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
    name: 'Message',
    _id: 'message',
    placeholder: 'Phone Number',
    icon: <MessageSquare className="text-black h-5" />,
  },
  {
    name: 'Copy Link',
    _id: 'copy_link',
    icon: <LinkIcon className="h-4" color="#000" />,
  },
];

const initialEmailValues = {
  format: '',
  shareVia: 'email',
  name: '',
  to: '',
  cc: '',
};

const initialWhatsAppValues = {
  format: '',
  shareVia: 'whatsapp',
  name: '',
  to: '',
};

const initialMessageValues = {
  format: '',
  shareVia: 'message',
  name: '',
  to: '',
};

const initialCopyLinkValues = {
  format: '',
  shareVia: 'copy_link',
  name: '',
};

const downloadExcelFileValues = {
  subject: '',
  clientCompany: '',
};

const emailSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  to: yup.string().trim().required('Email is required'),
});

const whatsAppSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  to: yup
    .string()
    .trim()
    .test('valid', 'Must be a valid number', val => validator.isMobilePhone(val, 'en-IN'))
    .required('WhatsApp number is required'),
});

const messageSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  to: yup
    .string()
    .trim()
    .test('valid', 'Must be a valid number', val => validator.isMobilePhone(val, 'en-IN'))
    .required('Phone number is required'),
});

const copyLinkSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
});

const downloadLinkSchema = yup.object({
  name: yup.string().trim(),
});

const downloadExcelFileSchema = yup.object({
  subject: yup.string().trim().max(300),
  clientCompany: yup.string().trim(),
});

const initialValues = {
  email: initialEmailValues,
  whatsapp: initialWhatsAppValues,
  message: initialMessageValues,
  copy_link: initialCopyLinkValues,
  download_excel_file: downloadExcelFileValues,
};

const schemas = {
  email: emailSchema,
  whatsapp: whatsAppSchema,
  message: messageSchema,
  copy_link: copyLinkSchema,
  download: downloadLinkSchema,
  download_excel_file: downloadExcelFileSchema,
};

const ShareContent = ({
  shareType,
  searchParamQueries,
  id,
  onClose,
  versionTitle,
  mediaOwner = 'media',
}) => {
  const [activeFileType, setActiveFileType] = useState([]);
  const [activeShare, setActiveShare] = useState('');
  const [loaderType, setLoaderType] = useState(-1);

  const form = useForm({
    resolver: activeShare && yupResolver(schemas[activeShare]),
    defaultValues: activeShare && initialValues[activeShare],
  });

  const shareProposal = useShareProposal();
  const shareInventory = useShareInventory();

  const handleActiveFileType = value => {
    let tempArr = [...activeFileType]; // TODO: use immmer
    if (tempArr.some(item => item === value)) {
      tempArr = tempArr.filter(item => item !== value);
      setActiveShare('');
    } else {
      tempArr.push(value);
      if (value === 'Excel') {
        setActiveShare('download_excel_file');
      } else {
        setActiveShare('');
      }
    }
    setActiveFileType(tempArr);
  };

  const handleActiveShare = value => setActiveShare(value);

  const watchAspectRatio = form.watch('aspectRatio');

  const onSubmit = form.handleSubmit(async formData => {
    const data = { ...formData, clientCompanyName: formData.clientCompany || undefined };
    if (!activeFileType.length) {
      showNotification({
        title: 'Please select a file type to continue',
      });
      return;
    }

    data.format = activeFileType.join(',');
    data.shareVia = activeShare;
    data.aspectRatio = 'fill';
    data.templateType = 'generic';

    if (watchAspectRatio) {
      const aspectRatio = watchAspectRatio.split(';')[0];
      const templateType = watchAspectRatio.split(';')[1];
      data.aspectRatio = aspectRatio;
      data.templateType = templateType;
    }

    if (activeShare === 'email' && data.to.includes(',')) {
      let emails = data.to.split(',');
      emails = emails.map(email =>
        email.trim() && validator.isEmail(email.trim()) ? email.trim() : false,
      );
      if (emails.includes(false)) {
        showNotification({
          title: 'Please enter valid email addresses',
          message: 'One of your email address in To is invalid',
        });
        return;
      }
      data.to = emails.join(',');
    } else if (activeShare === 'email' && !validator.isEmail(data.to)) {
      showNotification({
        title: 'Invalid Email in To',
      });

      return;
    }

    if (activeShare === 'email' && data.cc.includes(',')) {
      let emails = data.cc.split(',');
      emails = emails.map(email =>
        email.trim() && validator.isEmail(email.trim()) ? email.trim() : false,
      );
      if (emails.includes(false)) {
        showNotification({
          title: 'Please enter valid email addresses',
          message: 'One of your email address in cc is invalid',
        });
        return;
      }
      data.cc = emails.join(',');
    } else if (activeShare === 'email' && data.cc && !validator.isEmail(data.cc)) {
      showNotification({
        title: 'Invalid Email in cc',
      });

      return;
    }

    if (shareType === 'proposal') {
      const proposalResponse = await shareProposal.mutateAsync(
        { id, queries: serialize({ utcOffset: dayjs().utcOffset() }), data },
        {
          onSuccess: () => {
            setActiveFileType([]);
            if (data.shareVia !== 'copy_link') {
              showNotification({
                title: 'Proposal has been shared successfully',
                color: 'green',
              });
            }

            form.reset();
            setActiveShare('');
            onClose();
          },
        },
      );
      if (activeShare === 'copy_link' && proposalResponse?.link?.messageText) {
        navigator.clipboard.writeText(proposalResponse?.link?.messageText);
        showNotification({
          title: 'Link Copied',
          color: 'blue',
        });
      }
    }

    if (shareType === 'inventory') {
      const params = {};
      searchParamQueries.forEach((value, key) => {
        params[key] = value;
      });

      const inventoryResponse = await shareInventory.mutateAsync(
        { queries: serialize({ ...params, utcOffset: dayjs().utcOffset() }), data },
        {
          onSuccess: () => {
            setActiveFileType([]);
            if (data.shareVia !== 'copy_link') {
              showNotification({
                title: 'Inventories have been shared successfully',
                color: 'green',
              });
            }

            form.reset();
            setActiveShare('');
            onClose();
          },
        },
      );
      if (activeShare === 'copy_link' && inventoryResponse?.proposalShare?.messageText) {
        navigator.clipboard.writeText(inventoryResponse?.proposalShare?.messageText);
        showNotification({
          title: 'Link Copied',
          color: 'blue',
        });
      }
    }
  });

  const handleDownload = form.handleSubmit(async formData => {
    if (!activeFileType.length) {
      showNotification({
        title: 'Please select a file type to continue',
        color: 'yellow',
      });
      return;
    }

    if (activeFileType.length > 1) {
      showNotification({
        title: 'Please select only one file type to continue',
        color: 'yellow',
      });
      return;
    }

    setLoaderType('download');

    const data = {
      name: '',
      to: '',
      format: activeFileType.join(','),
      shareVia: 'copy_link',
      aspectRatio: 'fill',
      templateType: 'generic',
      subject: formData.subject,
      clientCompanyName: formData.clientCompany || undefined,
    };

    if (watchAspectRatio) {
      const aspectRatio = watchAspectRatio.split(';')[0];
      const templateType = watchAspectRatio.split(';')[1];
      data.aspectRatio = aspectRatio;
      data.templateType = templateType;
    }

    if (shareType === 'proposal') {
      const proposalResponse = await shareProposal.mutateAsync(
        { id, queries: serialize({ utcOffset: dayjs().utcOffset() }), data },
        {
          onSuccess: () => {
            setActiveFileType([]);
            onClose();
            setLoaderType(-1);
          },
          onError: () => {
            setLoaderType(-1);
          },
        },
      );
      if (proposalResponse?.link?.[data.format]) {
        downloadPdf(proposalResponse.link[data.format]);
        showNotification({
          title: 'Download successful',
          color: 'green',
        });
      }
    }

    if (shareType === 'inventory') {
      const params = {};
      searchParamQueries.forEach((value, key) => {
        params[key] = value;
      });

      const inventoryResponse = await shareInventory.mutateAsync(
        { queries: serialize({ ...params, page: 1, utcOffset: dayjs().utcOffset() }), data },
        {
          onSuccess: () => {
            setActiveFileType([]);
            onClose();
            setLoaderType(-1);
          },
          onError: () => {
            setLoaderType(-1);
          },
        },
      );
      if (inventoryResponse?.proposalShare?.[data.format]) {
        downloadPdf(inventoryResponse.proposalShare[data.format]);
        showNotification({
          title: 'Download successful',
          color: 'green',
        });
      }
    }
  });

  useEffect(() => {
    form.clearErrors();
    form.setValue('name', '');
    form.setValue('to', '');
  }, [activeShare]);

  useEffect(() => {
    form.setValue(
      'publicLink',
      `${import.meta.env.VITE_APP_BASE_URL}/${mediaOwner}/${versionTitle}`,
    );
  }, [versionTitle, mediaOwner]);

  const copyPublicLink = () => {
    const watchClientCompanyName = form.watch('publicClientCompanyName');
    if (!watchClientCompanyName) {
      showNotification({
        message: 'Client company name is required',
      });
      return;
    }
    navigator.clipboard.writeText(
      new URL(
        `${
          import.meta.env.VITE_APP_BASE_URL
        }/${mediaOwner}/${versionTitle}/${watchClientCompanyName}?template=${
          form.getValues('aspectRatio') || 'fill;generic'
        }`,
      ),
    );
    showNotification({
      title: 'Public link copied!',
      color: 'green',
    });
  };

  return (
    <Box className="flex flex-col px-7">
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <div>
            <p className="font-medium text-lg mb-2">Select a template</p>
            <ControlledSelect
              name="aspectRatio"
              data={OBJECT_FIT_LIST_V2}
              placeholder="Select..."
              rightSection={<ChevronDown size={16} />}
              className="mb-2"
              defaultValue="fill;generic"
            />
          </div>

          {shareType === 'proposal' ? (
            <>
              <div>
                <p className="font-medium text-lg mb-2">Copy public link</p>

                <div className="flex items-center gap-2">
                  <ControlledTextInput name="publicLink" readonly className="w-3/4" disabled />
                  /
                  <ControlledTextInput
                    name="publicClientCompanyName"
                    className="w-1/4"
                    placeholder="Client company name"
                    title="Client company name"
                  />
                </div>
                <Button
                  className="primary-button font-medium text-base mt-3 w-full"
                  onClick={copyPublicLink}
                  leftIcon={<IconCopy size={24} />}
                  size="xs"
                >
                  Copy public link
                </Button>
              </div>
              <div className="text-center mt-2">OR</div>
            </>
          ) : null}

          <div>
            <p className="font-medium text-xl mb-3">Select file type:</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {FILE_TYPE_LIST.map(item => (
                <Checkbox
                  key={uuidv4()}
                  onChange={event => handleActiveFileType(event.target.value)}
                  label={item.name}
                  defaultValue={item._id}
                  className="font-medium"
                  checked={activeFileType.includes(item._id)}
                />
              ))}
            </div>
          </div>
          {activeFileType.some(fileType => fileType === 'Excel') ? (
            <>
              <div>
                <p className="font-medium text-lg mb-2">Subject</p>
                <ControlledTextInput name="subject" placeholder="Enter..." className="mb-2" />
              </div>
              <div>
                <p className="font-medium text-lg mb-2">Client company name</p>
                <ControlledTextInput name="clientCompany" placeholder="Enter..." className="mb-2" />
              </div>
            </>
          ) : null}

          <Button
            className="primary-button font-medium text-base mt-2 w-full"
            onClick={handleDownload}
            loading={loaderType === 'download'}
            disabled={shareProposal.isLoading || shareInventory.isLoading}
            leftIcon={
              <Image src={DownloadIcon} alt="download" height={24} width={24} fit="contain" />
            }
            type="submit"
            size="xs"
          >
            Download
          </Button>
          <p className="mt-2 text-sm text-red-450">
            *You can choose only one file format when downloading
          </p>
          <div className="mt-5">
            <p className="font-medium text-xl mb-2">Share via:</p>
            <Group className="grid grid-cols-2">
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
                  <ControlledTextInput
                    name="name"
                    placeholder="Name"
                    maxLength={200}
                    className="mb-2"
                  />
                  {activeShare !== 'copy_link' ? (
                    <ControlledTextInput
                      name="to"
                      placeholder={placeHolders[activeShare]}
                      maxLength={200}
                      className="mb-2"
                    />
                  ) : null}
                  {activeShare === 'email' ? (
                    <ControlledTextInput
                      name="cc"
                      placeholder="Cc: Email Address"
                      maxLength={200}
                    />
                  ) : null}
                  {activeShare === 'email' ? (
                    <p className="mt-2 text-sm">
                      Note: For multiple emails, please separate with a comma
                    </p>
                  ) : null}
                  <Button
                    className="secondary-button font-medium text-base mt-2 w-full"
                    type="submit"
                    loading={
                      loaderType !== 'download' &&
                      (shareProposal.isLoading || shareInventory.isLoading)
                    }
                    disabled={shareProposal.isLoading || shareInventory.isLoading}
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
