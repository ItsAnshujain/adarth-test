import { Button, Text } from '@mantine/core';
import { Share2, Download } from 'react-feather';

const Header = ({
  shareType,
  text,
  onClickDownloadPdf = () => {},
  onClickSharePdf = () => {},
  isDownloadLoading,
}) => (
  <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
    <Text size="lg" weight="bold">
      {text}
    </Text>
    {shareType !== 'report' ? (
      <div className="flex items-start">
        <Button
          leftIcon={<Download size="20" color="white" />}
          className="primary-button mx-3"
          onClick={onClickDownloadPdf}
          loading={isDownloadLoading}
          disabled={isDownloadLoading}
        >
          Download
        </Button>

        <Button
          leftIcon={<Share2 size="20" color="black" />}
          className="secondary-button"
          onClick={onClickSharePdf}
          disabled={isDownloadLoading}
        >
          Share
        </Button>
      </div>
    ) : null}
  </div>
);

export default Header;
