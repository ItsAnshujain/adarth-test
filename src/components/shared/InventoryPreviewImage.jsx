import { Image } from '@mantine/core';

const InventoryPreviewImage = ({ imgSrc, inventoryName, location, dimensions }) => (
  <div className="relative">
    <Image src={imgSrc || null} height={580} alt="preview" withPlaceholder={!!imgSrc} />
    <div className="absolute bg-gradient-to-t from-black/70 to-black/0 h-full w-full top-0 flex flex-col justify-end p-8 text-xl text-white">
      <span className="text-base">{location}</span>
      <span className="capitalize">{inventoryName}</span>
      {dimensions?.length ? (
        <span className="text-base">
          W x H :{' '}
          {dimensions
            ?.map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
            .filter(item => item !== null)
            .join(', ')}
        </span>
      ) : null}
    </div>
  </div>
);

export default InventoryPreviewImage;
