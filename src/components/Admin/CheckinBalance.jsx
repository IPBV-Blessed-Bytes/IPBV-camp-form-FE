import { Box, Typography, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';

const CheckinBalance = ({ fillingVacancies = [], usedPackages = {} }) => {
  const normalizeString = (str = '') =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const calculateCheckinDetails = (keyword, totalUsed) => {
    if (!totalUsed || totalUsed === 0) return { percentage: 0, checkins: 0 };

    const normalizedKeyword = normalizeString(keyword);

    const checkins =
      fillingVacancies?.filter((vacancy) => {
        const normalizedName = normalizeString(vacancy.accomodationName);

        const nameMatch = normalizedName.includes(normalizedKeyword);

        return nameMatch && vacancy.checkin;
      }).length || 0;

    const percentage = Number(((checkins / totalUsed) * 100).toFixed(0));
    return { percentage, checkins };
  };

  const usedCollectiveSchool = usedPackages?.['host-college-collective'] || 0;

  const usedFamilySchool = usedPackages?.['host-college-family'] || 0;

  const usedCampingSchool = usedPackages?.['host-college-camping'] || 0;

  const usedSeminary = usedPackages?.['host-seminario'] || 0;

  const usedOther = usedPackages?.['host-external'] || 0;

  const schoolCollectiveDetails = calculateCheckinDetails('Colégio Quarto Coletivo', usedCollectiveSchool);
  const schoolFamilyDetails = calculateCheckinDetails('Colégio Quarto Família', usedFamilySchool);
  const schoolCampingDetails = calculateCheckinDetails('Colégio Camping', usedCampingSchool);
  const seminaryDetails = calculateCheckinDetails('Seminário', usedSeminary);
  const otherDetails = calculateCheckinDetails('Externo', usedOther);

  const totalUsed = usedCollectiveSchool + usedFamilySchool + usedCampingSchool + usedSeminary + usedOther;
  const totalCheckins =
    schoolCollectiveDetails.checkins +
    schoolFamilyDetails.checkins +
    schoolCampingDetails.checkins +
    seminaryDetails.checkins +
    otherDetails.checkins;

  const totalPercentage = totalUsed ? Number(((totalCheckins / totalUsed) * 100).toFixed(0)) : 0;

  const renderProgressBar = (label, details, usedByPackage, color) => (
    <Box mb={3}>
      <Typography variant="h6">{`${label} (${details.checkins}/${usedByPackage})`}</Typography>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={2}>
          <LinearProgress
            variant="determinate"
            value={details.percentage}
            sx={{
              '.MuiLinearProgress-bar': { backgroundColor: color },
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
              '.MuiLinearProgress-bar': { backgroundColor: '#d32f2f' },
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
      {renderProgressBar('Colégio - Coletivo:', schoolCollectiveDetails, usedCollectiveSchool, '#4caf50')}
      {renderProgressBar('Colégio - Família:', schoolFamilyDetails, usedFamilySchool, '#2196f3')}
      {renderProgressBar('Colégio - Camping:', schoolCampingDetails, usedCampingSchool, '#ff9800')}
      {renderProgressBar('Seminário São José:', seminaryDetails, usedSeminary, '#9c27b0')}
      {renderProgressBar('Outras Acomodações:', otherDetails, usedOther, '#000')}
      {renderTotalProgressBar()}
    </Box>
  );
};

CheckinBalance.propTypes = {
  fillingVacancies: PropTypes.arrayOf(
    PropTypes.shape({
      accomodationName: PropTypes.string,
      checkin: PropTypes.bool,
    }),
  ),
  usedPackages: PropTypes.object,
};

export default CheckinBalance;
