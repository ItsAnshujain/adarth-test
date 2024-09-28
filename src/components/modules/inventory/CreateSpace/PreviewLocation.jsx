import { useFormContext } from '../../../../context/formContext';
import { tierList } from '../../../../utils';
import MapView from './MapView';

const PreviewLocation = () => {
  const { values } = useFormContext();
  return (
    <div className="flex gap-8 p-4 col-span-2 mt-2 border rounded-md flex-1 mb-10 ml-5 mr-7">
      <div className="flex-1 ">
        <p className="text-lg text-slate-400 font-light">Address</p>
        <p className="mb-4">{values?.location?.address || 'NA '}</p>
        <div className="grid grid-cols-2">
          <div>
            <p className="text-lg text-slate-400 font-light">City</p>
            <p className="mb-4">{values?.location?.city || 'NA'}</p>
          </div>
          <div>
            <p className="text-lg text-slate-400 font-light">State</p>
            <p className="mb-4">{values?.location?.state || 'NA'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <p className="text-lg text-slate-400 font-light">Pin Code</p>
            <p className="mb-4">{values?.location?.zip || 'NA'}</p>
          </div>
          <div>
            <p className="text-lg text-slate-400 font-light">Tier</p>
            <p className="mb-4">
              {tierList.map(item =>
                item.label === values.location.tier.label ||
                item.value === values.location.tier.label
                  ? item.label
                  : null,
              ) || 'NA'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1">
          <div>
            <p className="text-lg text-slate-400 font-light">Facia towards</p>
            <p className="mb-4">{values?.location?.faciaTowards || 'NA'}</p>
          </div>
        </div>
      </div>
      <MapView
        latitude={values?.location?.latitude ? +values.location.latitude : 0}
        longitude={values?.location?.longitude ? +values.location.longitude : 0}
      />
    </div>
  );
};

export default PreviewLocation;
