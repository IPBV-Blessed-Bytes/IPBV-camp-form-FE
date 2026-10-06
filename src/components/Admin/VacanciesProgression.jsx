import PropTypes from 'prop-types';
import scrollUp from '@/hooks/useScrollUp';
import { Box, Typography, LinearProgress } from '@mui/material';

const VacanciesProgression = ({ hospedagemLotTotal, hospedagemLotUsed }) => {
  scrollUp();

  const used = Number(hospedagemLotUsed || 0);
  const hasLimit = hospedagemLotTotal !== null && hospedagemLotTotal !== undefined;
  const total = Number(hospedagemLotTotal || 0);
  const percentage = hasLimit && total > 0 ? Number(((used / total) * 100).toFixed(0)) : 0;

  return (
    <Box>
      {hasLimit ? (
        <Box mb={3}>
          <Typography variant="h6">{`Hospedagem — Lote atual (${used}/${total})`}</Typography>
          <Box display="flex" alignItems="center">
            <Box width="100%" mr={2}>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  '.MuiLinearProgress-bar': {
                    backgroundColor: percentage >= 100 ? '#e91e63' : '#00bcd4',
                  },
                  backgroundColor: '#e0e0e0',
                  height: 10,
                  borderRadius: 5,
                }}
              />
            </Box>
            <Typography variant="body2">{`${percentage}%`}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {percentage >= 100
              ? 'Lote esgotado para hospedagem.'
              : `Soma de todas as acomodações no lote atual.`}
          </Typography>
        </Box>
      ) : (
        <Box mb={3}>
          <Typography variant="h6">{`Hospedagem — Lote atual: ${used} inscritos`}</Typography>
          <Typography variant="body2" color="text.secondary">
            Vagas ilimitadas — defina um total por lote na tela de Lotes para controlar o esgotamento.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

VacanciesProgression.propTypes = {
  hospedagemLotTotal: PropTypes.number,
  hospedagemLotUsed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default VacanciesProgression;
