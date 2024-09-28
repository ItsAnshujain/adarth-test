import { useFormContext } from '../../../../context/formContext';
import { useFetchMasters } from '../../../../apis/queries/masters.queries';
import { serialize, tierList } from '../../../../utils';
import AutoCompleteLocationInput from '../../../AutoCompleteLocationInput';
import NumberInput from '../../../shared/NumberInput';
import TextInput from '../../../shared/TextInput';
import MapView from './MapView';
import Select from '../../../shared/Select';

const styles = {
  label: {
    marginBottom: '10px',
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
};

const query = {
  parentId: null,
  limit: 100,
  page: 1,
  sortBy: 'name',
  sortOrder: 'asc',
};

const LocationForm = () => {
  const { errors, values } = useFormContext();
  const {
    data: zoneData,
    isLoading: isZoneLoading,
    isSuccess: isZoneLoaded,
  } = useFetchMasters(serialize({ type: 'zone', ...query }));
  const {
    data: facingData,
    isLoading: isFacingLoading,
    isSuccess: isFacingLoaded,
  } = useFetchMasters(serialize({ type: 'facing', ...query }));

  return (
    <div className="flex flex-col pl-5 pr-7 pt-4 mb-10">
      <p className="font-bold text-lg">Location</p>
      <p className="text-gray-500 text-sm font-light">
        Please fill the relevant details regarding the ad Space
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4">
        <div>
          <p style={styles.label}>Address</p>
          {typeof window.google !== 'undefined' ? (
            <AutoCompleteLocationInput
              addressKeyName="location.address"
              latitudeKeyName="location.latitude"
              longitudeKeyName="location.longitude"
              cityKeyName="location.city"
              stateKeyName="location.state"
              zipCodeName="location.zip"
            />
          ) : (
            <TextInput
              name="location.address"
              withAsterisk
              styles={styles}
              errors={errors}
              placeholder="Write..."
              className="mb-7"
            />
          )}
          <TextInput
            label="State"
            name="location.state"
            withAsterisk
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="my-7"
          />
          <NumberInput
            label="Latitude"
            name="location.latitude"
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
            precision={6}
          />
          <Select
            label="Zone"
            name="location.zone"
            withAsterisk
            styles={styles}
            errors={errors}
            placeholder="Select..."
            disabled={isZoneLoading}
            options={
              isZoneLoaded
                ? zoneData.docs.map(zone => ({
                    label: zone.name,
                    value: zone._id,
                  }))
                : []
            }
            className="mb-7"
          />
          <Select
            label="Facing"
            name="location.facing"
            withAsterisk
            styles={styles}
            errors={errors}
            placeholder="Select..."
            disabled={isFacingLoading}
            options={
              isFacingLoaded
                ? facingData.docs.map(facing => ({
                    label: facing.name,
                    value: facing._id,
                  }))
                : []
            }
            className="mb-7"
          />
          <MapView
            latitude={values?.location?.latitude ? +values.location.latitude : 0}
            longitude={values?.location?.longitude ? +values.location.longitude : 0}
            className="w-[80%]"
          />
        </div>
        <div>
          <TextInput
            label="City"
            name="location.city"
            withAsterisk
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
          />
          <TextInput
            label="Zip"
            name="location.zip"
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
          />
          <NumberInput
            label="Longitude"
            name="location.longitude"
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
            precision={6}
          />
          <TextInput
            label="Landmark"
            name="location.landmark"
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
          />
          <Select
            label="Tier"
            name="location.tier"
            withAsterisk
            styles={styles}
            errors={errors}
            placeholder="Select..."
            options={tierList}
            className="mb-7"
          />
          <TextInput
            label="Facia towards"
            name="location.faciaTowards"
            styles={styles}
            errors={errors}
            placeholder="Write..."
            className="mb-7"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
