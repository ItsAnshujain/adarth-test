import React from 'react';
import Image from '../assets/login.svg';

const NoMatchFoundPage = () => (
  <div className="flex">
    <div>
      <img src={Image} alt="login" className="h-screen" />
    </div>
    <div className="flex flex-1 items-center justify-center">
      <p className="text-3xl font-bold">Page not found</p>
    </div>
  </div>
);

export default NoMatchFoundPage;
