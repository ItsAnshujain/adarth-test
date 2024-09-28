import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Image as MantineImage,
  Radio,
  Text,
} from '@mantine/core';
import { ChevronDown } from 'react-feather';
import { useMemo, useState } from 'react';
import { Dropzone } from '@mantine/dropzone';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import { showNotification } from '@mantine/notifications';
import { useFormContext } from 'react-hook-form';
import { validateImageResolution, serialize, supportedTypes } from '../../../../utils';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import image from '../../../../assets/image.png';
import trash from '../../../../assets/trash.svg';
import { useDeleteUploadedFile, useUploadFile } from '../../../../apis/queries/upload.queries';
import modalConfig from '../../../../utils/modalConfig';
import SelectTermsItem from './SelectTermsItem';
import { useProposalTerms, useProposalTermsById } from '../../../../apis/queries/proposal.queries';
import ViewRte from '../../../shared/rte/ViewRte';
import ControlledTextInput from '../../../shared/FormInputs/Controlled/ControlledTextInput';
import ControlledTextarea from '../../../shared/FormInputs/Controlled/ControlledTextarea';
import ControlledSelect from '../../../shared/FormInputs/Controlled/ControlledSelect';

const nativeSelectStyles = {
  rightSection: { pointerEvents: 'none' },
  label: {
    marginBottom: '4px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
};

const styles = {
  label: {
    marginBottom: '4px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  monthPickerControlActive: { backgroundColor: '#4B0DAF !important' },
  yearPickerControlActive: { backgroundColor: '#4B0DAF !important' },
};

const BasicInfo = ({ proposalId, userData }) => {
  const modals = useModals();
  const form = useFormContext();
  const [activeImage, setActiveImage] = useState();
  const { mutateAsync: upload, isLoading: isUploadLoading } = useUploadFile();
  const { mutateAsync: deleteFile, isLoading: isDeleteLoading } = useDeleteUploadedFile();

  const watchProposalTermsId = form.watch('proposalTermsId');
  const watchLetterFooter = form.watch('letterFooter');
  const watchLetterHead = form.watch('letterHead');
  const watchUploadType = form.watch('uploadType');

  const { data: proposalStatusData, isLoading: isProposalStatusLoading } = useFetchMasters(
    serialize({ type: 'proposal_status', parentId: null, limit: 100, page: 1 }),
  );

  const proposalTermsQuery = useProposalTerms({
    page: 1,
    limit: 20,
    sortBy: 'isGlobal',
    sortOrder: 'desc',
  });
  const proposalTermById = useProposalTermsById(watchProposalTermsId, !!watchProposalTermsId);
  const onHandleDrop = async (params, key) => {
    const isValidResolution = await validateImageResolution(params?.[0], 1350, 80);
    if (!isValidResolution) {
      showNotification({
        title: 'Please upload below the recommended image size',
        color: 'orange',
      });
      return;
    }

    setActiveImage(key);
    const formData = new FormData();
    formData.append('files', params?.[0]);
    const res = await upload(formData);
    form.setValue(key, res?.[0].Location);
  };

  const toggleImagePreviewModal = imgSrc =>
    modals.openContextModal('basic', {
      title: 'Preview',
      innerProps: {
        modalBody: (
          <Box className=" flex justify-center" onClick={id => modals.closeModal(id)}>
            {imgSrc ? (
              <MantineImage src={imgSrc} height={580} width={580} alt="preview" fit="contain" />
            ) : (
              <MantineImage src={null} height={580} width={580} withPlaceholder />
            )}
          </Box>
        ),
      },
      ...modalConfig,
    });

  const handleDeleteImage = async (e, key) => {
    e.stopPropagation();
    form.setValue(key, '');
    if (form.getFieldState(key)) {
      await deleteFile(form.getFieldState(key).split('/').at(-1), {
        onSuccess: () => form.setValue(key, ''),
      });
    }
  };

  const memoizedProposalData = useMemo(() => {
    if (!proposalStatusData?.docs.length) return [];
    const temp = proposalStatusData?.docs?.map(item => ({
      label: item?.name,
      value: item?._id,
    }));

    return temp;
  }, [proposalStatusData?.docs]);

  const memoizedProposalTerms = useMemo(() => {
    if (!proposalTermsQuery.data?.docs?.length) return [{ addMore: true }];
    const temp = proposalTermsQuery.data?.docs?.map(item => ({
      label: item?.name,
      value: item?._id,
    }));

    temp.push({ addMore: true });
    return temp;
  }, [proposalTermsQuery.data?.docs]);

  return (
    <div className="flex gap-4 pt-4 flex-col">
      <Text size="md" weight="bold">
        Basic Information
      </Text>
      <div className="grid grid-cols-2 gap-4">
        <div className="row-span-2">
          <ControlledTextInput
            label="Proposal Name"
            name="name"
            withAsterisk
            styles={styles}
            className="mb-7"
            placeholder="Write..."
          />
          {proposalId ? (
            <ControlledSelect
              label="Status"
              name="status"
              data={memoizedProposalData}
              styles={nativeSelectStyles}
              rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
              rightSectionWidth={40}
              disabled={isProposalStatusLoading}
              className="mb-7"
            />
          ) : null}
        </div>
        <div className="row-span-2">
          <ControlledTextarea
            label="Description"
            name="description"
            styles={styles}
            maxLength={400}
            placeholder="Maximum 400 characters"
            minRows={4}
          />
        </div>
        <div>
          <Radio.Group
            name="uploadType"
            label="Upload existing Letter Header/Footer or add new one for this proposal"
            styles={styles}
            value={watchUploadType || 'new'}
            // {...getInputProps('uploadType')}
          >
            <Group>
              <Radio
                value="existing"
                label="Use from Settings"
                classNames={{
                  label: classNames(
                    !(userData?.proposalHead && userData?.proposalFooter) ? '' : 'text-gray-700',
                    'text-base cursor-pointer',
                  ),
                  radio: 'cursor-pointer',
                }}
                disabled={!userData?.proposalHead && !userData?.proposalFooter}
                onClick={() => form.setValue('uploadType', 'existing')}
              />
              <Radio
                value="new"
                label="Upload"
                classNames={{
                  label: 'text-base text-gray-700 cursor-pointer',
                  radio: 'cursor-pointer',
                }}
                onClick={() => form.setValue('uploadType', 'new')}
              />
            </Group>
          </Radio.Group>

          {watchUploadType === 'existing' ? (
            <section className="flex gap-x-5">
              {userData?.proposalHead ? (
                <div className="flex flex-col">
                  <p className="font-semibold text-lg">Letter Header</p>
                  <MantineImage
                    src={userData.proposalHead || null}
                    alt="letter-head-preview"
                    height={180}
                    width={350}
                    className="bg-slate-100"
                    fit="contain"
                    placeholder={
                      <Text align="center">Unexpected error occured. Image cannot be loaded</Text>
                    }
                  />
                </div>
              ) : null}
              {userData?.proposalFooter ? (
                <div className="flex flex-col">
                  <p className="font-semibold text-lg">Letter Footer</p>
                  <MantineImage
                    src={userData.proposalFooter || null}
                    alt="letter-head-preview"
                    height={180}
                    width={350}
                    className="bg-slate-100"
                    fit="contain"
                    placeholder={
                      <Text align="center">Unexpected error occured. Image cannot be loaded</Text>
                    }
                  />
                </div>
              ) : null}
            </section>
          ) : (
            <section className="flex gap-x-5">
              <div>
                <p className="font-semibold text-lg">Letter Header</p>
                <div className="mb-3">
                  <span className="font-bold text-gray-500 mr-2">Supported types</span>
                  {supportedTypes.map(item => (
                    <Badge key={item} className="mr-2">
                      {item}
                    </Badge>
                  ))}
                  <p className="text-red-450">Recommended Size: Max 1350px x 80px</p>
                </div>
                <div className="flex items-start">
                  {!watchLetterHead ? (
                    <div className="h-[180px] w-[350px] mr-4 mb-2">
                      <Dropzone
                        onDrop={imagePath => onHandleDrop(imagePath, 'letterHead')}
                        accept={['image/png', 'image/jpeg']}
                        className="h-full w-full flex justify-center items-center bg-slate-100"
                        loading={activeImage === 'letterHead' && isUploadLoading}
                        name="letterHead"
                        multiple={false}
                        // {...getInputProps('letterHead')}
                      >
                        <div className="flex items-center justify-center">
                          <MantineImage src={image} alt="placeholder" height={50} width={50} />
                        </div>
                        <p>
                          Drag and Drop your file here, or{' '}
                          <span className="text-purple-450 border-none">browse</span>
                        </p>
                      </Dropzone>
                      {/* {errors?.letterHead ? (
                    <p className="mt-1 text-xs text-red-450">{errors?.letterHead}</p>
                  ) : null} */}
                    </div>
                  ) : null}
                  <Box
                    className="bg-white border rounded-md cursor-zoom-in"
                    onClick={() => toggleImagePreviewModal(watchLetterHead)}
                  >
                    {watchLetterHead ? (
                      <div className="relative">
                        <MantineImage
                          src={watchLetterHead}
                          alt="letter-head-preview"
                          height={180}
                          width={350}
                          className="bg-slate-100"
                          fit="contain"
                          placeholder={
                            <Text align="center">
                              Unexpected error occured. Image cannot be loaded
                            </Text>
                          }
                        />
                        <ActionIcon
                          className="absolute right-2 top-1 bg-white"
                          onClick={e => handleDeleteImage(e, 'letterHead')}
                          loading={activeImage === 'letterHead' && isDeleteLoading}
                          disabled={isDeleteLoading}
                        >
                          <MantineImage src={trash} alt="trash-icon" />
                        </ActionIcon>
                      </div>
                    ) : null}
                  </Box>
                </div>
              </div>

              <div>
                <p className="font-semibold text-lg">Letter Footer</p>
                <div className="mb-3">
                  <span className="font-bold text-gray-500 mr-2">Supported types</span>
                  {supportedTypes.map(item => (
                    <Badge key={item} className="mr-2">
                      {item}
                    </Badge>
                  ))}
                  <p className="text-red-450">Recommended Size: Max 1350px x 80px</p>
                </div>
                <div className="flex items-start">
                  {!watchLetterFooter ? (
                    <div className="h-[180px] w-[350px] mr-4 mb-2">
                      <Dropzone
                        onDrop={imagePath => onHandleDrop(imagePath, 'letterFooter')}
                        accept={['image/png', 'image/jpeg']}
                        className="h-full w-full flex justify-center items-center bg-slate-100"
                        loading={activeImage === 'letterFooter' && isUploadLoading}
                        name="letterFooter"
                        multiple={false}
                        // {...getInputProps('letterFooter')}
                      >
                        <div className="flex items-center justify-center">
                          <MantineImage src={image} alt="placeholder" height={50} width={50} />
                        </div>
                        <p>
                          Drag and Drop your file here, or{' '}
                          <span className="text-purple-450 border-none">browse</span>
                        </p>
                      </Dropzone>
                      {/* {errors?.letterFooter ? (
                    <p className="mt-1 text-xs text-red-450">{errors?.letterFooter}</p>
                  ) : null} */}
                    </div>
                  ) : null}
                  <Box
                    className="bg-white border rounded-md cursor-zoom-in"
                    onClick={() => toggleImagePreviewModal(watchLetterFooter)}
                  >
                    {watchLetterFooter ? (
                      <div className="relative">
                        <MantineImage
                          src={watchLetterFooter}
                          alt="letter-footer-preview"
                          height={180}
                          width={350}
                          className="bg-slate-100"
                          fit="contain"
                          withPlaceholder
                          placeholder={
                            <Text align="center">
                              Unexpected error occured. Image cannot be loaded
                            </Text>
                          }
                        />
                        <ActionIcon
                          className="absolute right-2 top-1 bg-white"
                          onClick={e => handleDeleteImage(e, 'letterFooter')}
                          loading={activeImage === 'letterFooter' && isDeleteLoading}
                          disabled={isDeleteLoading}
                        >
                          <MantineImage src={trash} alt="trash-icon" />
                        </ActionIcon>
                      </div>
                    ) : null}
                  </Box>
                </div>
              </div>
            </section>
          )}
          <section className="grid">
            <Group className="flex flex-col col-span-1 items-start">
              {/* <ControlledSelect
              label="Select Terms and Conditions"
              name="proposalTermsId"
              options={memoizedProposalTerms || []}
              styles={nativeSelectStyles}
              rightSection={<ChevronDown size={16} className="mt-[1px] mr-1" />}
              rightSectionWidth={40}
              className="mb-7 w-full"
              classNames={{ dropdown: 'px-1 py-2' }}
              placeholder="Select Terms and Conditions"
              itemComponent={SelectTermsItem}
              filter={(value, item) =>
                item.label.toLowerCase().includes(value.toLowerCase().trim()) ||
                item.description.toLowerCase().includes(value.toLowerCase().trim())
              }
            /> */}

              <ControlledSelect
                label="Select Terms and Conditions"
                name="proposalTermsId"
                data={memoizedProposalTerms}
                placeholder="Select..."
                rightSection={<ChevronDown size={16} />}
                className="mb-2 w-full"
                classNames={{
                  label: 'text-sm font-bold space-x-2 mb-4',
                  input: 'w-full',
                }}
                itemComponent={SelectTermsItem}
              />

              {watchProposalTermsId ? (
                <section className="py-5">
                  <Text size="md" weight="bold">
                    Terms and Conditions
                  </Text>
                  <p>{proposalTermById?.data?.name}</p>
                  {proposalTermById?.data?.description?.[0] !== '' ? (
                    <ViewRte data={proposalTermById?.data?.description[0] || ''} />
                  ) : null}
                </section>
              ) : null}
            </Group>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
