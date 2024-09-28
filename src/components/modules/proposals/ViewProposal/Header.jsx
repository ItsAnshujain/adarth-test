import { Button } from '@mantine/core';
import { ArrowLeft, Share2, ChevronDown } from 'react-feather';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useProposalStore from '../../../../store/proposal.store';

const Header = ({
  isPeer,
  bookingId,
  onOpenVersionsDrawer,
  toggleShareOptions,
  parentProposalId,
  version = '',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const handleBack = () => navigate(-1);
  const setProposalData = useProposalStore(state => state.setProposalData);

  return (
    <div className="h-[60px] border-b border-gray-450 flex justify-between items-center">
      <div>
        <ArrowLeft className="cursor-pointer" onClick={handleBack} />
      </div>
      <div className="flex gap-4">
        <Button
          variant="default"
          onClick={onOpenVersionsDrawer}
          leftIcon={<ChevronDown size={16} className="mt-[1px] mr-1" />}
        >
          Versions {version}
        </Button>
        <div className="relative">
          <Button
            className="bg-black"
            onClick={() => toggleShareOptions(id, version)}
            leftIcon={<Share2 className="h-5" />}
            disabled={isLoading}
          >
            Share and Download
          </Button>
        </div>
        {!isPeer && !bookingId && !parentProposalId ? (
          <div>
            <Link
              to={`/proposals/edit-details/${id}`}
              className="bg-purple-450 flex items-center text-white rounded-md px-4 h-full font-bold text-sm"
              onClick={() => setProposalData([])}
            >
              Edit Proposal
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Header;
