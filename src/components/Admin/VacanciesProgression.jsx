import scrollUp from '@/hooks/useScrollUp';

import { Box, Typography, LinearProgress } from '@mui/material';

const VacanciesProgression = ({ usedValidPackages, totalPackages }) => {
  scrollUp();

  const calculateVacanciesDetails = (packageNameKeyword, totalVacancies) => {
    if (!totalVacancies || totalVacancies === 0) return { percentage: 0, filledVacancies: 0 };

    const filledVacancies =
      Object.entries(usedValidPackages || {}).reduce((acc, [key, value]) => {
        if (key.toLowerCase().includes(packageNameKeyword.toLowerCase())) {
          acc += value;
        }
        return acc;
      }, 0) || 0;

    const percentage = ((filledVacancies / totalVacancies) * 100).toFixed(0);

    return { percentage, filledVacancies };
  };

  const schoolSum =
    (totalPackages?.schoolIndividual || 0) + (totalPackages?.schoolFamily || 0) + (totalPackages?.schoolCamping || 0);

  const schoolIndividualDetails = calculateVacanciesDetails('schoolindividual', totalPackages?.schoolIndividual || 0);
  const schoolFamilyDetails = calculateVacanciesDetails('schoolfamily', totalPackages?.schoolFamily || 0);
  const schoolCampingDetails = calculateVacanciesDetails('schoolcamping', totalPackages?.schoolCamping || 0);
  const seminaryDetails = calculateVacanciesDetails('seminary', totalPackages?.seminary || 0);
  const otherDetails = calculateVacanciesDetails('other', totalPackages?.other || 0);

  const totalVacancies = schoolSum + (totalPackages?.seminary || 0) + (totalPackages?.other || 0);
  const totalFilledVacancies =
    schoolIndividualDetails.filledVacancies +
    schoolFamilyDetails.filledVacancies +
    schoolCampingDetails.filledVacancies +
    seminaryDetails.filledVacancies +
    otherDetails.filledVacancies;
  const totalPercentage = totalVacancies ? ((totalFilledVacancies / totalVacancies) * 100).toFixed(0) : 0;

  const renderProgressBar = (label, details, totalVacancies, color) => (
    <Box mb={3}>
      <Typography variant="h6">{`${label} (${details.filledVacancies}/${totalVacancies})`}</Typography>
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
      <Typography variant="h6">{`Total: (${totalFilledVacancies}/${totalVacancies})`}</Typography>
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={2}>
          <LinearProgress
            variant="determinate"
            value={totalPercentage}
            sx={{
              '.MuiLinearProgress-bar': {
                backgroundColor: '#cddc39',
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
    <>
      <Box>
        {renderProgressBar(
          'Colégio - Individual:',
          schoolIndividualDetails,
          totalPackages?.schoolIndividual,
          '#89c96e',
        )}
        {renderProgressBar('Colégio - Família:', schoolFamilyDetails, totalPackages?.schoolFamily, '#0066cc')}
        {renderProgressBar('Colégio - Camping:', schoolCampingDetails, totalPackages?.schoolCamping, '#795548')}
        {renderProgressBar('Seminário São José:', seminaryDetails, totalPackages?.seminary, '#00bcd4')}
        {renderProgressBar('Outras Acomodações:', otherDetails, totalPackages?.other, '#e91e63')}
        {renderTotalProgressBar()}
      </Box>
    </>
  );
};

export default VacanciesProgression;
