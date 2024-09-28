import { Box, Image } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import pdf from '../../assets/pdf.svg';
import useUserStore from '../../store/user.store';
import modalConfig from '../../utils/modalConfig';
import UserDetailsContent from '../../components/modules/profile/UserDetailsContent';
import { downloadPdf } from '../../utils';

const ViewMyProfilePage = () => {
  const modals = useModals();
  const userId = useUserStore(state => state.id);
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(['users-by-id', userId]);
  const [docs, setDocs] = useState([]);

  const toggleImagePreviewModal = imgSrc =>
    modals.openContextModal('basic', {
      title: 'Preview',
      innerProps: {
        modalBody: (
          <Box className=" flex justify-center" onClick={id => modals.closeModal(id)}>
            {imgSrc ? (
              <Image src={imgSrc} height={580} width={580} alt="preview" />
            ) : (
              <Image src={null} height={580} width={580} withPlaceholder />
            )}
          </Box>
        ),
      },
      ...modalConfig,
    });

  useEffect(() => {
    if (data) {
      const finalObject = {};
      if (data.docs.find(item => Object.keys(item)[0] === 'aadhaar')) {
        finalObject.aadhaar = data.docs.find(item => Object.keys(item)[0] === 'aadhaar').aadhaar;
      }
      if (data.docs.find(item => Object.keys(item)[0] === 'pan')) {
        finalObject.pan = data.docs.find(item => Object.keys(item)[0] === 'pan').pan;
      }
      setDocs({ ...finalObject });
    }
  }, [data]);

  return (
    <div className="col-span-12 md:col-span-12 lg:col-span-10 border-l border-gray-450 overflow-y-auto">
      <div className="h-[60px] flex justify-end items-center border-b pr-7">
        <Link to="/edit-profile">
          <span className="text-white px-5 py-2 font-bold text-sm bg-purple-450 rounded-md">
            Edit
          </span>
        </Link>
      </div>
      <div className="pl-5 pr-7 flex justify-between mt-8 mb-8">
        <div className="grid md:grid-cols-3 gap-8">
          <UserDetailsContent data={data} />
          <div className="flex flex-col gap-8">
            {docs.aadhaar ? (
              <div className="flex flex-col">
                <div className="border border-dashed border-slate-400 flex items-center justify-center relative w-92 h-36 bg-slate-100">
                  <Box
                    className={classNames(
                      !docs.aadhaar?.includes('pdf') ? 'cursor-zoom-in' : 'cursor-pointer',
                      'flex justify-center items-center flex-col relative p-10 h-full w-full',
                    )}
                    onClick={
                      !docs.aadhaar?.includes('pdf')
                        ? () => toggleImagePreviewModal(docs.aadhaar)
                        : () => downloadPdf(docs.aadhaar)
                    }
                  >
                    <img
                      src={docs.aadhaar}
                      alt="aadhaar"
                      className="h-full w-full object-contain"
                    />
                  </Box>
                </div>
                <div className="text-sm mt-2">
                  <p className="font-medium">Aadhaar</p>
                  <p className="text-slate-400">Your aadhaar card photocopy</p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-8">
            {docs.pan ? (
              <div className="flex flex-col">
                <div className="border border-dashed border-slate-400 flex items-center justify-center relative w-92 h-36 bg-slate-100">
                  <Box
                    className={classNames(
                      !docs.pan?.includes('pdf') ? 'cursor-zoom-in' : 'cursor-pointer',
                      'flex justify-center items-center flex-col relative p-10 h-full w-full',
                    )}
                    onClick={
                      !docs.pan?.includes('pdf')
                        ? () => toggleImagePreviewModal(docs.pan)
                        : () => downloadPdf(docs.pan)
                    }
                  >
                    {docs.pan?.includes('pdf') ? (
                      <Image
                        src={pdf}
                        alt="file-type-icon"
                        height={40}
                        width={40}
                        className="mb-3"
                      />
                    ) : (
                      <img src={docs.pan} alt="pan" className="h-full w-full object-contain" />
                    )}
                  </Box>
                </div>
                <div className="text-sm mt-2">
                  <p className="font-medium">Pan</p>
                  <p className="text-slate-400">Your pan card photocopy</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMyProfilePage;
