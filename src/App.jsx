import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import shallow from 'zustand/shallow';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Loader/Header';
import CustomLoader from './components/Loader/Loader';
import Sidebar from './components/Loader/Sidebar';
import NoMatchFoundPage from './pages/NoMatchFoundPage';
import ProtectedRoutes from './utils/ProtectedRoutes';
import ProtectedRoute from './utils/ProtectedRoute';
import { ROLES } from './utils';
import FileUpload from './components/modules/finance/Create/FileUpload';
import useUserStore from './store/user.store';
import { useFetchUsersById } from './apis/queries/users.queries';
import GalleryPage from './pages/GalleryPage';
import UploadImagesPage from './pages/GalleryPage/UploadImagesPage';
import GalleryImagesDashboardPage from './pages/GalleryPage/GalleryImagesDashboard';
import RepositoryPage from './pages/RepositoryPage';
import CompanyPage from './pages/RepositoryPage/CompanyPage';
import CoCompanyPage from './pages/RepositoryPage/CoCompanyPage';
import ContactPage from './pages/RepositoryPage/ContactPage';
import TermsAndConditionsPage from './pages/RepositoryPage/TermsAndConditionsPage';
import ViewCompanyPage from './pages/RepositoryPage/ViewCompanyPage';
import ViewContactPage from './pages/RepositoryPage/ViewContactPage';
import LeadsPage from './pages/LeadsPage';
import LeadsDashboardPage from './pages/LeadsPage/LeadsDashboardPage';
import AddLeadPage from './pages/LeadsPage/AddLeadPage';
import Reports_new from './pages/Reports_new';
import OtherNewReports from './pages/Reports_new/OtherNewReports';
import OtherPerformanceReport from './pages/OtherPerformanceReport';
import OtherTagsWiseReport from './pages/OtherTagsWiseReport';
import OtherMediaReport from './pages/OtherMediaReport';
import OtherSampleReport from './pages/OtherSampleReport';

const HomePage = lazy(() => import('./pages/HomePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const InventoryDashboardPage = lazy(() => import('./pages/InventoryPage/InventoryDashboardPage'));
const CreateInventoryPage = lazy(() => import('./pages/InventoryPage/CreateInventoryPage'));
const CreateBulkInventoriesPage = lazy(() =>
  import('./pages/InventoryPage/CreateBulkInventoriesPage'),
);
const InventoryDetailsPage = lazy(() => import('./pages/InventoryPage/InventoryDetailsPage'));

const PerformanceReport = lazy(() => import('./pages/OtherPerformanceReport/PerformanceReport'));
const TagsWiseReport = lazy(() => import('./pages/OtherTagsWiseReport/TagsWiseReport'));
const MediaWiseReport = lazy(() => import('./pages/OtherMediaReport/MediaWiseReport'));
const SampleReport = lazy(() => import('./pages/OtherSampleReport/SampleReport'));

const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const BookingsDashboardPage = lazy(() => import('./pages/BookingsPage/BookingsDashboardPage'));
const CreateBookingPage = lazy(() => import('./pages/BookingsPage/CreateBookingPage'));
const BookingDetailsPage = lazy(() => import('./pages/BookingsPage/BookingDetailsPage'));

const ProposalsPage = lazy(() => import('./pages/ProposalsPage'));
const ProposalDashboardPage = lazy(() => import('./pages/ProposalsPage/ProposalDashboardPage'));
const CreateProposalPage = lazy(() => import('./pages/ProposalsPage/CreateProposalPage'));
const ProposalDetailsPage = lazy(() => import('./pages/ProposalsPage/ProposalDetailsPage'));

const UsersPage = lazy(() => import('./pages/UsersPage'));
const UsersDashboardPage = lazy(() => import('./pages/UsersPage/UsersDashboardPage'));
const CreateUsersPage = lazy(() => import('./pages/UsersPage/CreateUsersPage'));
const UsersDetailsPage = lazy(() => import('./pages/UsersPage/UsersDetailsPage'));

const MastersPage = lazy(() => import('./pages/MastersPage'));

const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const CampaignsDashboardPage = lazy(() => import('./pages/CampaignsPage/CampaignsDashboardPage'));
const CreateCampaignPage = lazy(() => import('./pages/CampaignsPage/CreateCampaignPage'));
const CampaignDetailsPage = lazy(() => import('./pages/CampaignsPage/CampaignDetailsPage'));

const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const InventoryReportsPage = lazy(() => import('./pages/ReportsPage/InventoryReportsPage'));
const RevenueReportsPage = lazy(() => import('./pages/ReportsPage/RevenueReportsPage'));
const CampaignReportsPage = lazy(() => import('./pages/ReportsPage/CampaignReportsPage'));

const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const ViewMyProfilePage = lazy(() => import('./pages/MyProfilePage/ViewMyProfilePage'));
const EditMyProfilePage = lazy(() => import('./pages/MyProfilePage/EditMyProfilePage'));

const FinancePage = lazy(() => import('./pages/FinancePage'));
const FinanceDashboardPage = lazy(() => import('./pages/FinancePage/FinanceDashboardPage'));
const CreateFinancePage = lazy(() => import('./pages/FinancePage/CreateFinancePage'));
const FinanceMonthlyPage = lazy(() => import('./pages/FinancePage/FinanceMonthlyPage'));
const FinanceMonthlyDetailsPage = lazy(() =>
  import('./pages/FinancePage/FinanceMonthlyDetailsPage'),
);

const HeaderSidebarLoader = () => (
  <>
    <Header />
    <Sidebar />
  </>
);

const components = {
  PUBLIC: [
    { comp: lazy(() => import('./pages/LoginPage')), path: '/login' },
    { comp: lazy(() => import('./pages/ForgotPasswordPage')), path: '/forgot-password' },
    { comp: lazy(() => import('./pages/ChangePasswordPage')), path: '/change-password' },
    {
      comp: lazy(() => import('./pages/TermsAndConditionsPage')),
      path: '/terms-conditions',
    },
    {
      comp: lazy(() => import('./pages/PublicLinkPage')),
      path: '/:media_owner_company_name/:proposal_version_name/:client_company_name',
    },
  ],
};

const App = () => {
  const location = useLocation();
  const { token, hasAcceptedTerms, userId } = useUserStore(
    state => ({
      token: state.token,
      hasAcceptedTerms: state.hasAcceptedTerms,
      userId: state.id,
    }),
    shallow,
  );

  const { _ } = useFetchUsersById(userId, !!hasAcceptedTerms);

  if (
    token &&
    hasAcceptedTerms &&
    (location.pathname.includes('/login') ||
      location.pathname.includes('/forgot-password') ||
      location.pathname.includes('/change-password') ||
      location.pathname.includes('/terms-conditions'))
  ) {
    if (location.search.includes('setting')) {
      return <Navigate to="/settings?type=change_password" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      {components.PUBLIC.map(({ comp: Comp, path }) => (
        <Route
          key={uuidv4()}
          path={path}
          element={
            <Suspense fallback={<CustomLoader />}>
              <Comp />
            </Suspense>
          }
        />
      ))}
      <Route element={<ProtectedRoutes />}>
        <Route
          path="/home"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/inventory"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <InventoryPage />
            </Suspense>
          }
        >
          <Route path="" element={<InventoryDashboardPage />} />
          <Route
            path="create-space/single"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateInventoryPage />
              </Suspense>
            }
          />
          <Route
            path="create-space/bulk"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateBulkInventoriesPage />
              </Suspense>
            }
          />
          <Route
            path="edit-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateInventoryPage />
              </Suspense>
            }
          />
          <Route
            path="view-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <InventoryDetailsPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute accepted={[ROLES.ADMIN]}>
              <Suspense fallback={<HeaderSidebarLoader />}>
                <CampaignsPage />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <CampaignsDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="create-campaign"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateCampaignPage />
              </Suspense>
            }
          />
          <Route
            path="edit-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateCampaignPage />
              </Suspense>
            }
          />
          <Route
            path="view-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CampaignDetailsPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/proposals"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <ProposalsPage />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <ProposalDashboardPage />
              </Suspense>
            }
          />
          <Route path="create-proposals" element={<CreateProposalPage />} />
          <Route
            path="edit-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateProposalPage />
              </Suspense>
            }
          />
          <Route
            path="view-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ProposalDetailsPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/bookings"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <BookingsPage />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <BookingsDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="view-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <BookingDetailsPage />
              </Suspense>
            }
          />
          <Route
            path="create-order"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateBookingPage />
              </Suspense>
            }
          />
          <Route
            path="edit-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateBookingPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="gallery"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <GalleryPage />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <GalleryImagesDashboardPage />
              </Suspense>
            }
          />

          <Route
            path="upload-images"
            element={
              <Suspense fallback={<CustomLoader />}>
                <UploadImagesPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="users"
          element={
            <ProtectedRoute accepted={[ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR]}>
              <Suspense fallback={<HeaderSidebarLoader />}>
                <UsersPage />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <UsersDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="create-user"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateUsersPage />
              </Suspense>
            }
          />
          <Route
            path="edit-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateUsersPage />
              </Suspense>
            }
          />
          <Route
            path="view-details/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <UsersDetailsPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/reports"
          element={
            <ProtectedRoute accepted={[ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR]}>
              <Suspense fallback={<HeaderSidebarLoader />}>
                <ReportsPage />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            path="inventories"
            element={
              <Suspense fallback={<CustomLoader />}>
                <InventoryReportsPage />
              </Suspense>
            }
          />
          <Route
            path="revenue"
            element={
              <Suspense fallback={<CustomLoader />}>
                <RevenueReportsPage />
              </Suspense>
            }
          />
          <Route
            path="campaign"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CampaignReportsPage />
              </Suspense>
            }
          />
        </Route>
        {/* others */}
        <Route
          path="newReports"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <Reports_new />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <OtherNewReports />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="performanceReport"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <OtherPerformanceReport />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <PerformanceReport />
              </Suspense>
            }
          />
        </Route>
      
        <Route
          path="tagsWiseReport"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <OtherTagsWiseReport />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <TagsWiseReport />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="mediaWiseReport"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <OtherMediaReport />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <MediaWiseReport />
              </Suspense>
            }
          />
        </Route>
      
        <Route
          path="sampleReport"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <OtherSampleReport />
            </Suspense>
          }
        >
          <Route
            path=""
            element={
              <Suspense fallback={<CustomLoader />}>
                <SampleReport />
              </Suspense>
            }
          />
        </Route>
      
        {/* //others */}
       
     

        <Route
          path="/masters"
          element={
            <ProtectedRoute accepted={ROLES.ADMIN}>
              <Suspense fallback={<HeaderSidebarLoader />}>
                <MastersPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <NotificationsPage />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="/"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <MyProfilePage />
            </Suspense>
          }
        >
          <Route
            path="profile"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ViewMyProfilePage />
              </Suspense>
            }
          />
          <Route
            path="edit-profile"
            element={
              <Suspense fallback={<CustomLoader />}>
                <EditMyProfilePage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/"
          element={
            <ProtectedRoute accepted={[ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.SUPERVISOR]}>
              <Suspense fallback={<HeaderSidebarLoader />}>
                <FinancePage />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route
            path="/finance"
            element={
              <Suspense fallback={<CustomLoader />}>
                <FinanceDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/finance/:year"
            element={
              <Suspense fallback={<CustomLoader />}>
                <FinanceMonthlyPage />
              </Suspense>
            }
          />
          <Route
            path="/finance/:year/:month"
            element={
              <Suspense fallback={<CustomLoader />}>
                <FinanceMonthlyDetailsPage />
              </Suspense>
            }
          />
          <Route
            path="/finance/create-order/:type"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CreateFinancePage />
              </Suspense>
            }
          />
          <Route
            path="/finance/create-order/:type/upload"
            element={
              <Suspense fallback={<CustomLoader />}>
                <FileUpload />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/leads"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <LeadsPage />
            </Suspense>
          }
        >
          <Route
            path="leads-dashboard"
            element={
              <Suspense fallback={<CustomLoader />}>
                <LeadsDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="add-lead"
            element={
              <Suspense fallback={<CustomLoader />}>
                <AddLeadPage />
              </Suspense>
            }
          />
        </Route>
        <Route
          path="/repository"
          element={
            <Suspense fallback={<HeaderSidebarLoader />}>
              <RepositoryPage />
            </Suspense>
          }
        >
          <Route
            path="terms-and-conditions"
            element={
              <Suspense fallback={<CustomLoader />}>
                <TermsAndConditionsPage />
              </Suspense>
            }
          />
          <Route
            path="company"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CompanyPage />
              </Suspense>
            }
          />
          <Route
            path="contact/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ViewContactPage type="company" />
              </Suspense>
            }
          />
          <Route
            path="company/companies/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ViewCompanyPage type="company" tab="companies" />
              </Suspense>
            }
          />

          <Route
            path="company/parent-companies/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ViewCompanyPage type="company" tab="parent-companies" />
              </Suspense>
            }
          />

          <Route
            path="co-company/parent-companies/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ViewCompanyPage type="co-company" tab="parent-companies" />
              </Suspense>
            }
          />
          <Route
            path="co-company/sister-companies/:id"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ViewCompanyPage type="co-company" tab="sister-companies" />
              </Suspense>
            }
          />
          <Route
            path="co-company"
            element={
              <Suspense fallback={<CustomLoader />}>
                <CoCompanyPage />
              </Suspense>
            }
          />
          <Route
            path="contact"
            element={
              <Suspense fallback={<CustomLoader />}>
                <ContactPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<NoMatchFoundPage />} />
    </Routes>
  );
};

export default App;
