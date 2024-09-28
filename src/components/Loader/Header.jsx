import { Skeleton } from '@mantine/core';

const height = 24;

const HeaderLoader = () => (
  <header className="grid grid-cols-12 col-span-12 h-[60px]">
    <div className="flex items-center col-span-2 pl-2 lg:pl-7 self-center bg-purple-450 h-full" />
    <div className="flex justify-between items-center col-span-10 border-b border-gray-450">
      <div className="pl-5">
        <Skeleton height={height} className="w-16 lg:w-24" />
      </div>
      <div className="flex items-center mr-7">
        <Skeleton className="w-16 lg:w-24 mr-5" height={height} />
        <Skeleton className="w-16 lg:w-24 mr-5" height={height} />
        <Skeleton className="w-16 lg:w-24" height={height} />
      </div>
    </div>
  </header>
);

export default HeaderLoader;
