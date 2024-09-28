import { Image, Text, Badge, Card as MantineCard } from '@mantine/core';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import toIndianCurrency from '../../../utils/currencyFormat';

const Card = ({
  _id,
  status,
  thumbnail,
  name = 'N/A',
  place = [],
  price = 0,
  isFeatured,
  onPreview,
}) => (
  <MantineCard className="flex flex-col drop-shadow-md bg-white w-[270px]">
    <MantineCard.Section
      className={classNames(thumbnail ? 'cursor-zoom-in' : '')}
      onClick={onPreview}
    >
      {thumbnail ? (
        <Image
          height={170}
          src={thumbnail}
          alt="thumbnail"
          withPlaceholder
          placeholder={<Text align="center">Unexpected error occured. Image cannot be loaded</Text>}
        />
      ) : (
        <Image height={170} src={null} alt="card" fit="contain" withPlaceholder />
      )}
    </MantineCard.Section>
    <Link to={`/campaigns/view-details/${_id}`}>
      <div className="flex-1 flex flex-col gap-y-2 mt-4">
        <div className="flex items-center">
          <Badge p="sm" radius="xl" color="green" variant="filled">
            {status || 'Created'}
          </Badge>
          {isFeatured ? (
            <p className="flex gap-1 text-xs items-center ml-2 text-purple-450">Featured</p>
          ) : null}
        </div>

        <Text size="md" weight="bold" lineClamp={1} className="w-full">
          {name}
        </Text>
        <div className="grid grid-cols-2 justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-2">No of Media</p>
            <p className="text-sm">{place.length || 0}</p>
          </div>
        </div>
        <p className="font-extrabold text-lg">{price ? toIndianCurrency(price) : 0}</p>
      </div>
    </Link>
  </MantineCard>
);

export default Card;
