import { ActionIcon, Button } from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons';
import { Link, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { showNotification } from '@mantine/notifications';
import { useUploadImages } from '../../apis/queries/gallery.queries';
import DropzoneComponent from '../../components/shared/Dropzone';

const UploadImagesPage = () => {
  const form = useForm();
  const navigate = useNavigate();

  const uploadImagesHandler = useUploadImages();

  const uploadImages = form.handleSubmit(async () => {
    if (!form.getValues('files')?.length) {
      return showNotification({
        message: 'Please select images',
        color: 'red',
      });
    }
    await uploadImagesHandler.mutateAsync(form.getValues('files'), {
      onSuccess: () => {
        showNotification({
          message: 'Images uploaded successfully',
          color: 'green',
        });
        navigate('/gallery');
        form.reset();
      },
    });
    return null;
  });

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <FormProvider {...form}>
        <form onSubmit={uploadImages} noValidate>
          <div className="flex justify-between w-full items-center h-fit py-3 border-gray-450 border-b">
            <div className="flex gap-4 items-center px-5">
              <ActionIcon to="/gallery" component={Link} className="text-black">
                <IconArrowLeft />
              </ActionIcon>
              <div className="text-xl font-bold">Upload images</div>
            </div>
          </div>
          <div className="px-5 pt-8 flex flex-col justify-center w-1/2 m-auto gap-4">
            <div className="text-xl font-bold">Upload up to 30 images (max 30 MB/image)</div>
            <DropzoneComponent
              name="spacePhoto"
              onDrop={files => form.setValue('files', files)}
              accept={['image/png', 'image/jpeg', 'image/jpg']}
              maxSize={30 * 1024 ** 2}
              maxFiles={30}
              className="h-96 bg-white"
              multiple
              addExtraContent={
                form.watch('files')?.length ? (
                  <div className="border px-2 py-1 rounded-md flex items-center gap-3 w-fit m-auto">
                    <div className="font-normal">{form.watch('files')?.length} images selected</div>
                    <ActionIcon
                      onClick={e => {
                        e.stopPropagation();
                        form.setValue('files', []);
                      }}
                      disabled={uploadImagesHandler.isLoading}
                    >
                      <IconX size={20} color="black" />
                    </ActionIcon>
                  </div>
                ) : (
                  <div>
                    <p>
                      Drag and drop the files directly into the upload area or{' '}
                      <span className="text-purple-450 border-none">browse</span>
                    </p>
                    <p className="text-gray-400 text-center">(JPEG, JPG, PNG)</p>
                  </div>
                )
              }
            />
            <div className="flex gap-3 w-full">
              <Button
                variant="filled"
                className="bg-black w-full font-normal"
                component={Link}
                to="/gallery"
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                className="bg-purple-450 w-full font-normal"
                type="submit"
                disabled={uploadImagesHandler.isLoading}
                loading={uploadImagesHandler.isLoading}
              >
                Upload
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UploadImagesPage;
