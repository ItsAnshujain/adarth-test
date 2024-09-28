import { Image, Pagination, Skeleton } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { useModals } from '@mantine/modals';
import Card from './Card';
import modalConfig from '../../../utils/modalConfig';

const updatedModalConfig = {
  ...modalConfig,
  classNames: {
    title: 'font-dmSans text-xl px-4',
    header: 'px-4 pt-4',
    body: '',
    close: 'mr-4',
  },
};

const skeletonList = () =>
  Array.apply('', Array(5)).map(_ => (
    <Skeleton height={410} width={273} radius="sm" key={uuidv4()} />
  ));

const GridView = ({
  list,
  totalPages = 1,
  activePage = 1,
  setActivePage = () => {},
  isLoadingList,
}) => {
  const modals = useModals();

  const togglePreviewModal = imgSrc =>
    modals.openModal({
      title: 'Preview',
      children: (
        <Image src={imgSrc || null} height={580} alt="preview" withPlaceholder={!!imgSrc} />
      ),
      ...updatedModalConfig,
    });
  return (
    <>
      <div className="flex flex-wrap gap-6 mb-8">
        {list.map(item => (
          <Card
            key={item?._id}
            onPreview={() => (item?.thumbnail ? togglePreviewModal(item.thumbnail) : null)}
            {...item}
          />
        ))}
        {isLoadingList ? skeletonList() : null}
      </div>
      <div className="flex justify-end my-4 pr-7">
        <Pagination
          styles={theme => ({
            item: {
              color: theme.colors.gray[9],
              fontWeight: 100,
              fontSize: '0.7em',
            },
          })}
          page={activePage}
          onChange={setActivePage}
          total={totalPages}
        />
      </div>
    </>
  );
};

export default GridView;
