import { Button, Checkbox } from '@mantine/core';
import { Link } from 'react-router-dom';

const Header = ({ setSelectedImages, imagesData }) => {
  const handleSelectAll = checked => {
    if (checked) {
      setSelectedImages(imagesData);
    } else {
      setSelectedImages([]);
    }
  };
  return (
    <div className="py-3 border-b border-gray-450">
      <div className="px-5 flex justify-between w-full items-center">
        <div className="text-xl font-bold">Images</div>
        <div className="flex gap-3 items-center">
          <Checkbox label="Select All Images" onClick={e => handleSelectAll(e.target.checked)} />
          <Button
            to="/gallery/upload-images"
            className="bg-purple-450 order-3 font-normal"
            component={Link}
          >
            Upload Images
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
