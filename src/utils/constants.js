import LeadsDiscussionIcon from '../assets/leads-discussion.svg';
import LeadsProgressIcon from '../assets/leads-progress.svg';
import LeadsCompleteIcon from '../assets/leads-complete.svg';
import LeadsLostIcon from '../assets/leads-lost.svg';

export const SMTP_SERVICES = [
  { label: '1und1', value: '1und1' },
  { label: 'AOL', value: 'AOL' },
  { label: 'DebugMail.io', value: 'DebugMail.io' },
  { label: 'DynectEmail', value: 'DynectEmail' },
  { label: 'FastMail', value: 'FastMail' },
  { label: 'GandiMail', value: 'GandiMail' },
  { label: 'Gmail', value: 'Gmail' },
  { label: 'Godaddy', value: 'Godaddy' },
  { label: 'GodaddyAsia', value: 'GodaddyAsia' },
  { label: 'GodaddyEurope', value: 'GodaddyEurope' },
  { label: 'hot.ee', value: 'hot.ee' },
  { label: 'Hotmail', value: 'Hotmail' },
  { label: 'iCloud', value: 'iCloud' },
  { label: 'mail.ee', value: 'mail.ee' },
  { label: 'Mail.ru', value: 'Mail.ru' },
  { label: 'Mailgun', value: 'Mailgun' },
  { label: 'Mailjet', value: 'Mailjet' },
  { label: 'Mandrill', value: 'Mandrill' },
  { label: 'Naver', value: 'Naver' },
  { label: 'Postmark', value: 'Postmark' },
  { label: 'QQ', value: 'QQ' },
  { label: 'QQex', value: 'QQex' },
  { label: 'SendCloud', value: 'SendCloud' },
  { label: 'SendGrid', value: 'SendGrid' },
  { label: 'SES', value: 'SES' },
  { label: 'Sparkpost', value: 'Sparkpost' },
  { label: 'Yahoo', value: 'Yahoo' },
  { label: 'Yandex', value: 'Yandex' },
  { label: 'Zoho', value: 'Zoho' },
  { label: 'Others', value: 'others' },
];

export const MODE_OF_PAYMENT = [
  { label: 'RTGS', value: 'rtgs' },
  { label: 'NEFT', value: 'neft' },
  { label: 'IMPS', value: 'imps' },
  { label: 'CHEQUE', value: 'cheque' },
  { label: 'CREDIT CARD', value: 'credit_card' },
  { label: 'DEBIT CARD', value: 'debit_card' },
  { label: 'UPI', value: 'upi' },
  { label: 'CASH', value: 'cash' },
];

export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATE_SECOND_FORMAT = 'DD MMM YYYY';

export const DATE_THIRD_FORMAT = 'MMMM DD, YYYY';

export const DATE_FOURTH_FORMAT = 'MMMM YYYY';

export const BOOKING_PAID_STATUS = [
  { label: 'Paid', value: true },
  { label: 'Unpaid', value: false },
];

export const YEAR_LIST = [
  { label: 'Select', value: -1 },
  { label: '2020', value: 2020 },
  { label: '2021', value: 2021 },
  { label: '2022', value: 2022 },
  { label: '2023', value: 2023 },
  { label: '2024', value: 2024 },
  { label: '2025', value: 2025 },
  { label: '2026', value: 2026 },
  { label: '2027', value: 2027 },
  { label: '2028', value: 2028 },
  { label: '2029', value: 2029 },
  { label: '2030', value: 2030 },
];

export const MONTH_LIST = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

export const FILE_TYPE_LIST = [
  { name: 'PPT', _id: 'PPT' },
  { name: 'PDF', _id: 'PDF' },
  { name: 'EXCEL', _id: 'Excel' },
];

export const OBJECT_FIT_LIST = [
  {
    name: 'Fill',
    _id: 'fill',
    description:
      'The image is resized to fill the given dimension. If necessary, the image will be stretched or squished to fit',
  },
  {
    name: 'Contain',
    _id: 'contain',
    description:
      'The image keeps its aspect ratio, but is resized to fit within the given dimension',
  },
];

export const FACING_VALUE_LIST = ['single', 'double', 'triple', 'four', 'five'];

export const OBJECT_FIT_LIST_V2 = [
  { label: '', value: '' },
  { label: 'Generic Fill', value: 'fill;generic' },
  { label: 'Generic Contain', value: 'contain;generic' },
  { label: 'Long Shot / Close Shot - Fill', value: 'fill;longShotCloseShot' },
  { label: 'Long Shot / Close Shot - Contain', value: 'contain;longShotCloseShot' },
  { label: 'Custom template', value: 'fill;custom' },
];

export const LEADS_LIST = [
  {
    label: 'Initiate Discussion',
    count: 0,
    textColor: 'text-orange-350',
    backgroundColor: 'bg-orange-50',
    icon: LeadsDiscussionIcon,
  },
  {
    label: 'In Progress',
    count: 0,
    textColor: 'text-purple-350',
    backgroundColor: 'bg-purple-50',
    icon: LeadsProgressIcon,
  },
  {
    label: 'Completed',
    count: 0,
    textColor: 'text-green-350',
    backgroundColor: 'bg-green-50',
    icon: LeadsCompleteIcon,
  },
  {
    label: 'Lost',
    count: 0,
    textColor: 'text-red-350',
    backgroundColor: 'bg-red-100',
    icon: LeadsLostIcon,
  },
];

export const monthsInShort = [
  { label: 'Jan', value: '01' },
  { label: 'Feb', value: '02' },
  { label: 'Mar', value: '03' },
  { label: 'Apr', value: '04' },
  { label: 'May', value: '05' },
  { label: 'Jun', value: '06' },
  { label: 'Jul', value: '07' },
  { label: 'Aug', value: '08' },
  { label: 'Sept', value: '09' },
  { label: 'Oct', value: '10' },
  { label: 'Nov', value: '11' },
  { label: 'Dec', value: '12' },
];

export const proposalColumns = [
  { name: 'Space Name', enum: 'spaceName', mandatory: true },
  { name: 'Width (in ft.)', enum: 'widthInFt', mandatory: true },
  { name: 'Height (in ft.)', enum: 'heightInFt', mandatory: true },
  { name: 'Medium', enum: 'subCategory', mandatory: true },
  { name: 'City', enum: 'city', mandatory: true },
  { name: 'Serial Number', enum: 'serialNo', mandatory: false },
  { name: 'Facia Towards', enum: 'faciaTowards', mandatory: false },
  { name: 'State', enum: 'state', mandatory: false },
  { name: 'Location', enum: 'location', mandatory: false },
  { name: 'Illumination', enum: 'illumination', mandatory: false },
  { name: 'Units', enum: 'units', mandatory: false },
  { name: 'Facing', enum: 'facing', mandatory: false },
  { name: 'Area (in sq. ft.)', enum: 'areaInSqFt', mandatory: false },
  { name: 'Installation cost', enum: 'installationCost', mandatory: false },
  { name: 'Monthly Additional Cost', enum: 'monthlyAdditionalCost', mandatory: false },
  { name: 'Display Price (per month)', enum: 'displayPrice', mandatory: false },
  { name: 'Display Price (per sq. ft)', enum: 'displayPricePerSqft', mandatory: false },
  { name: 'Discounted Display Price', enum: 'discountedDisplayPrice', mandatory: false },
  { name: 'Printing Cost', enum: 'printingCost', mandatory: false },
  { name: 'Mounting Cost', enum: 'mountingCost', mandatory: false },
  { name: 'Total Price', enum: 'totalPrice', mandatory: false },
  { name: 'Availability', enum: 'availability', mandatory: false },
  { name: 'Extension', enum: 'extension', mandatory: false },
];

export const NatureOfAccountOptions = ['Debitor', 'Creditor'];

export const CompanyTypeOptions = [
  { label: 'National Agency', value: 'nationalAgency' },
  { label: 'Local Agency', value: 'localAgency' },
  { label: 'Direct Client', value: 'directClient' },
  { label: 'Government', value: 'government' },
  { label: 'Media Owner', value: 'mediaOwner' },
  { label: 'Mounter', value: 'mounter' },
  { label: 'Printer', value: 'printer' },
  { label: 'Others', value: 'others' },
];

export const leadStageOptions = [
  {
    label: 'Initiate Discussion',
    value: 'initiateDiscussion',
    color: '#FF900E',
  },
  {
    label: 'In Progress',
    value: 'inProgress',
    color: '#914EFB',
  },
  {
    label: 'Converted',
    value: 'converted',
    color: '#4BC0C0',
  },
  {
    label: 'Lost',
    value: 'lost',
    color: '#FD3434',
  },
];

export const leadPriorityOptions = [
  {
    label: 'Low',
    value: 'low',
    color: '#28B446',
  },
  {
    label: 'Medium',
    value: 'medium',
    color: '#FF900E',
  },
  {
    label: 'High',
    value: 'high',
    color: '#FD3434',
  },
];

export const leadProspectOptions = [
  {
    label: 'Inbound',
    value: 'inbound',
  },
  {
    label: 'Outbound',
    value: 'outbound',
  },
];

export const leadCommunicationTypeOptions = [
  {
    label: 'Email',
    value: 'email',
  },
  {
    label: 'Phone Call',
    value: 'phone',
  },
  {
    label: 'Video Call',
    value: 'videoCall',
  },
  {
    label: 'In Person Meeting',
    value: 'inPersonMeeting',
  },
  {
    label: 'Demo Call',
    value: 'demoCall',
  },
  {
    label: 'In Person Demo',
    value: 'inPersonDemo',
  },
];

export const leadSourceOptions = [
  {
    label: 'Inbound',
    value: 'inbound',
  },
  {
    label: 'Outbound',
    value: 'outbound',
  },
  {
    label: 'Website/Blog',
    value: 'website',
  },
  {
    label: 'Agency',
    value: 'agency',
  },
  {
    label: 'Old Client',
    value: 'oldClient',
  },
  {
    label: 'Social Media (e.g., Facebook, Twitter, Instagram, LinkedIn)',
    value: 'socialMedia',
  },
  {
    label: 'Search Engine (e.g., Google, Bing)',
    value: 'searchEngine',
  },
  {
    label: 'Referral/Word of Mouth',
    value: 'referral',
  },
  {
    label: 'Email Marketing',
    value: 'emailMarketing',
  },
  {
    label: 'Content Marketing (e.g., articles, videos, podcasts)',
    value: 'contentMarketing',
  },
  {
    label: 'Paid Advertising (e.g., Google Ads, Facebook Ads, display ads)',
    value: 'paidAdvertising',
  },
  {
    label: 'Events (e.g., trade shows, conferences, workshops)',
    value: 'events',
  },
  {
    label: 'Direct Mail',
    value: 'directMail',
  },
  {
    label: 'Cold Calling/Telemarketing',
    value: 'telemarketing',
  },
  {
    label: 'Partnerships/Affiliate Programs',
    value: 'affiliate',
  },
  {
    label: 'Networking Events',
    value: 'networking',
  },
  {
    label: 'Print Advertising (e.g., newspapers, magazines)',
    value: 'printAdvertising',
  },
  {
    label: 'Radio/TV Advertising',
    value: 'tvAdvertising',
  },
  {
    label: 'Other',
    value: 'other',
  },
];
