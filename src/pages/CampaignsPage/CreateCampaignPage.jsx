import { useState, useEffect } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@mantine/form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import BasicInformationForm from '../../components/modules/campaigns/AddCampaign/BasicInformationForm';
import SuccessModal from '../../components/shared/Modal';
import CoverImage from '../../components/modules/campaigns/AddCampaign/CoverImage';
import Header from '../../components/modules/campaigns/AddCampaign/Header';
import SpaceList from '../../components/modules/campaigns/AddCampaign/SpaceList';
import { FormProvider, useForm } from '../../context/formContext';
import Preview from '../../components/modules/campaigns/AddCampaign/Preview';
import {
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
} from '../../apis/queries/campaigns.queries';
import { useFetchMasters } from '../../apis/queries/masters.queries';
import { calculateTotalPrice, serialize } from '../../utils';

const initialValues = {
  name: '',
  description: '',
  price: null,
  createStatus: '',
  isFeatured: false,
  previousBrands: [],
  tags: [],
  place: [],
  thumbnail: '',
  thumbnailId: '',
  type: 'predefined',
};

const schema = yup.object({
  name: yup.string().trim().required('Campaign Name is required'),
  description: yup.string().trim(),
  previousBrands: yup.array().of(yup.string().trim()),
  tags: yup.array().of(yup.string().trim()),
  isFeatured: yup.boolean(),
  thumbnail: yup.string(),
});

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const form = useForm({ initialValues, validate: yupResolver(schema) });
  const [searchParams] = useSearchParams({
    'page': 1,
    'limit': 10,
    'sortBy': 'basicInformation.spaceName',
    'sortOrder': 'desc',
  });
  const { data: campaignStatus } = useFetchMasters(
    serialize({ type: 'campaign_status', parentId: null, limit: 100, page: 1 }),
  );
  const { id } = useParams();

  const { data: campaignData } = useCampaign({ id, query: searchParams.toString() }, !!id);
  const { mutateAsync: add, isLoading: isSaving } = useCreateCampaign();
  const { mutate: update, isLoading: isUpdating } = useUpdateCampaign();

  const getForm = () =>
    formStep === 1 ? (
      <BasicInformationForm />
    ) : formStep === 2 ? (
      <SpaceList />
    ) : formStep === 3 ? (
      <CoverImage />
    ) : (
      <Preview data={form.values} place={{ docs: form.values?.place || [] }} />
    );

  const handleSubmit = async (formData, submitType) => {
    const data = { ...formData };
    if (formStep === 2) {
      if (!form.values?.place?.length) {
        showNotification({
          title: 'Please select atleast one place to continue',
          color: 'blue',
        });
        return;
      }
    }

    if (formStep === 3 && form.values.thumbnail === '') {
      showNotification({
        title: 'Please select one cover image to continue',
        color: 'blue',
      });
      return;
    }

    setFormStep(prevState => prevState + 1);
    if (formStep === 4) {
      setFormStep(4);

      const totalPrice = calculateTotalPrice(data?.place);

      data.price = totalPrice;

      data.place = data.place.map(item => ({
        id: item._id,
        price: item.price,
      }));

      if (submitType === 'publish') {
        const statusId = campaignStatus?.docs?.find(
          item => item?.name?.toLowerCase() === 'published',
        )?._id;

        data.createStatus = statusId;
      } else if (submitType === 'save') {
        const statusId = campaignStatus?.docs?.find(
          item => item?.name?.toLowerCase() === 'created',
        )?._id;

        data.createStatus = statusId;
      }

      Object.keys(data).forEach(key => {
        if (data[key] === '') {
          delete data[key];
        }
      });

      if (!['predefined', 'customized'].includes(data.type)) {
        data.type = 'predefined';
      }

      if (id) {
        delete data.createdBy;

        update(
          { id, data },
          {
            onSuccess: () => {
              setTimeout(() => navigate('/campaigns'), 2000);
            },
          },
        );
      } else {
        await add(data, {
          onSuccess: () => {
            setOpenSuccessModal(true);
            setTimeout(() => navigate('/campaigns'), 2000);
          },
        });
      }
    }
  };

  useEffect(() => {
    if (campaignData?.campaign && !form.isTouched()) {
      form.setValues({
        ...campaignData.campaign,
        place: campaignData.campaign.place.map(({ id: inventoryObj, ...item }) => ({
          ...item,
          photo: inventoryObj?.basicInformation?.spacePhoto,
          spaceName: inventoryObj?.basicInformation?.spaceName,
          lighting: inventoryObj?.basicInformation?.mediaType,
          mediaType: inventoryObj?.basicInformation?.mediaType,
          location: {
            address: inventoryObj?.location?.address,
            zip: inventoryObj?.location?.zip,
            latitude: inventoryObj?.location?.latitude,
            longitude: inventoryObj?.location?.longitude,
          },
          cost: inventoryObj?.price,
          dimension: {
            height: inventoryObj?.specifications?.size?.height || 0,
            width: inventoryObj?.specifications?.size?.width || 0,
          },
          illuminations: inventoryObj?.specifications?.illuminations,
          resolutions: inventoryObj?.specifications?.resolutions,
          unit: inventoryObj?.specifications?.unit,
          _id: inventoryObj?._id,
        })),
      });
    }
  }, [campaignData, form.isTouched]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto px-5">
      <div>
        <FormProvider form={form}>
          <form>
            <Header
              setFormStep={setFormStep}
              formStep={formStep}
              handleFormSubmit={handleSubmit}
              disabled={isSaving || isUpdating}
              loading={isSaving || isUpdating}
            />
            {getForm()}
          </form>
        </FormProvider>
        <SuccessModal
          title="Campaign Successfully Added"
          text=""
          prompt="Go to campaign"
          open={openSuccessModal}
          setOpenSuccessModal={setOpenSuccessModal}
          path="campaigns"
        />
      </div>
    </div>
  );
};

export default CreateCampaignPage;
