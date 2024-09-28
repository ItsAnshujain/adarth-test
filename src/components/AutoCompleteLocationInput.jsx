import React from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { useFormContext } from '../context/formContext';
import { getLatituteLongitude } from '../utils';
import { GOOGLE_MAPS_API_KEY } from '../utils/config';

const AutoCompleteLocationInput = ({
  addressKeyName = '',
  latitudeKeyName = '',
  longitudeKeyName = '',
  cityKeyName = '',
  stateKeyName = '',
  zipCodeName = '',
}) => {
  const { setFieldValue, errors, values } = useFormContext();
  const getLatLong = async address => {
    const location = await getLatituteLongitude(address);
    return location;
  };

  const onChangeHandler = async e => {
    if (e) {
      const res = await getLatLong(e.label);
      const detailedAddress = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${res?.lat},${res?.lng}&sensor=true&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const detailedAddressRes = await detailedAddress.json();
      const postalCodeComponent = detailedAddressRes.results[0].address_components.find(component =>
        component.types.includes('postal_code'),
      );

      setFieldValue(addressKeyName, e.label);
      setFieldValue(latitudeKeyName, res?.lat);
      setFieldValue(longitudeKeyName, res?.lng);
      if (e.value.terms.length) {
        setFieldValue(cityKeyName, e.value.terms[e.value.terms.length - 3].value);
        setFieldValue(stateKeyName, e.value.terms[e.value.terms.length - 2].value);
      }
      if (postalCodeComponent && postalCodeComponent.long_name) {
        setFieldValue(
          zipCodeName,
          postalCodeComponent.long_name && postalCodeComponent.long_name.replace(' ', ''),
        );
      } else {
        setFieldValue(zipCodeName, '');
      }
    } else {
      setFieldValue(addressKeyName, '');
      setFieldValue(zipCodeName, '');
    }
  };

  return (
    <>
      <GooglePlacesAutocomplete
        apiKey={GOOGLE_MAPS_API_KEY}
        debounce={1000}
        selectProps={{
          defaultInputValue: values.location.address || '',
          isClearable: true,
          styles: {
            control: provided => ({
              ...provided,
              border: `0.5px solid ${errors[addressKeyName] ? 'red' : 'grey'} `,
              ':hover': {
                border: `0.5px solid ${errors[addressKeyName] ? 'red' : 'grey'}`,
              },
              width: '100%',
              boxShadow: 'none',
              height: 36,
            }),
            input: provided => ({
              ...provided,
            }),
            singleValue: provided => ({
              ...provided,
              color: '#000',
            }),
            valueContainer: () => ({
              paddingLeft: '0.5rem',
              fontSize: '14px',
            }),
            indicatorsContainer: () => ({
              display: 'none',
            }),
          },
          onChange: onChangeHandler,
        }}
      />
      {errors[addressKeyName] ? (
        <p className="text-xs mt-1 text-red-450">{errors[addressKeyName]}</p>
      ) : null}
    </>
  );
};

export default AutoCompleteLocationInput;
