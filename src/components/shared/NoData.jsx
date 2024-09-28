import PropTypes from 'prop-types';

const NoData = ({ type }) => {
  switch (type) {
    case 'unknown':
      return '???';
    case 'na':
      return 'N/A';
    case 'upcoming':
      return '-------';

    default:
      return '-------';
  }
};

NoData.propTypes = {
  type: PropTypes.oneOf(['unknown', 'na', 'upcoming']),
};

export default NoData;
