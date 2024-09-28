import { Button, Image, Menu } from '@mantine/core';
import { IconDownload } from '@tabler/icons';
import dayjs from 'dayjs';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import logoWhite from '../../../../assets/logo.svg';
import powerpoint from '../../../../assets/powerpoint.svg';
import excel from '../../../../assets/excel.svg';
import pdf from '../../../../assets/pdfIc.svg';
import { useGeneratePublicProposal } from '../../../../apis/queries/proposal.queries';
import { downloadPdf, serialize } from '../../../../utils';

const DownloadButtons = ({ proposalId, clientCompanyName, template, subject }) => {
  const [fileType, setFileType] = useState();
  const genProposalHandler = useGeneratePublicProposal();
  const download = async type => {
    const payload = {
      format: type,
      shareVia: 'copy_link',
      to: '',
      cc: '',
      name: '',
      aspectRatio: template?.split(';')[0] || 'fill',
      templateType: template?.split(';')[1] || 'generic',
      clientCompanyName,
      subject,
    };

    await genProposalHandler.mutateAsync(
      { proposalId, queries: serialize({ utcOffset: dayjs().utcOffset() }), payload },
      {
        onSuccess: res => {
          downloadPdf(res.link[type]);
          showNotification({
            title: 'Download successful',
            color: 'green',
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Button
        variant="outline"
        className="border-none md:border-solid md:border md:border-black text-black font-normal"
        leftIcon={<Image src={powerpoint} alt="powerpoint" />}
        onClick={() => {
          download('PPT');
          setFileType('PPT');
        }}
        disabled={genProposalHandler.isLoading}
        loading={genProposalHandler.isLoading && fileType === 'PPT'}
      >
        Download PPT
      </Button>
      <Button
        variant="outline"
        className="border-none md:border-solid md:border md:border-black text-black font-normal"
        leftIcon={<Image src={pdf} alt="pdf" />}
        onClick={() => {
          download('PDF');
          setFileType('PDF');
        }}
        disabled={genProposalHandler.isLoading}
        loading={genProposalHandler.isLoading && fileType === 'PDF'}
      >
        Download PDF
      </Button>
      <Button
        variant="outline"
        className="border-none md:border-solid md:border md:border-black text-black font-normal"
        leftIcon={<Image src={excel} alt="excel" />}
        onClick={() => {
          download('Excel');
          setFileType('Excel');
        }}
        disabled={genProposalHandler.isLoading}
        loading={genProposalHandler.isLoading && fileType === 'Excel'}
      >
        Download Excel
      </Button>
    </div>
  );
};

const Header = ({ proposalId, clientCompanyName, template, subject }) => (
  <div className="flex justify-between my-4 md:my-8">
    <Image className="w-24 lg:w-28" src={logoWhite} alt="logo" />
    <div className="hidden md:flex">
      <DownloadButtons
        proposalId={proposalId}
        clientCompanyName={clientCompanyName}
        template={template}
      />
    </div>
    <Menu shadow="md" classNames={{ item: 'cursor-pointer' }} className="md:hidden">
      <Menu.Target>
        <Button
          variant="outline"
          className="text-black border-black font-normal"
          size="xs"
          leftIcon={<IconDownload size={20} />}
        >
          Download
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <DownloadButtons
          proposalId={proposalId}
          clientCompanyName={clientCompanyName}
          template={template}
          subject={subject}
        />
      </Menu.Dropdown>
    </Menu>
  </div>
);

export default Header;
