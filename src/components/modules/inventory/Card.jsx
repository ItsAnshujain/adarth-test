import { Badge, Box, Checkbox, Image, Text, Card as MantineCard } from '@mantine/core';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toIndianCurrency from '../../../utils/currencyFormat';
import SpacesMenuPopover from '../../Popovers/SpacesMenuPopover';
import {
  currentDate,
  getAvailableUnits,
  getOccupiedState,
  getOccupiedStateColor,
} from '../../../utils';

const Card = ({
  _id,
  isActive,
  bookingRange = [],
  basicInformation,
  location,
  specifications,
  isUnderMaintenance,
  isSelected = false,
  onSelect = () => {},
  onPreview,
}) => {
  const unitLeft = getAvailableUnits(bookingRange, currentDate, currentDate, specifications?.unit);
  const occupiedState = getOccupiedState(unitLeft, specifications?.unit);

  return (
    <MantineCard
      className={classNames(
        'flex flex-col bg-white w-[270px] min-h-[400px]',
        !isActive ? 'opacity-50' : '',
      )}
      withBorder
      radius="md"
      shadow="sm"
    >
      <MantineCard.Section
        className={classNames(basicInformation?.spacePhoto ? 'cursor-zoom-in' : '')}
        onClick={onPreview}
      >
        {basicInformation?.spacePhoto ? (
          <Image
            height={170}
            src={basicInformation?.spacePhoto}
            alt="card"
            withPlaceholder
            placeholder={
              <Text align="center">Unexpected error occured. Image cannot be loaded</Text>
            }
          />
        ) : (
          <Image height={170} src={null} alt="card" fit="contain" withPlaceholder />
        )}
      </MantineCard.Section>
      <Link to={`/inventory/view-details/${_id}`} key={_id}>
        <div className="flex-1 flex flex-col gap-y-2 mt-4">
          <Box
            className="flex justify-between items-center mb-2"
            onClick={e => e.stopPropagation()}
          >
            <Badge
              className="capitalize"
              variant="filled"
              size="lg"
              color={getOccupiedStateColor(isUnderMaintenance, occupiedState)}
            >
              {isUnderMaintenance ? 'Under Maintenance' : occupiedState}
            </Badge>
            <Checkbox
              onChange={event => onSelect(event.target.value)}
              label="Select"
              classNames={{ root: 'flex flex-row-reverse', label: 'pr-2' }}
              defaultValue={_id}
              checked={isSelected}
            />
          </Box>
          <Text
            size="md"
            weight="bold"
            lineClamp={1}
            className="w-full"
            title={basicInformation?.spaceName}
          >
            {basicInformation?.spaceName}
          </Text>
          <Text size="sm" weight="200" lineClamp={1} title={location?.city}>
            {location?.city || 'NA'}
          </Text>
          <div>
            <p className="text-sm text-gray-400 mb-2">Additional Tags</p>
            <div className="flex gap-x-2 flex-wrap">
              {specifications?.additionalTags?.length
                ? specifications.additionalTags.map(
                    (item, index) =>
                      index < 2 && (
                        <Badge
                          key={uuidv4()}
                          size="md"
                          className="capitalize max-w-[100px]"
                          title={item}
                        >
                          {item}
                        </Badge>
                      ),
                  )
                : '--'}
            </div>
          </div>
          <div className="grid grid-cols-2 justify-between gap-y-2 gap-x-3">
            <div>
              <p className="text-sm text-gray-400 mb-2">Category</p>
              <Text className="text-sm" lineClamp={1}>
                {basicInformation?.category?.name || '--'}
              </Text>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Sub Category</p>
              <Text className="text-sm" lineClamp={1}>
                {basicInformation?.subCategory?.name || '--'}
              </Text>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Unit</p>
              <p className="text-sm font-medium">{specifications?.unit || '--'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Facia Towards</p>
              <p className="text-sm font-medium">{location?.faciaTowards || '--'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-400 mb-2">Dimension (wxh)</p>
              {specifications?.size.length ? (
                <p className="text-sm">
                  {specifications.size
                    .map(item => `${item?.width || 0}ft x ${item?.height || 0}ft`)
                    .filter(item => item !== null)
                    .join(', ')}
                </p>
              ) : (
                '-'
              )}
            </div>
          </div>

          <Box className="flex justify-between items-center" onClick={e => e.stopPropagation()}>
            <Text size="lg" className="font-bold" color="purple">
              {basicInformation?.price ? toIndianCurrency(basicInformation.price) : 'NA'}
            </Text>
            <SpacesMenuPopover itemId={_id} />
          </Box>
        </div>
      </Link>
    </MantineCard>
  );
};

export default Card;
