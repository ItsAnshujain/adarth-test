import { Button, Group } from '@mantine/core';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePlus } from 'react-feather';
import { useNavigate } from 'react-router-dom';

import { useCsvImport } from '../../apis/queries/inventory.queries';

const FileUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const { mutate, isLoading } = useCsvImport();

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      'application/file': ['.csv'],
    },
    disabled: isLoading,
    multiple: false,
    onDrop: useCallback(acceptedFiles => {
      setFile(acceptedFiles[0]);
    }, []),
  });

  const handleUpload = () => {
    const fd = new FormData();
    fd.append('files', file);
    mutate(fd, {
      onSuccess: () => {
        setFile(null);
        setTimeout(() => {
          navigate('/inventory');
        }, 2000);
      },
    });
  };

  return (
    <>
      <header className="h-[60px] border-b border-gray-450 flex justify-between items-center pl-5 pr-7">
        <p className="text-xl font-bold">Upload Space CSV</p>
        <button
          onClick={() => navigate(-1)}
          className="flex gap-1 border rounded-md p-2"
          type="button"
        >
          <span>Close</span>
        </button>
      </header>

      <div
        {...getRootProps()}
        disabled
        className="h-[40%] border-2 border-dashed border-slate-300 bg-[#F9FAFD] ml-5 mr-7 mt-4 flex flex-col items-center justify-center "
      >
        <FilePlus onClick={open} size={34} className={file ? 'text-green-500' : 'text-slate-400'} />
        <input type="hidden" {...getInputProps()} accept=".xlsx, .xls, .csv" />

        {file ? (
          <p className="mt-2 mb-3">{file.name}</p>
        ) : (
          <>
            <p className="mt-2 mb-3">
              Drag and drop your files here, or{' '}
              <span className="text-purple-450 cursor-pointer">browse</span>
            </p>
            <p className="text-slate-400 text-sm">
              <span className="text-red-450">Note:</span> For multiple values, use semicolon (;) to
              separate
            </p>
          </>
        )}
      </div>
      <Group className="ml-5 mt-3 mb-5 flex justify-center">
        <a
          href="https://adarth-assets-dev.s3.ap-south-1.amazonaws.com/sample_bulk_upload.csv"
          className="text-purple-450 cursor-pointer font-medium"
          target="_blank"
          download
          rel="noopener noreferrer"
        >
          Download
        </a>
        <p className="-ml-2">the sample file for reference</p>
      </Group>
      <Button
        disabled={isLoading}
        loading={isLoading}
        onClick={file ? handleUpload : open}
        className="bg-purple-450 text-white p-2 rounded mx-auto block mt-3"
      >
        Upload File
      </Button>
    </>
  );
};

export default FileUpload;
