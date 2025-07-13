import { Box, Typography, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';

const CheckinBalance = ({ fillingVacancies = [], usedPackages }) => {
  const calculateCheckinDetails = (packageNameKeyword, totalUsed) => {
    if (!totalUsed || totalUsed === 0) return { percentage: 0, checkins: 0 };

    const checkins =
      fillingVacancies?.filter((vacancy) => {
        return vacancy.accomodation.name?.toLowerCase().includes(packageNameKeyword.toLowerCase()) && vacancy.checkin;
      }).length || 0;

    const percentage = ((checkins / totalUsed) * 100).toFixed(0);
    return { percentage, checkins };
  };

  const usedIndividualSchool =
    usedPackages?.schoolIndividualWithBusWithFood +
    usedPackages?.schoolIndividualWithBusWithoutFood +
    usedPackages?.schoolIndividualWithoutBusWithFood +
    usedPackages?.schoolIndividualWithoutBusWithoutFood;

  const usedFamilySchool =
    usedPackages?.schoolFamilyWithBusWithFood +
    usedPackages?.schoolFamilyWithBusWithoutFood +
    usedPackages?.schoolFamilyWithoutBusWithFood +
    usedPackages?.schoolFamilyWithoutBusWithoutFood;

  const usedCampingSchool =
    usedPackages?.schoolCampingWithoutBusWithFood + usedPackages?.schoolCampingWithoutBusWithoutFood;

  const usedSeminary = usedPackages?.seminaryWithBusWithFood + usedPackages?.seminaryWithoutBusWithFood;

  const usedOther =
    usedPackages?.otherWithBusWithFood +
    usedPackages?.otherWithoutBusWithFood +
    usedPackages?.otherWithoutBusWithoutFood;

  const schoolIndividualDetails = calculateCheckinDetails('Colegio Individual', usedIndividualSchool);
  const schoolFamilyDetails = calculateCheckinDetails('Colegio Familia', usedFamilySchool);
  const schoolCampingDetails = calculateCheckinDetails('Colegio Camping', usedCampingSchool);
  const seminaryDetails = calculateCheckinDetails('Seminario Individual', usedSeminary);
  const otherDetails = calculateCheckinDetails('Outra', usedOther);

  const totalUsed = usedIndividualSchool + usedFamilySchool + usedCampingSchool + usedSeminary + usedOther;
  const totalCheckins =
    schoolIndividualDetails.checkins +
    schoolFamilyDetails.checkins +
    schoolCampingDetails.checkins +
    seminaryDetails.checkins +
    otherDetails.checkins;
  const totalPercentage = totalUsed ? ((totalCheckins / totalUsed) * 100).toFixed(0) : 0;

  const renderProgressBar = (label, details, usedByPackage, color) => (
    <Box mb={3}>
      <Typography variant="h6">{`${label} (${details.checkins}/${usedByPackage})`}</Typography>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={2}>
          <LinearProgress
            variant="determinate"
            value={details.percentage}
            sx={{
              '.MuiLinearProgress-bar': {
                backgroundColor: color,
              },
              backgroundColor: '#e0e0e0',
              height: 10,
              borderRadius: 5,
            }}
          />
        </Box>
        <Typography variant="body2">{`${details.percentage}%`}</Typography>
      </Box>
    </Box>
  );

  const renderTotalProgressBar = () => (
    <Box mb={3}>
      <Typography variant="h6">{`Total: (${totalCheckins}/${totalUsed})`}</Typography>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={2}>
          <LinearProgress
            variant="determinate"
            value={totalPercentage}
            sx={{
              '.MuiLinearProgress-bar': {
                backgroundColor: '#9c27b0',
              },
              backgroundColor: '#e0e0e0',
              height: 10,
              borderRadius: 5,
            }}
          />
        </Box>
        <Typography variant="body2">{`${totalPercentage}%`}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      {renderProgressBar('Colégio - Individual:', schoolIndividualDetails, usedIndividualSchool, '#4caf50')}
      {renderProgressBar('Colégio - Família:', schoolFamilyDetails, usedFamilySchool, '#cfe2ff')}
      {renderProgressBar('Colégio - Camping:', schoolCampingDetails, usedCampingSchool, '#ffcccc')}
      {renderProgressBar('Seminário São José:', seminaryDetails, usedSeminary, '#2196f3')}
      {renderProgressBar('Outras Acomodações:', otherDetails, usedOther, '#ff9800')}
      {renderTotalProgressBar()}
    </Box>
  );
};

CheckinBalance.propTypes = {
  fillingVacancies: PropTypes.arrayOf(
    PropTypes.shape({
      checkin: PropTypes.bool,
    }),
  ),
  usedPackages: PropTypes.shape({
    schoolCampingWithoutBusWithFood: PropTypes.number,
    schoolCampingWithoutBusWithoutFood: PropTypes.number,
    schoolFamilyWithBusWithFood: PropTypes.number,
    schoolFamilyWithBusWithoutFood: PropTypes.number,
    schoolFamilyWithoutBusWithFood: PropTypes.number,
    schoolFamilyWithoutBusWithoutFood: PropTypes.number,
    schoolIndividualWithBusWithFood: PropTypes.number,
    schoolIndividualWithBusWithoutFood: PropTypes.number,
    schoolIndividualWithoutBusWithFood: PropTypes.number,
    schoolIndividualWithoutBusWithoutFood: PropTypes.number,
    seminaryWithBusWithFood: PropTypes.number,
    seminaryWithoutBusWithFood: PropTypes.number,
    otherWithBusWithFood: PropTypes.number,
    otherWithoutBusWithFood: PropTypes.number,
    otherWithoutBusWithoutFood: PropTypes.number,
  }),
};

export default CheckinBalance;
