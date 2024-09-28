import ViewCompanyHeader from '../../components/modules/company/ViewCompanyHeader';

const ViewCompanyPage = ({ type, tab }) => (
  <div className="overflow-y-auto px-3 col-span-10">
    <div className="overflow-y-auto px-3 col-span-10">
      <ViewCompanyHeader type={type} tab={tab} />
    </div>
  </div>
);

export default ViewCompanyPage;
