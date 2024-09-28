import { Button, Loader, Pagination } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { useModals } from '@mantine/modals';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import ImagesList from '../../components/modules/gallery/ImagesList';
import Header from '../../components/modules/gallery/Header';
import ImagesPerPage from '../../components/modules/gallery/ImagesPerPage';
import ConfirmContent from '../../components/shared/ConfirmContent';
import modalConfig from '../../utils/modalConfig';
import { useDeleteImages, useFetchGalleryImages } from '../../apis/queries/gallery.queries';
import { serialize } from '../../utils';

const GalleryImagesDashboardPage = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const deleteImagesQuery = useDeleteImages();
  const [searchParams, setSearchParams] = useSearchParams({
    'page': 1,
    'limit': 10,
    'sortBy': 'name',
    'sortOrder': 'asc',
  });

  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  const imagesQuery = useFetchGalleryImages(
    serialize({
      page,
      limit,
      sortBy,
      sortOrder,
    }),
  );

  const modals = useModals();

  const deleteImage = () => {
    modals.closeModal('deleteImageModal');
    deleteImagesQuery.mutate(selectedImages?.map(image => image._id).join(','), {
      onSuccess: () => {
        showNotification({
          message: 'Image deleted successfully',
          color: 'green',
        });
        setSelectedImages([]);
      },
    });
  };

  const toggleDelete = () => {
    if (!selectedImages.length)
      return showNotification({
        message: 'Please select images',
      });

    return modals.openModal({
      modalId: 'deleteImageModal',
      title: 'Delete Images',
      children: (
        <ConfirmContent
          onConfirm={deleteImage}
          onCancel={() => modals.closeModal('deleteImageModal')}
          loading={deleteImagesQuery.isLoading}
          classNames="px-6"
        />
      ),
      ...modalConfig,
      size: 'md',
    });
  };

  const handlePagination = (key, val) => {
    if (val !== '') {
      searchParams.set(key, val);
      searchParams.set('page', 1);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const copyLink = () => {
    if (!selectedImages.length) return showNotification({ message: 'Please select images' });
    navigator.clipboard.writeText(selectedImages.map(image => image.url).join('\n'));
    return showNotification({
      message: 'Link copied!',
    });
  };

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <Header setSelectedImages={setSelectedImages} imagesData={imagesQuery?.data?.docs} />
      <div className="w-full px-5">
        <div className="flex items-center gap-3 text-sm text-gray-6 font-medium text-gray-500 justify-between w-full  my-4">
          <div className="flex items-center gap-3">
            <ImagesPerPage
              count="10"
              setCount={currentLimit => handlePagination('limit', currentLimit)}
            />
            <Button
              variant="default"
              className="text-purple-450 p-0 border-none"
              onClick={toggleDelete}
            >
              <IconTrash size={24} />
            </Button>
            <Button variant="filled" className="bg-black" onClick={copyLink}>
              Copy link
            </Button>
          </div>
          <div className="flex justify-end">
            <Pagination
              styles={theme => ({
                item: {
                  color: theme.colors.gray[5],
                  fontWeight: 700,
                },
              })}
              page={imagesQuery?.data?.page}
              onChange={val => {
                searchParams.set('page', val);
                setSearchParams(searchParams);
              }}
              total={imagesQuery?.data?.totalPages}
            />
          </div>
        </div>
        {imagesQuery?.data?.docs.length <= 0 ? (
          <div className="text-center">No images available</div>
        ) : null}
        {imagesQuery.isLoading || imagesQuery.isFetching || deleteImagesQuery.isLoading ? (
          <Loader className="mx-auto" />
        ) : (
          <ImagesList
            selectedImages={selectedImages}
            imagesData={imagesQuery?.data?.docs}
            setSelectedImages={setSelectedImages}
          />
        )}
      </div>
    </div>
  );
};

export default GalleryImagesDashboardPage;
