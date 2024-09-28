import { Image } from '@mantine/core';
import React from 'react';
import image1 from '../../../assets/placeholders/user-avatar.png';
import { aadhaarFormat } from '../../../utils';

const UserDetailsContent = ({ data }) => (
  <div className="flex flex-col gap-8">
    <div className="flex gap-4">
      <div>
        <Image src={data?.image || image1} alt="profile pic" height={160} />
      </div>
      <div className="flex flex-col">
        <p className="text-xl font-bold">{data?.name || 'N/A'}</p>
        <p className="text-[#914EFB] capitalize">{data?.role || 'N/A'}</p>
        <p>{data?.company}</p>
      </div>
    </div>
    <div>
      <p>{data?.about}</p>
    </div>
    <div>
      <p className="text-slate-400">Email</p>
      <p className="font-semibold">{data?.email || 'N/A'}</p>
    </div>
    <div>
      <p className="text-slate-400">Phone</p>
      <p className="font-semibold">{data?.number || 'N/A'}</p>
    </div>
    <div>
      <p className="text-slate-400">Address</p>
      <p className="font-semibold">{data?.address || 'N/A'} </p>
    </div>
    <div>
      <p className="text-slate-400">City</p>
      <p className="font-semibold">{data?.city || 'N/A'}</p>
    </div>
    <div>
      <p className="text-slate-400">Pincode</p>
      <p className="font-semibold">{data?.pincode || 'N/A'}</p>
    </div>
    <div>
      <p className="text-slate-400">Pan</p>
      <p className="font-semibold">{data?.pan || 'N/A'}</p>
    </div>
    <div>
      <p className="text-slate-400">Aadhaar</p>
      <p className="font-semibold">{aadhaarFormat(data?.aadhaar || '') || 'N/A'}</p>
    </div>
  </div>
);

export default UserDetailsContent;
