import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone';
import { FilePlus } from 'react-feather';
import { useFormContext } from '../../../../context/formContext';

const DragDropCard = ({
  onHandleDrop = () => {},
  cardText,
  cardSubtext,
  isLoading = false,
  disabled = false,
}) => {
  const { errors, getInputProps } = useFormContext();

  return (
    <div className="flex flex-col">
      <Dropzone
        onDrop={onHandleDrop}
        accept={['image/png', 'image/jpeg', PDF_MIME_TYPE]}
        className=" flex justify-center items-center w-[100%] h-48 bg-slate-100"
        loading={isLoading}
        name="docs"
        disabled={disabled}
        multiple={false}
        {...getInputProps('docs')}
      >
        <div className="flex flex-col items-center justify-center">
          <FilePlus src={FilePlus} alt="" className="h-8" />
          <p className="text-xs text-center">
            Drag and drop your files here, or <span className="text-purple-450">browse</span>
          </p>
        </div>
      </Dropzone>
      {errors?.docs ? <p className="mt-1 text-xs text-red-450">{errors?.docs}</p> : null}
      <div className="text-sm pt-1">
        <p className="font-medium">{cardText}</p>
        <p className="text-slate-400">{cardSubtext}</p>
      </div>
    </div>
  );
};

export default DragDropCard;
