/* eslint-disable react/no-array-index-key */
import { Skeleton } from '@mantine/core';

const cols = new Array(6).fill(true);
const rows = new Array(10).fill(true);
const height = 24;

const Loader = () => (
  <div className="grid lg:col-span-10 border-l border-gray-450 overflow-y-auto">
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          {cols.map((_, idx) => (
            <th key={idx}>
              <Skeleton height={height} radius="sm" className="my-2" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((_ele2, index) => (
          <tr className="text-left border border-l-0 w-full" key={index}>
            {cols.map((_ele, idx) => (
              <td className="pl-2 py-2" key={idx}>
                <div className="flex flex-1 w-full">
                  <Skeleton height={height} radius="sm" />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Loader;
