import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Image } from '@mantine/core';
import classNames from 'classnames';
import MarkerIcon from '../../../../assets/pin.svg';
import { GOOGLE_MAPS_API_KEY } from '../../../../utils/config';

const defaultProps = {
  zoom: 10,
};

const Marker = () => <Image src={MarkerIcon} height={28} width={28} />;

const MapView = ({ latitude, longitude, className }) => (
  <div className={classNames('w-[40%] h-[30vh] border bg-gray-450', className)}>
    <GoogleMapReact
      bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY, libraries: 'places' }}
      defaultZoom={defaultProps.zoom}
      yesIWantToUseGoogleMapApiInternals
      center={{ lat: latitude, lng: longitude }}
    >
      <Marker lat={latitude} lng={longitude} />
    </GoogleMapReact>
  </div>
);

export default MapView;
