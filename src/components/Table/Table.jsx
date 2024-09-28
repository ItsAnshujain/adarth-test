import React, { useMemo } from 'react';
import { useTable, useSortBy, useRowSelect, useFilters } from 'react-table';
import { Loader, Pagination } from '@mantine/core';
import classNames from 'classnames';
import { useSearchParams } from 'react-router-dom';
import IndeterminateCheckbox from './Checkbox';
import Ascending from '../../assets/Icons/Ascending';
import Descending from '../../assets/Icons/Descending';
import useUserStore from '../../store/user.store';

const Table = ({
  COLUMNS,
  data = [],
  allowRowsSelect = false,
  activePage = 1,
  totalPages = 1,
  setSelectedFlatRows = () => {},
  setActivePage = () => {},
  selectedRowData = [],
  handleSorting = () => {},
  handleTableRowClick = () => {},
  showPagination = true,
  className = '',
  classNameWrapper = '',
  loading = false,
}) => {
  const columns = useMemo(() => COLUMNS, [COLUMNS]);
  const [searchParams] = useSearchParams('');
  const sortOrder = searchParams.get('sortOrder');
  const userId = useUserStore(state => state.id);

  const selection = useMemo(() => selectedRowData?.map(item => item._id), [selectedRowData]);
  const selectedAll = useMemo(
    () => data?.length && data.every(item => selection.includes(item._id) || false),
    [data, selection],
  );

  const onHandleHeader = col => handleSorting(col.id);

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable(
    {
      columns,
      data,
      disableSortRemove: true,
      initialState: {
        pageIndex: 0,
      },
      manualPagination: true,
      manualSortBy: true,
      onHeaderClick: onHandleHeader,
    },
    useFilters,
    useSortBy,
    useRowSelect,
  );

  const handleRowClick = (row, all = false) => {
    if (all) {
      if (selectedAll) {
        setSelectedFlatRows(selectedRowData.filter(id => row.find(r => r._id === id)));
        return;
      }

      const temp = [...selectedRowData];
      row.forEach(r => !selection.includes(r._id) && temp.push(r));
      setSelectedFlatRows(temp);
      return;
    }

    if (selection.includes(row._id)) {
      setSelectedFlatRows(selectedRowData.filter(item => item._id !== row._id));
      return;
    }

    setSelectedFlatRows([...selectedRowData, row]);
  };
  return (
    <div className={classNames('min-h-[450px] flex flex-col justify-between', classNameWrapper)}>
      <div className={classNames('overflow-auto', className)}>
        {loading ? (
          <Loader className="mx-auto" />
        ) : (
          <table className="w-full" {...getTableProps()}>
            <thead className="bg-gray-100">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {allowRowsSelect && (
                    <th className="text-sm px-2">
                      <IndeterminateCheckbox
                        checked={selectedAll}
                        onClick={() => handleRowClick(data, true)}
                      />
                    </th>
                  )}

                  {headerGroup.headers.map(header => (
                    <th
                      className={classNames(
                        'text-sm',
                        header.sticky
                          ? 'sticky right-0 top-0 z-10 bg-inherit action text-center w-28'
                          : '',
                      )}
                      {...header.getHeaderProps(header.getSortByToggleProps())}
                      onClick={() => {
                        if (header.id.includes('selection') || header.disableSortBy) return;
                        onHandleHeader(header);
                      }}
                    >
                      <div className="w-max flex align-center text-left pl-2 text-gray-400 hover:text-black py-2 text-xs font-medium">
                        <div className="w-fit tracking-wide">{header.render('Header')}</div>
                        <div className="ml-2 gap-1 flex flex-col">
                          {header?.canSort ? (
                            header.isSortedDesc || sortOrder === 'desc' ? (
                              <>
                                <Ascending fill="black" />
                                <Descending fill="#A1A9B8" />
                              </>
                            ) : (
                              <>
                                <Ascending fill="#A1A9B8" />
                                <Descending fill="black" />
                              </>
                            )
                          ) : null}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows?.map(row => {
                prepareRow(row);
                return (
                  <tr
                    className={classNames(
                      'text-left overflow-auto border border-l-0 hover:bg-slate-100',
                      row.original?.peerId && row.original.peerId !== userId && 'has-peer',
                      row.original.isActive === false ? 'opacity-50' : '',
                      selection.includes(row.original._id) ? 'bg-green-100' : '',
                    )}
                    onClick={() => handleTableRowClick(row.original?._id)}
                    {...row.getRowProps()}
                  >
                    {allowRowsSelect && (
                      <th>
                        <IndeterminateCheckbox
                          className="mx-2"
                          checked={selection.includes(row.original._id)}
                          onClick={() => handleRowClick(row.original)}
                        />
                      </th>
                    )}
                    {row.cells.map(cell => (
                      <td
                        className={classNames(
                          'p-2',
                          cell.column.sticky
                            ? 'sticky right-0 top-0 z-10 bg-inherit action text-center w-28'
                            : '',
                        )}
                        {...cell.getCellProps()}
                      >
                        <div className="w-max">{cell.render('Cell')}</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {rows.length <= 0 && !loading ? <div className="mx-auto">No data available</div> : null}
      {showPagination ? (
        <div className="flex justify-end my-4">
          <Pagination
            styles={theme => ({
              item: {
                color: theme.colors.gray[5],
                fontWeight: 700,
              },
            })}
            page={activePage}
            onChange={setActivePage}
            total={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Table;
