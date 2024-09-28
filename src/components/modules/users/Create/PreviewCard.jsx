import { Box, Button, Image } from '@mantine/core';
import { useModals } from '@mantine/modals';
import classNames from 'classnames';
import trash from '../../../../assets/trash.svg';
import pdf from '../../../../assets/pdf.svg';
import modalConfig from '../../../../utils/modalConfig';
import { downloadPdf } from '../../../../utils';

const docs = {
  aadhaar: 'Aadhaar',
  pan: 'Pan',
};

const PreviewImage = ({ ext }) => {
  if (ext?.includes('pdf')) {
    return <Image src={pdf} alt="file-type-icon" height={40} width={40} className="mb-3" />;
  }

  if (/jpg|png|jpeg|gif/i.test(ext))
    return <Image src={ext} alt="file-type-icon" height={130} className="mb-3 " />;

  return null;
};

const PreviewCard = ({
  filename,
  cardText,
  cardSubtext,
  fileExtensionType,
  onClickDelete = () => {},
  showTrashBtn = true,
  preview = false,
}) => {
  const modals = useModals();
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

  return (
    <div className="flex flex-col">
      <div className="border border-dashed border-slate-400 flex items-center justify-center relative w-[100%] h-48 bg-slate-100">
        <Box
          className={classNames(
            !fileExtensionType?.includes('pdf') ? 'cursor-zoom-in' : 'cursor-pointer',
            'flex justify-center items-center flex-col relative p-10',
          )}
          onClick={
            !fileExtensionType?.includes('pdf')
              ? () => toggleImagePreviewModal(fileExtensionType)
              : () => downloadPdf(fileExtensionType)
          }
        >
          <PreviewImage ext={fileExtensionType} />
          <p className="text-sm">{docs[preview ? Object.keys(filename)[0] : filename]}</p>
        </Box>
        {showTrashBtn ? (
          <Button className="absolute right-2 top-1 px-0" onClick={onClickDelete}>
            <Image src={trash} alt="trash-icon" />
          </Button>
        ) : null}
      </div>

      <div className="text-sm pt-1">
        {preview ? (
          <>
            <p className="font-medium">{docs[Object.keys(filename)[0]]}</p>
            <p className="text-slate-400">Your {docs[Object.keys(filename)[0]]} photocopy</p>
          </>
        ) : (
          <>
            <p className="font-medium">{docs[cardText]}</p>
            <p className="text-slate-400">Your {docs[cardSubtext]} photocopy</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;
