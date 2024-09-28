import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { yupResolver } from '@mantine/form';
import * as yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import BasicInformationForm from '../../components/modules/inventory/CreateSpace/BasicInformationForm';
import SpecificationForm from '../../components/modules/inventory/CreateSpace/SpecificationForm';
import LocationForm from '../../components/modules/inventory/CreateSpace/LocationForm';
import SuccessModal from '../../components/shared/Modal';
import Preview from '../../components/shared/Preview';
import PreviewLocation from '../../components/modules/inventory/CreateSpace/PreviewLocation';
import Header from '../../components/modules/inventory/CreateSpace/Header';
import { FormProvider, useForm } from '../../context/formContext';
import {
  useCreateInventory,
  useFetchInventoryById,
  useUpdateInventory,
} from '../../apis/queries/inventory.queries';

const initialValues = {
  basicInformation: {
    spaceName: '',
    landlord: '',
    mediaOwner: { label: '', value: '' },
    category: { label: '', value: '' },
    subCategory: { label: '', value: '' },
    spaceType: { label: '', value: '' },
    mediaType: { label: '', value: '' },
    description: '',
    spacePhoto: '',
    otherPhotos: [],
    demographic: { label: '', value: '' },
    audience: [],
  },
  specifications: {
    illuminations: { label: '', value: '' },
    resolutions: '',
    size: [
      {
        height: 0,
        width: 0,
        key: uuidv4(),
      },
    ],
    previousBrands: [],
    tags: [],
    additionalTags: [],
  },
  location: {
    latitude: '',
    longitude: '',
    address: '',
    city: '',
    state: '',
    zone: { label: '', value: '' },
    landmark: '',
    facing: { label: '', value: '' },
    tier: { label: '', value: '' },
  },
};

const basicInformationSchema = yup.object({
  basicInformation: yup.object({
    spaceName: yup.string().trim().required('Space name is required'),
    landlord: yup.string().trim(),
    mediaOwner: yup.object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    }),
    peerMediaOwner: yup.string().trim(),
    spaceType: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('spaceType', 'Space Type is required', obj => obj.value !== ''),
    category: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('category', 'Category is required', obj => obj.value !== ''),
    subCategory: yup.object({
      label: yup.string().trim(),
      value: yup.string().trim(),
    }),
    mediaType: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('mediaType', 'Media Type is required', obj => obj.value !== ''),
    description: yup.string().trim(),
    price: yup
      .number()
      .typeError('Price must be a number')
      .positive('Price must be a positive number'),
    spacePhoto: yup.string().trim(),
    otherPhotos: yup.array().of(yup.string().trim()),
    footFall: yup
      .number()
      .positive('FootFall must be a positive number')
      .typeError('FootFall must be a number')
      .nullable(),
    demographic: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('demographic', 'Demographics is required', obj => obj.value !== ''),
    audience: yup.array().of(yup.object({ label: yup.string(), value: yup.string() })),
    longShot: yup.string().trim(),
    closeShot: yup.string().trim(),
  }),
});

const specificationsValues = yup.object({
  specifications: yup.object({
    illuminations: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('illuminations', 'Illumination is required', obj => obj.value !== ''),
    unit: yup
      .number()
      .positive('Unit must be a positive number')
      .typeError('Unit must be a number')
      .required('Unit is required'),
    resolutions: yup.string().trim(),
    size: yup.array(),
    previousBrands: yup.array().of(yup.object({ label: yup.string(), value: yup.string() })),
    tags: yup.array().of(yup.object({ label: yup.string(), value: yup.string() })),
    additionalTags: yup.array(),
  }),
});

const locationValues = yup.object({
  location: yup.object({
    latitude: yup.number().typeError('Latitude must be a number').nullable(),
    longitude: yup.number().typeError('Longitude must be a number').nullable(),
    address: yup.string().trim(),
    city: yup.string().trim().required('City is required'),
    state: yup.string().trim().required('State is required'),
    zip: yup.string().trim().required('Zip is required'),
    zone: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('zone', 'Zone is required', obj => obj.value !== ''),
    landmark: yup.string().trim(),
    facing: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('facing', 'Facing is required', obj => obj.value !== ''),
    tier: yup
      .object({
        label: yup.string().trim(),
        value: yup.string().trim(),
      })
      .test('tier', 'Tier is required', obj => obj.value !== ''),
    faciaTowards: yup.string().trim(),
  }),
});

const schemas = [basicInformationSchema, specificationsValues, locationValues, yup.object()];

const CreateInventoryPage = () => {
  const navigate = useNavigate();
  const { id: inventoryId } = useParams();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const form = useForm({
    validate: yupResolver(schemas[formStep - 1]),
    initialValues,
  });
  const { mutate: create, isLoading, isSuccess: isCreateSuccess } = useCreateInventory();
  const {
    mutate: update,
    isLoading: isUpdateInventoryLoading,
    isSuccess: isEditSuccess,
  } = useUpdateInventory();
  const {
    data: inventoryDetails,
    status,
    fetchStatus,
  } = useFetchInventoryById(inventoryId, !!inventoryId);

  const getForm = () =>
    formStep === 1 ? (
      <BasicInformationForm basicInformation={inventoryDetails?.inventory?.basicInformation} />
    ) : formStep === 2 ? (
      <SpecificationForm />
    ) : formStep === 3 ? (
      <LocationForm />
    ) : formStep === 4 ? (
      <>
        <Preview />
        <PreviewLocation />
      </>
    ) : null;

  const onSubmitInventoryForm = formData => {
    const data = {
      ...formData,
      basicInformation: {
        ...formData.basicInformation,
        mediaOwner: formData?.basicInformation?.mediaOwner?.value,
        audience: formData?.basicInformation?.audience?.map(item => item?.value),
        category: formData?.basicInformation?.category?.value,
        demographic: formData?.basicInformation?.demographic?.value,
        mediaType: formData?.basicInformation?.mediaType?.value,
        spaceType: formData?.basicInformation?.spaceType?.value,
        subCategory: formData?.basicInformation?.subCategory?.value,
        otherPhotos: formData.basicInformation?.otherPhotos?.map(item => item.trim()),
      },
      specifications: {
        ...formData.specifications,
        illuminations: formData?.specifications?.illuminations?.value,
        previousBrands: formData?.specifications?.previousBrands?.map(item => item?.value),
        tags: formData?.specifications?.tags?.map(item => item?.value),
        size: formData?.specifications?.size?.map(item => ({
          height: item?.height,
          width: item?.width,
        })),
      },
      location: {
        ...formData.location,
        zone: formData?.location?.zone?.value,
        facing: formData?.location?.facing?.value,
        tier: formData?.location?.tier?.value,
      },
      company: formData?.basicInformation?.mediaOwner?.label,
    };

    setFormStep(prevState => prevState + 1);
    if (formStep === 4) {
      setFormStep(4);
      Object.keys(data.basicInformation).forEach(key => {
        if (data.basicInformation[key] === '' || data.basicInformation[key]?.[0] === '') {
          delete data.basicInformation[key];
        }
      });
      Object.keys(data.specifications).forEach(key => {
        if (data.specifications[key] === '') {
          delete data.specifications[key];
        }
      });
      Object.keys(data.location).forEach(key => {
        if (data.location[key] === '') {
          delete data.location[key];
        }
      });

      if (inventoryId) {
        update(
          { inventoryId, data },
          { onSuccess: () => setTimeout(() => navigate('/inventory'), 2000) },
        );
      } else {
        create(data, { onSuccess: () => setTimeout(() => navigate('/inventory'), 2000) });
      }
    }
  };

  useEffect(() => {
    if (inventoryDetails?.inventory) {
      const { basicInformation, specifications, location } = inventoryDetails.inventory;

      const arrOfAudience = basicInformation?.audience?.map(item => ({
        label: item?.name,
        value: item?._id,
      }));
      const arrOfPreviousBrands = specifications?.previousBrands?.map(item => ({
        label: item?.name,
        value: item?._id,
      }));
      const arrOfTags = specifications?.tags?.map(item => ({
        label: item?.name,
        value: item?._id,
      }));
      form.setValues({
        basicInformation: {
          spaceName: basicInformation?.spaceName || '',
          landlord: basicInformation?.landlord || '',
          mediaOwner: {
            label: basicInformation?.mediaOwner?.name || '',
            value: basicInformation?.mediaOwner?._id || '',
          },
          peerMediaOwner: basicInformation?.peerMediaOwner || undefined,
          description: basicInformation?.description || '',
          footFall: basicInformation?.footFall
            ? parseInt(basicInformation.footFall, 10)
            : undefined,
          price: basicInformation?.price ? parseInt(basicInformation?.price, 10) : undefined,
          category: {
            label: basicInformation?.category?.name || '',
            value: basicInformation?.category?._id || '',
          },
          subCategory: {
            label: basicInformation?.category ? basicInformation?.subCategory?.name : '',
            value: basicInformation?.category ? basicInformation?.subCategory?._id : '',
          },
          spaceType: {
            label: basicInformation?.spaceType?.name || '',
            value: basicInformation?.spaceType?._id || '',
          },
          mediaType: {
            label: basicInformation?.mediaType?.name || '',
            value: basicInformation?.mediaType?._id || '',
          },
          demographic: {
            label: basicInformation?.demographic?.name || '',
            value: basicInformation?.demographic?._id || '',
          },
          audience: arrOfAudience || [],
          spacePhoto: basicInformation?.spacePhoto || '',
          otherPhotos: basicInformation?.otherPhotos || [],
          longShot: basicInformation?.longShot || undefined,
          closeShot: basicInformation?.closeShot || undefined,
        },
        specifications: {
          illuminations: {
            label: specifications?.illuminations?.name || '',
            value: specifications?.illuminations?._id || '',
          },
          unit: specifications?.unit ? parseInt(specifications.unit, 10) : '',
          resolutions: specifications?.resolutions || '',
          size: Array.isArray(specifications?.size)
            ? specifications?.size?.map(item => ({
                height: item?.height ? parseInt(item.height, 10) : 0,
                width: item?.width ? parseInt(item.width, 10) : 0,
              }))
            : [{ height: 0, width: 0, key: uuidv4() }],
          previousBrands: arrOfPreviousBrands?.length ? arrOfPreviousBrands : [],
          tags: arrOfTags?.length ? arrOfTags : [],
          additionalTags: specifications?.additionalTags || [],
        },
        location: {
          latitude: location?.latitude ? parseFloat(location.latitude, 10) : '',
          longitude: location?.longitude ? parseFloat(location.longitude) : '',
          address: location?.address || '',
          city: location?.city || '',
          state: location?.state || '',
          zip: location?.zip ? location.zip : undefined,
          zone: {
            label: location?.zone?.name || '',
            value: location?.zone?._id || '',
          },
          landmark: location?.landmark || '',
          facing: {
            label: location?.facing?.name || '',
            value: location?.facing?._id || '',
          },
          tier: { label: location?.tier || '', value: location?.tier || '' },
          faciaTowards: location?.faciaTowards || undefined,
        },
      });
    }
  }, [inventoryDetails?.inventory]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <FormProvider form={form}>
        <form onSubmit={form.onSubmit(onSubmitInventoryForm)}>
          <Header
            setFormStep={setFormStep}
            formStep={formStep}
            isLoading={
              isLoading ||
              isUpdateInventoryLoading ||
              (fetchStatus === 'fetching' && status === 'loading')
            }
            isSaved={isCreateSuccess || isEditSuccess}
          />
          {getForm()}
        </form>
      </FormProvider>

      <SuccessModal
        title="Inventory Successfully Added"
        prompt="Go to inventory"
        open={openSuccessModal}
        setOpenSuccessModal={setOpenSuccessModal}
        path="inventory"
      />
    </div>
  );
};

export default CreateInventoryPage;
