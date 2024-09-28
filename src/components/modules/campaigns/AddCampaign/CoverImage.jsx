import { Card, Image, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { useFormContext } from '../../../../context/formContext';

const CoverImage = () => {
  const { values, setFieldValue } = useFormContext();

  const handleClick = (img, thumbnailId) => {
    setFieldValue('thumbnailId', thumbnailId);
    setFieldValue('thumbnail', img);
  };

  return (
    <div className="my-4 flex flex-col gap-y-4 relative">
      <Text weight="bold">Select Thumbnail image</Text>
      <Text size="sm" className="text-gray-400 font-medium">
        Please fill the form with valid information,this specification details will help the
        customer
      </Text>
      <div className="grid grid-cols-4 gap-4">
        {values?.place?.map(placeItem => (
          <Card
            key={uuidv4()}
            onClick={() => handleClick(placeItem.photo, placeItem._id)}
            className={classNames(
              'p-4 flex flex-col gap-y-4 hover:bg-gray-50 cursor-pointer',
              values?.thumbnailId === placeItem._id ? 'border-purple-450' : '',
            )}
            withBorder
            shadow="sm"
            radius="md"
          >
            <Card.Section>
              {placeItem?.photo ? (
                <Image
                  height={200}
                  src={placeItem.photo}
                  alt="poster"
                  fit="cover"
                  withPlaceholder
                  placeholder={
                    <Text align="center">Unexpected error occured. Image cannot be loaded</Text>
                  }
                />
              ) : (
                <Image height={200} src={null} alt="poster" fit="contain" withPlaceholder />
              )}
            </Card.Section>
            <Text weight="bold">{placeItem?.spaceName}</Text>
            <Text className="mb-2" weight="200">
              {placeItem?.location?.address}, {placeItem?.location?.zip}
            </Text>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoverImage;
