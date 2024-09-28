import { useNavigate } from 'react-router-dom';
import { Modal, Text, Button } from '@mantine/core';
import check from '../../assets/check.svg';

const SuccessModal = ({ open, setOpenSuccessModal, title, text, prompt, path }) => {
  const navigate = useNavigate();
  return (
    <Modal opened={open} centered onClose={() => setOpenSuccessModal(false)} /* ...other props */>
      <div className="flex flex-col  justify-center gap-4 text-center">
        <img className="mx-auto" width="40px" height="40px" src={check} alt="check" />
        <Text size="lg" weight="bold">
          {title}
        </Text>
        <Text className="text-gray-500">{text}</Text>
        <Button
          className="bg-purple-450 text-white mb-2"
          onClick={() => {
            if (path) {
              navigate(`/${path}`);
            } else {
              setOpenSuccessModal(false);
            }
          }}
        >
          {prompt}
        </Button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
