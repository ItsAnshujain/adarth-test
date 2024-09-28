import { showNotification } from '@mantine/notifications';
import dayjs from 'dayjs';
import { geocodeByAddress, getLatLng, geocodeByLatLng } from 'react-google-places-autocomplete';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { DATE_FORMAT } from './constants';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const serialize = object => {
  const str = [];
  for (const p in object) {
    if (Object.prototype.hasOwnProperty.call(object, p)) {
      if (object[p] || typeof object[p] === 'boolean' || object[p] === null) {
        str.push(`${encodeURIComponent(p)}=${encodeURIComponent(object[p])}`);
      }
    }
  }

  return str.join('&');
};

export const masterTypes = {
  category: 'Category',
  brand: 'Brand',
  illumination: 'Illumination',
  media_type: 'Media Type',
  tag: 'Tag',
  zone: 'Zone',
  facing: 'Facing',
  demographic: 'Demographic',
  audience: 'Audience',
  space_type: 'Space Type',
  printing_status: 'Printing Status',
  mounting_status: 'Mounting Status',
  booking_campaign_status: 'Booking Campaign Status',
  payment_status: 'Payment Status',
  proposal_status: 'Proposal Status',
  space_status: 'Space Status',
  campaign_status: 'Campaign Status',
  industry: 'Industry',
  operational_cost_type: 'Operational Cost Type',
  organization: 'Organization',
};

/**
 * Debounce function used to delay function invoke that is passed along with a delay.
 * @param {function} func - Function which we want to call after delay
 * @param {number} delay - Delay in milliseconds
 * @returns {function} - Returns a function
 */
export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const spaceTypes = {
  billboard: 'Billboard',
  digital_screen: 'Digital Screen',
  transit_media: 'Transit Media',
  street_furniture: 'Street Furniture',
};

export const categoryColors = {
  grape: 'Billboard',
  green: 'Digital Screen',
  blue: 'Transit Media',
  yellow: 'Street Furnitures',
};

export const tierList = [
  {
    label: 'Tier 1',
    value: 'tier_1',
  },
  {
    label: 'Tier 2',
    value: 'tier_2',
  },
  {
    label: 'Tier 3',
    value: 'tier_3',
  },
];

export const aadhaarFormat = aadhaarNumber => {
  if (aadhaarNumber) {
    const total = aadhaarNumber.split('');
    let aadhaar = '';
    while (total.length > 4) {
      const fourLetter = total.splice(0, 4);
      aadhaar += `${fourLetter.join('')}-`;
    }
    aadhaar += `${total.join('')}`;

    return aadhaar;
  }
  return '';
};

export const roleTypes = {
  'management': 'Management',
  'supervisor': 'Supervisor',
  'associate': 'Associate',
};

// TODO: Remove one roleType object
export const ROLES = {
  ADMIN: 'admin',
  MANAGEMENT: 'management',
  SUPERVISOR: 'supervisor',
  ASSOCIATE: 'associate',
};

/**
 * Get latitute and longitude from address
 * @param {string} address - Address to get latitute and longitude
 * @returns {Promise} - Returns an promise which resolves into object with latitute and longitude
 */
export const getLatituteLongitude = async address => {
  const results = await geocodeByAddress(address);
  const latLng = await getLatLng(results[0]);
  return latLng;
};

/**
 * Get latitute and longitude from address
 * @param {number} lat - latitute to get Address
 * @param {number} lng - longitude to get Address
 * @returns {Promise} - Returns an promise which resolves into object with address
 */
export const getAddressByLatLng = async (lat, lng) => {
  const address = await geocodeByLatLng({ lat, lng });
  return address?.[0];
};

/**
 * Prevent parent onClick event from bubbling
 * @param {event} event - Native click event
 * @param {function} callback - Callback function to invoke
 */
export const handleStopPropagation = (e, cb) => {
  e.stopPropagation();
  cb?.();
};

export const gstRegexMatch =
  /^([0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[Z|z][0-9a-zA-Z]{1}|)$/;

export const panRegexMatch = /^(([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?|)$/;

export const aadhaarRegexMatch = /^\d{12}$/;

export const mobileRegexMatch = /^[6-9]\d{9}$/;

export const faxRegexMatch = /^\+?[0-9]{7,}$/;

export const onlyNumbersMatch = /^[0-9]*$/;

export const pinCodeMatch = /^(\d{4}|\d{6})$/;

export const ifscRegexMatch = /^[A-Za-z]{4}[0-9]{6,7}$/;

export const isValidURL = urlString => {
  if (typeof urlString === typeof '') {
    try {
      return !!new URL(urlString);
    } catch (_err) {
      return false;
    }
  }

  return false;
};

/**
 * Download url
 * @param {string} url - url to download
 */
export const downloadPdf = pdfLink => {
  const link = document.createElement('a');
  link.href = pdfLink;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download multiple files at once
 * @param {array} urls - Array of urls to download
 */
export const downloadAll = urls => {
  const link = document.createElement('a');
  link.setAttribute('target', '_blank');
  document.querySelector('body').appendChild(link);

  urls.forEach(item => {
    link.href = item;
    link.click();
  });

  link.remove();
};

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const monthsInShort = [
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
];

export const quarters = ['First quarter', 'Second quarter', 'Third quarter', 'Fourth quarter'];

export const daysInAWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const supportedTypes = ['JPG', 'JPEG', 'PNG'];

export const indianCurrencyInDecimals = amount => {
  if (Number.isNaN(amount)) {
    return 0;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const dateByQuarter = {
  1: {
    startDate: `${dayjs().year()}-01-01`,
    endDate: `${dayjs().year()}-03-31`,
  },
  2: {
    startDate: `${dayjs().year()}-04-01`,
    endDate: `${dayjs().year()}-06-30`,
  },
  3: {
    startDate: `${dayjs().year()}-07-01`,
    endDate: `${dayjs().year()}-09-30`,
  },
  4: {
    startDate: `${dayjs().year()}-10-01`,
    endDate: `${dayjs().year()}-12-31`,
  },
};

// financial year
export const financialStartDate = new Date(
  new Date().getFullYear() - (new Date().getMonth() < 3 ? 1 : 0),
  3,
  1,
);
export const financialEndDate = new Date(financialStartDate.getFullYear() + 1, 2, 31);

// Format's date in YYYY-MM-DD format
export const formatDate = date => {
  let day = date.getDate();
  let month = date.getMonth() + 1; // Month is zero-based
  const year = date.getFullYear();

  // Add leading zeros if needed
  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;

  return `${year}-${month}-${day}`;
};

export const checkCampaignStats = (currentStatus, item) => {
  const campaignStats = {
    Upcoming: ['Upcoming'],
    Ongoing: ['Upcoming', 'Ongoing'],
    Completed: ['Upcoming', 'Ongoing', 'Completed'],
  };

  return campaignStats[currentStatus?.campaignStatus]?.includes(item);
};

export const checkPrintingStats = (printingStatus = '', item = '') => {
  const printingStats = {
    upcoming: ['upcoming'],
    'in progress': ['upcoming', 'in progress'],
    completed: ['upcoming', 'in progress', 'completed'],
  };

  return printingStats[printingStatus?.toLowerCase()]?.includes(item?.toLowerCase());
};

export const checkMountingStats = (mountingStatus = '', item = '') => {
  const printingStats = {
    upcoming: ['upcoming'],
    'in progress': ['upcoming', 'in progress'],
    completed: ['upcoming', 'in progress', 'completed'],
  };

  return printingStats[mountingStatus?.toLowerCase()]?.includes(item?.toLowerCase());
};

export const orderTitle = {
  purchase: 'Purchase Order',
  release: 'Release Order',
  invoice: 'Invoice',
};

export const alertText = 'Order item details if added, will get cleared if you change a booking';

export const indianMapCoordinates = {
  latitude: 21.125681,
  longitude: 82.794998,
};

export const validateImageResolution = (file, width, height) =>
  new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width <= width && img.height <= height) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    img.onerror = err => reject(err);
    img.src = imageUrl;
  });

export const getDate = (selectionItem, item, key) => {
  if (selectionItem && selectionItem[key]) return new Date(selectionItem[key]);

  if (item && item[key]) return new Date(item[key]);

  return null;
};

export const onApiError = err =>
  showNotification({
    message: err.message,
    color: 'red',
  });

export const getFormattedDimensions = list => {
  const updatedList = [...list];

  updatedList
    .map((item, index) => {
      if (index < 2) {
        return `${item?.width || 0}ft x ${item?.height || 0}ft`;
      }
      return null;
    })
    .filter(item => item !== null)
    .join(', ');

  return updatedList;
};

export const stringToColour = str => {
  if (!str.length) return '';

  let hash = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line no-bitwise
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.substr(-2);
  }
  return colour;
};

export const currentDate = new Date().toISOString();

export const validateFilterRange = (bookingRange, fromDate, toDate) => {
  let filterRange;
  if (bookingRange?.length) {
    filterRange = bookingRange?.filter(
      item =>
        (dayjs(dayjs(fromDate)).isSameOrAfter(dayjs(item?.startDate).format(DATE_FORMAT)) &&
          dayjs(dayjs(fromDate)).isSameOrBefore(dayjs(item?.endDate).format(DATE_FORMAT))) ||
        (dayjs(dayjs(toDate)).isSameOrAfter(dayjs(item?.startDate).format(DATE_FORMAT)) &&
          dayjs(dayjs(toDate)).isSameOrBefore(dayjs(item?.endDate).format(DATE_FORMAT))) ||
        (dayjs(dayjs(item?.startDate).format(DATE_FORMAT)).isSameOrAfter(dayjs(fromDate)) &&
          dayjs(dayjs(item?.startDate).format(DATE_FORMAT)).isSameOrBefore(dayjs(toDate))) ||
        (dayjs(dayjs(item?.endDate).format(DATE_FORMAT)).isSameOrAfter(dayjs(fromDate)) &&
          dayjs(dayjs(item?.endDate).format(DATE_FORMAT)).isSameOrBefore(dayjs(toDate))),
    );

    return filterRange;
  }

  return [];
};

export const getAvailableUnits = (filterRange, fromDate, toDate, units) => {
  const filteredRange = validateFilterRange(
    filterRange,
    dayjs(fromDate).format(DATE_FORMAT),
    dayjs(toDate).format(DATE_FORMAT),
  );

  let bookedUnit = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < filteredRange.length; i++) {
    bookedUnit += filteredRange[i].bookedUnit;
  }
  const availableUnit = units - (bookedUnit || 0);
  return availableUnit < 0 ? 0 : availableUnit;
};

export const getEveryDayUnits = (bookingRange = [], units = 1) => {
  const day = {};

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < bookingRange.length; i++) {
    let sDate = dayjs(bookingRange[i].startDate);
    const eDate = dayjs(bookingRange[i].endDate);

    while (sDate.isSameOrBefore(eDate)) {
      const key = sDate.format(DATE_FORMAT);
      if (day[key]) {
        day[key] = {
          bookedUnit: day[key].bookedUnit + (bookingRange[i].bookedUnit || bookingRange[i].unit),
          remUnit:
            units - (day[key].bookedUnit + (bookingRange[i].bookedUnit || bookingRange[i].unit)) < 0
              ? 0
              : units -
                (day[key].bookedUnit + (bookingRange[i].bookedUnit || bookingRange[i].unit)),
        };
      } else {
        day[key] = {
          bookedUnit: bookingRange[i].bookedUnit || bookingRange[i].unit,
          remUnit:
            units - (bookingRange[i].bookedUnit || bookingRange[i].unit) < 0
              ? 0
              : units - (bookingRange[i].bookedUnit || bookingRange[i].unit),
        };
      }
      sDate = sDate.add(1, 'day');
    }
  }
  return day;
};

export const getOccupiedState = (leftUnit, bookableUnit) => {
  const occupiedState =
    leftUnit === bookableUnit
      ? 'Available'
      : leftUnit !== bookableUnit && leftUnit !== 0
      ? 'Partially Booked'
      : 'Occupied';

  return occupiedState;
};

export const getOccupiedStateColor = (isUnderMaintenance, occupiedState) =>
  isUnderMaintenance
    ? 'yellow'
    : occupiedState === 'Occupied'
    ? 'blue'
    : occupiedState === 'Partially Booked'
    ? 'grape'
    : occupiedState === 'Available'
    ? 'green'
    : 'dark';

export const generateSlNo = (index, page, limit) => {
  let currentPage = page;
  let rowCount = 0;
  if (page < 1) {
    currentPage = 1;
  }
  rowCount = (currentPage - 1) * limit;
  return rowCount + index + 1;
};

export const calculateDaysListByMonth = (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysList = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= daysInMonth; i++) {
    daysList.push(i);
  }
  return daysList;
};

export const timeLegend = {
  dayOfWeek: 'Days',
  dayOfMonth: 'Days',
  quarter: 'Quarters',
  month: 'Months',
};

export const formLabelStyles = {
  label: 'font-bold text-primary text-base mb-2',
  input: 'border-gray-450',
};

export const calculateTotalAmountWithPercentage = (value, percentage) => {
  if (percentage > 0) {
    return Number(
      ((Number(value) || 0) + (Number(value) || 0) * (Number(percentage) / 100)).toFixed(2),
    );
  }

  return Number(value);
};

export const calculateGst = (value, percentage) => {
  if (percentage > 0) {
    return Number(((Number(value) || 0) * (Number(percentage) / 100)).toFixed(2));
  }

  return 0;
};

export const calculateTotalPrice = (option = []) => {
  if (!option.length) return 0;
  const totalPrice = option.reduce((acc, item) => acc + +(item.price || 0), 0);
  return Number(totalPrice?.toFixed(2)) || 0;
};

export const calculateTotalMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return;

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  let totalDays = 0;

  let currDate = start;

  const differenceInDates = end.diff(start, 'days');
  if (differenceInDates < 28) {
    // eslint-disable-next-line consistent-return
    totalDays += differenceInDates + 1;
  } else
    while (currDate.isSameOrBefore(end, 'month')) {
      // Checks if start and end date is of same month
      if (start.isSame(currDate) && start.month() === end.month()) {
        const selectedDaysInMonth = end.get('date') + 1 - currDate.get('date');
        totalDays +=
          selectedDaysInMonth > 30 ||
          (end.get('date') === end.daysInMonth() && start.get('date') === 1)
            ? 30
            : selectedDaysInMonth; // adds selected days if same month
      } else if (start.isSame(currDate)) {
        // checks if currDate is start Date to get date of one day before and one month after
        currDate = currDate.add(1, 'month').subtract(1, 'day');
      }
      // Checks if currDate is < endDate
      if (
        currDate.isSameOrBefore(end) &&
        currDate.month() === end.month() &&
        !start.isSame(currDate)
      ) {
        // for feb month
        if (start.get('month') + 1 === 2 && start.get('date') === 1) {
          if (end.get('date') < 30) {
            totalDays += 30 - (currDate.subtract(1, 'day').daysInMonth() - end.get('date')) + 1;
          } else {
            totalDays += 30;
          }
        } else if (currDate.date() < 30) {
          // adds 30 + the remaining days of endDate
          totalDays += 30;
          totalDays += end.get('date') - currDate.get('date');
        } else {
          totalDays += 30;
        }
      } else if (currDate.isAfter(end) && currDate.month() === end.month()) {
        // for feb month
        if (
          start.get('date') === 1 &&
          (start.get('month') + 1 === 2 || start.get('month') + 1 === 1) &&
          end.get('date') < 30
        ) {
          totalDays += 30 - (currDate.get('date') - end.get('date') + 1);
        } else if (start.get('month') + 1 === 2 && end.get('date') < 30) {
          totalDays += 30 - (currDate.get('date') - end.get('date'));
        }

        // Checks if currDate is > endDate then adds the days of endDate
        else totalDays += 30 - (currDate.get('date') - end.get('date'));
      } else if (!start.isSame(currDate)) {
        totalDays += 30;
      }
      currDate = currDate.add(1, 'month');
    }

  // eslint-disable-next-line consistent-return
  return totalDays / 30;
};

export const calculateTotalArea = (place, unit) =>
  (place?.dimension?.reduce(
    (accumulator, dimension) => accumulator + (dimension.height || 0) * (dimension.width || 0),
    0,
  ) || 0) *
    (unit || 1) *
    (place?.facing?.toLowerCase().includes('single') ||
    place?.location?.facing?.name?.toLowerCase().includes('single')
      ? 1
      : place?.facing?.toLowerCase().includes('double') ||
        place?.location?.facing?.name?.toLowerCase().includes('double')
      ? 2
      : place?.facing?.toLowerCase().includes('triple') ||
        place?.location?.facing?.name.toLowerCase().includes('triple')
      ? 3
      : place?.facing?.toLowerCase().includes('four') ||
        place?.location?.facing?.name.toLowerCase().includes('four')
      ? 4
      : 1) || 0;

export const calculateTotalPrintingOrMountingCost = (item, unit, costPerSqft, gstPercentage) => {
  const updatedTotalArea = calculateTotalArea(item, unit);
  const totalDisplayCost = costPerSqft * updatedTotalArea || 0;

  return calculateTotalAmountWithPercentage(totalDisplayCost, gstPercentage);
};

export const calculateTotalDisplayCost = (item, startDate, endDate, gstPercentage) => {
  const totalMonths = calculateTotalMonths(startDate, endDate);
  const totalDisplayCost =
    calculateTotalArea(item, item?.unit) > 0 ? item.displayCostPerMonth * totalMonths : 0;

  return calculateTotalAmountWithPercentage(totalDisplayCost, gstPercentage);
};

export const calculateDiscountOnDisplayCost = ({
  discountOn,
  value,
  discountPercentage,
  gstPercentage,
}) => {
  if (discountOn === 'displayCost') {
    const discountOnValue = Number(value) * (Number(discountPercentage || null) / 100);
    if (gstPercentage > 0) {
      return calculateTotalAmountWithPercentage(discountOnValue, gstPercentage);
    }
    return Number(discountOnValue);
  }

  return 0;
};
export const calculateTotalCostOfBooking = (item, unit, startDate, endDate) => {
  if (!item) return 0;
  const updatedTotalArea = calculateTotalArea(item, unit);
  const updatedTotalMonths = calculateTotalMonths(startDate, endDate);
  const updatedTotalPrintingCost = updatedTotalArea * (item?.printingCostPerSqft || 0);
  const updatedTotalMountingCost = updatedTotalArea * (item?.mountingCostPerSqft || 0);
  let displayCost = (item?.displayCostPerMonth || 0) * updatedTotalMonths;
  if (item?.discountOn === 'displayCost') {
    displayCost -= (displayCost || 0) * ((item?.discount || 0) / 100);
  }

  const totalDisplayCost =
    updatedTotalArea > 0
      ? calculateTotalAmountWithPercentage(displayCost, item?.displayCostGstPercentage)
      : 0;
  const totalCost = Number(
    (item?.discountedDisplayCost > 0
      ? (item?.discountedDisplayCost || 0) * updatedTotalMonths
      : totalDisplayCost || 0) +
      calculateTotalAmountWithPercentage(updatedTotalPrintingCost, item?.printingGstPercentage) +
      calculateTotalAmountWithPercentage(updatedTotalMountingCost, item?.mountingGstPercentage) +
      (item?.oneTimeInstallationCost || 0) +
      (item?.monthlyAdditionalCost || 0) * updatedTotalMonths -
      (item?.otherCharges || 0),
  );
  return item?.discountOn === 'totalPrice'
    ? Number(((totalCost || 0) - (totalCost || 0) * ((item?.discount || 0) / 100))?.toFixed(2) || 0)
    : Number(totalCost?.toFixed(2)) || 0;
};

export const getUpdatedBookingData = (formData, selectedInventoryId, data, totalPrice, totalArea) =>
  data?.map(place => {
    if (place?._id === selectedInventoryId) {
      return {
        ...place,
        ...formData,
        price: totalPrice,
        totalArea,
        discountedTotalPrice: totalPrice,
        priceChanged: true,
      };
    }
    const area = calculateTotalArea(place, place?.unit);
    const updatedTotalPrintingCost = area * formData.printingCostPerSqft;
    const updatedTotalMountingCost = area * formData.mountingCostPerSqft;

    if (formData.applyPrintingMountingCostForAll && formData.applyDiscountForAll) {
      const updatedTotalPrice = calculateTotalCostOfBooking(
        {
          ...place,
          printingCostPerSqft: formData.printingCostPerSqft,
          printingGstPercentage: formData.printingGstPercentage,
          mountingCostPerSqft: formData.mountingCostPerSqft,
          mountingGstPercentage: formData.mountingGstPercentage,
          discountOn: formData.discountOn,
          discount: formData.discount,
        },
        place?.unit,
        place.startDate,
        place.endDate,
      );
      return {
        ...place,
        printingCostPerSqft: formData.printingCostPerSqft,
        printingGstPercentage: formData.printingGstPercentage,
        mountingGstPercentage: formData.mountingGstPercentage,
        mountingCostPerSqft: formData.mountingCostPerSqft,
        totalPrintingCost: calculateTotalAmountWithPercentage(
          updatedTotalPrintingCost,
          formData.printingGstPercentage,
        ),
        totalMountingCost: calculateTotalAmountWithPercentage(
          updatedTotalMountingCost,
          formData.mountingGstPercentage,
        ),
        price: updatedTotalPrice,
        discountOn: formData.discountOn,
        discount: formData.discount,
        applyPrintingMountingCostForAll: true,
        applyDiscountForAll: true,
      };
    }

    if (formData.applyPrintingMountingCostForAll) {
      const updatedTotalPrice = calculateTotalCostOfBooking(
        {
          ...place,
          printingCostPerSqft: formData.printingCostPerSqft,
          printingGstPercentage: formData.printingGstPercentage,
          mountingCostPerSqft: formData.mountingCostPerSqft,
          mountingGstPercentage: formData.mountingGstPercentage,
        },
        place?.unit,
        place.startDate,
        place.endDate,
      );
      return {
        ...place,
        printingCostPerSqft: Number(formData.printingCostPerSqft?.toFixed(2)),
        printingGstPercentage: formData.printingGstPercentage,
        mountingGstPercentage: formData.mountingGstPercentage,
        mountingCostPerSqft: Number(formData.mountingCostPerSqft?.toFixed(2)),
        totalPrintingCost: calculateTotalAmountWithPercentage(
          updatedTotalPrintingCost,
          formData.printingGstPercentage,
        ),
        totalMountingCost: calculateTotalAmountWithPercentage(
          updatedTotalMountingCost,
          formData.mountingGstPercentage,
        ),
        price: updatedTotalPrice,
        applyPrintingMountingCostForAll: true,
        applyDiscountForAll: false,
      };
    }

    if (formData.applyDiscountForAll) {
      const updatedTotalPrice = calculateTotalCostOfBooking(
        {
          ...place,
          discount: formData.discount,
          discountOn: formData.discountOn,
        },
        place?.unit,
        place.startDate,
        place.endDate,
      );
      return {
        ...place,
        price: updatedTotalPrice,
        discountOn: formData.discountOn,
        discount: formData.discount,
        applyDiscountForAll: true,
        applyPrintingMountingCostForAll: false,
      };
    }

    return { ...place, applyPrintingMountingCostForAll: false, applyDiscountForAll: false };
  });

export const getUpdatedProposalData = (
  formData,
  selectedInventoryId,
  proposalData,
  totalPrice,
  totalArea,
) =>
  proposalData?.map(place => {
    const area = calculateTotalArea(place, place?.unit);

    const updatedTotalPrintingCost = area * formData.printingCostPerSqft;
    const updatedTotalMountingCost = area * formData.mountingCostPerSqft;

    const updatedTotalPrice = calculateTotalCostOfBooking(
      {
        ...place,
        printingCostPerSqft: formData.printingCostPerSqft,
        mountingCostPerSqft: formData.mountingCostPerSqft,
      },
      place?.unit,
      place.startDate,
      place.endDate,
    );

    return place?._id === selectedInventoryId
      ? {
          ...place,
          displayCostPerMonth: formData.displayCostPerMonth,
          totalDisplayCost: formData.totalDisplayCost,
          displayCostPerSqFt: formData.displayCostPerSqFt,
          printingCostPerSqft: formData.printingCostPerSqft,
          totalPrintingCost: formData.totalPrintingCost,
          mountingCostPerSqft: formData.mountingCostPerSqft,
          totalMountingCost: formData.totalMountingCost,
          oneTimeInstallationCost: formData.oneTimeInstallationCost,
          monthlyAdditionalCost: formData.monthlyAdditionalCost,
          otherCharges: formData.otherCharges,
          subjectToExtension: formData.subjectToExtension,
          price: totalPrice,
          totalArea,
          priceChanged: true,
          discountedDisplayCost: formData.discountedDisplayCost,
          applyPrintingMountingCostForAll: formData.applyPrintingMountingCostForAll,
        }
      : formData.applyPrintingMountingCostForAll
      ? {
          ...place,
          printingCostPerSqft: formData.printingCostPerSqft,
          mountingCostPerSqft: formData.mountingCostPerSqft,
          totalPrintingCost: updatedTotalPrintingCost,
          totalMountingCost: updatedTotalMountingCost,
          price: updatedTotalPrice,
          applyPrintingMountingCostForAll: true,
        }
      : { ...place, applyPrintingMountingCostForAll: false };
  });
