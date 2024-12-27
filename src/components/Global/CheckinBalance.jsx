import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const CheckinBalance = ({ fillingVacancies = [], usedPackages }) => {
  const calculateCheckinDetails = (packageNameKeyword, totalUsed) => {
    if (!totalUsed || totalUsed === 0) return { percentage: 0, checkins: 0 };

    const checkins =
      fillingVacancies?.filter((vacancy) => {
        return vacancy.accomodationName?.toLowerCase().includes(packageNameKeyword.toLowerCase()) && vacancy.checkin;
      }).length || 0;

    const percentage = ((checkins / totalUsed) * 100).toFixed(0);
    return { percentage, checkins };
  };

  const usedSchool =
    usedPackages?.schoolCampingWithoutBusWithFood +
    usedPackages?.schoolCampingWithoutBusWithoutFood +
    usedPackages?.schoolFamilyWithBusWithFood +
    usedPackages?.schoolFamilyWithBusWithoutFood +
    usedPackages?.schoolFamilyWithoutBusWithFood +
    usedPackages?.schoolFamilyWithoutBusWithoutFood +
    usedPackages?.schoolIndividualWithBusWithFood +
    usedPackages?.schoolIndividualWithBusWithoutFood +
    usedPackages?.schoolIndividualWithoutBusWithFood +
    usedPackages?.schoolIndividualWithoutBusWithoutFood;

  const usedSeminary = usedPackages?.seminaryWithBusWithFood + usedPackages?.seminaryWithoutBusWithFood;

  const usedOther =
    usedPackages?.otherWithBusWithFood +
    usedPackages?.otherWithoutBusWithFood +
    usedPackages?.otherWithoutBusWithoutFood;

  const schoolDetails = calculateCheckinDetails('Colegio XV de Novembro', usedSchool);
  const seminaryDetails = calculateCheckinDetails('Seminario Sao Jose', usedSeminary);
  const otherDetails = calculateCheckinDetails('Outra Acomodacao Externa', usedOther);

  const totalUsed = usedSchool + usedSeminary + usedOther;
  const totalCheckins = schoolDetails.checkins + seminaryDetails.checkins + otherDetails.checkins;
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
      {renderProgressBar('Colégio XV de Novembro:', schoolDetails, usedSchool, '#4caf50')}
      {renderProgressBar('Seminário São José:', seminaryDetails, usedSeminary, '#2196f3')}
      {renderProgressBar('Outras Acomodações:', otherDetails, usedOther, '#ff9800')}
      {renderTotalProgressBar()}
    </Box>
  );
};

export default CheckinBalance;
