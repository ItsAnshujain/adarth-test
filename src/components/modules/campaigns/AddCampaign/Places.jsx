import { Image, Text } from '@mantine/core';
import toIndianCurrency from '../../../../utils/currencyFormat';

const Places = ({ data }) => (
  <div className="flex gap-4 p-4 shadow-md bg-white mb-2">
    <div>
      <Image
        height={150}
        width={160}
        src={data.img || null}
        alt={data?.name}
        fit="contain"
        withPlaceholder
      />
    </div>
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-4">
        <div>
          <Text weight="bolder" className="mb-2">
            {data.name}
          </Text>
          <p className="text-slate-400 text-sm mb-2 tracking-wide">{data.address}</p>
          <Text weight="bolder">
            {data?.cost ? toIndianCurrency(Number.parseInt(data.cost, 10)) : 0}
          </Text>
        </div>
        <div className="ml-6">
          <div className="mb-4">
            <p className="text-slate-400 text-sm tracking-wide">Media Type</p>
            <p className="font-normal">{data.lighting}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm tracking-wide">Unit</p>
            <p className="font-normal">{data.unit}</p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-slate-400 text-sm tracking-wide">Illumination</p>
            <p className="font-normal">{data.illumination}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm tracking-wide">Resolution</p>
            <p className="font-normal">{data.resolution}</p>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <p className="text-slate-400 text-sm tracking-wide">Size (WxH)</p>
            <p className="font-normal">{data.dimensions}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Places;
