import { useLeadStats } from '../../apis/queries/leads.queries';
import LeadsList from '../../components/modules/leads/LeadsList';
import LeadsStats from '../../components/modules/leads/LeadsStats';

const LeadsDashboardPage = () => {
  const leadStatsQuery = useLeadStats();

  return (
    <div className="overflow-y-auto px-3 col-span-10">
      <LeadsStats heading="Lead Stats" leadStatsData={leadStatsQuery?.data} />
      <LeadsList />
    </div>
  );
};

export default LeadsDashboardPage;
