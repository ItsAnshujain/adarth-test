import { Image } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useEffect, useState } from 'react';
import image from '../../../../assets/image.png';
import { useFormContext } from '../../../../context/formContext';
import { useUploadFile } from '../../../../apis/queries/upload.queries';
import TextInput from '../../../shared/TextInput';

const styles = {
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderRadius: 0,
    padding: 8,
  },
};

const BasicInformationForm = ({ setUploadingFile }) => {
  const { errors, getInputProps, setFieldValue, values } = useFormContext();
  const { mutateAsync: upload, isLoading } = useUploadFile();
  const [uploadImage, setUploadImage] = useState([]);

  const onHandleDrop = async params => {
    const formData = new FormData();
    formData.append('files', params?.[0]);
    const res = await upload(formData);
    setUploadImage(res?.[0].Location);
    setFieldValue('image', res?.[0].Location);
  };

  useEffect(() => {
    setUploadingFile(isLoading);
  }, [isLoading]);

  return (
    <div className="px-5 mt-4">
      <p className="text-xl font-bold">Just some basic information about your profile</p>
      <div className="mt-8 flex flex-col">
        <p className="font-bold text-lg">Upload Profile Picture</p>
        <p className="text-md text-slate-400">Please upload png or jpeg photo(150x150 px)</p>
        <div className="flex">
          {values.image !== '' ? (
            <div className="h-[150px] w-[150px] mt-3 mr-3">
              <Image
                src={values.image || uploadImage}
                alt="profile-image"
                height={150}
                width={150}
                className="bg-gray-450"
              />
            </div>
          ) : null}

          <div className="h-[150px] w-[150px] mt-3">
            <Dropzone
              onDrop={onHandleDrop}
              accept={['image/png', 'image/jpeg']}
              className="h-full w-full flex justify-center items-center"
              loading={isLoading}
              name="image"
              multiple={false}
              {...getInputProps('image')}
            >
              <img src={image} alt="placeholder" />
            </Dropzone>
          </div>
        </div>
        {errors?.image ? <p className="mt-1 text-xs text-red-450">{errors?.image}</p> : null}
      </div>
      <div className="md:grid md:grid-cols-2 gap-6 mt-4 mb-12">
        <TextInput
          label="Name"
          name="name"
          styles={styles}
          withAsterisk
          errors={errors}
          placeholder="Name"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="Organization"
          name="company"
          styles={styles}
          errors={errors}
          placeholder="Organization"
          disabled
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="Phone Number"
          name="number"
          styles={styles}
          withAsterisk
          errors={errors}
          placeholder="Phone Number"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="State"
          name="state"
          styles={styles}
          errors={errors}
          placeholder="State"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="Address"
          name="address"
          styles={styles}
          errors={errors}
          placeholder="Address"
          className="col-span-2 mb-3 md:mb-0"
        />
        <TextInput
          label="City"
          name="city"
          styles={styles}
          errors={errors}
          placeholder="City"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="Pin"
          name="pincode"
          styles={styles}
          errors={errors}
          placeholder="Pin"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="Aadhaar"
          name="aadhaar"
          styles={styles}
          errors={errors}
          placeholder="Aadhaar"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="Pan"
          name="pan"
          styles={styles}
          errors={errors}
          placeholder="Pan"
          className="mb-3 md:mb-0"
        />
        <TextInput
          label="About you"
          name="about"
          styles={styles}
          errors={errors}
          placeholder="Write"
          className="col-span-2 mb-3 md:mb-0"
        />
      </div>
    </div>
  );
};

export default BasicInformationForm;
