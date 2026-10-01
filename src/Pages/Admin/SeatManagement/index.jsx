import { useState } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { updatePackageCount, updateTotalBusVacancies } from '@/services/packages';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import StatCards from '@/components/Admin/StatCards';
import FormSection from '@/components/Admin/FormSection';

const AdminSeatManagement = ({
  loading,
  loggedUsername,
  handleUpdateTotalBusVacancies,
  handleUpdateTotalPackages,
  handleUpdateTotalSeats,
  totalBusVacancies,
  totalPackages,
  totalSeats,
}) => {
  const { t } = useTranslation();
  const [loadingContent, setLoadingContent] = useState(false);

  const packageLabels = {
    schoolIndividual: t('admin.seats.pkgSchoolIndividual'),
    schoolFamily: t('admin.seats.pkgSchoolFamily'),
    schoolCamping: t('admin.seats.pkgSchoolCamping'),
    seminary: t('admin.seats.pkgSeminary'),
    other: t('admin.seats.pkgOther'),
  };

  const packageOrder = ['schoolIndividual', 'schoolFamily', 'schoolCamping', 'seminary', 'other'];

  scrollUp();

  const updateSeats = async () => {
    const currentTotalPackages = Object.values(totalPackages).reduce((acc, curr) => acc + curr, 0);

    if (totalSeats < currentTotalPackages) {
      toast.error(t('admin.seats.seatsBelowSum', { sum: currentTotalPackages }));
      return;
    }

    try {
      setLoadingContent(true);

      await updatePackageCount({ totalSeats, totalPackages });
      toast.success(t('admin.seats.seatsUpdated'));
      registerLog(`Ajustou a quantidade de vagas totais e por pacote`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      setLoadingContent(false);
    }
  };

  const updateBusVacancies = async () => {
    if (totalBusVacancies < 0) {
      toast.error(t('admin.seats.busNegative'));
      return;
    }

    try {
      setLoadingContent(true);

      await updateTotalBusVacancies({ totalBusVacancies });
      toast.success(t('admin.seats.busUpdated'));
      registerLog(`Ajustou a quantidade de vagas totais do ônibus para ${totalBusVacancies}`, loggedUsername);
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handlePackageChange = (packageType, newPackageValue) => {
    handleUpdateTotalPackages({
      ...totalPackages,
      [packageType]: newPackageValue,
    });
  };

  const sumPackages = packageOrder.reduce((acc, key) => acc + (Number(totalPackages[key]) || 0), 0);
  const undistributedSeats = Number(totalSeats || 0) - sumPackages;

  const seatStats = [
    { label: t('admin.seats.statTotal'), value: Number(totalSeats || 0) },
    { label: t('admin.seats.statDistributed'), value: sumPackages, tone: 'info' },
    {
      label: t('admin.seats.statUndistributed'),
      value: undistributedSeats,
      tone: undistributedSeats < 0 ? 'danger' : 'free',
    },
    { label: t('admin.seats.statBus'), value: Number(totalBusVacancies || 0), tone: 'accent' },
  ];

  return (
    <div className="admin-subpage admin-subpage--seats">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.seats.title')}
        subtitle={t('admin.seats.subtitle')}
        typeIcon="camp"
      />

      <div className="admin-subpage__content">
        <StatCards items={seatStats} />

        <Row className="g-4">
          <Col xs={12} lg={7}>
            <FormSection title={t('admin.seats.sectionSeats')}>
              <Form.Group controlId="inputSeats" className="seat-total-field">
                <Form.Label>{t('admin.seats.totalSeatsLabel')}</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={totalSeats}
                  onChange={(e) => handleUpdateTotalSeats(Number(e.target.value))}
                />
              </Form.Group>

              <div className="seat-packages-grid">
                {packageOrder.map((packageType) => (
                  <Form.Group controlId={`input-${packageType}`} key={packageType}>
                    <Form.Label>{packageLabels[packageType]}:</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={totalPackages[packageType] || 0}
                      onChange={(e) => handlePackageChange(packageType, Number(e.target.value))}
                    />
                  </Form.Group>
                ))}
              </div>

              <div className="d-flex mt-3 justify-content-end">
                <Button variant="teal-blue" onClick={updateSeats}>
                  {t('admin.seats.adjustSeats')}
                </Button>
              </div>
            </FormSection>
          </Col>

          <Col xs={12} lg={5}>
            <FormSection title={t('admin.seats.sectionBus')}>
              <Form.Group controlId="inputBus">
                <Form.Label>{t('admin.seats.totalBusLabel')}</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={totalBusVacancies}
                  onChange={(e) => handleUpdateTotalBusVacancies(Number(e.target.value))}
                />
              </Form.Group>

              <div className="d-flex mt-3 justify-content-end">
                <Button variant="teal-blue" onClick={updateBusVacancies}>
                  {t('admin.seats.adjustBus')}
                </Button>
              </div>
            </FormSection>
          </Col>
        </Row>
        <Loading loading={loading || loadingContent} />
      </div>
    </div>
  );
};

AdminSeatManagement.propTypes = {
  loggedUsername: PropTypes.string,
  totalSeats: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  handleUpdateTotalSeats: PropTypes.func.isRequired,
  totalBusVacancies: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  handleUpdateTotalBusVacancies: PropTypes.func.isRequired,
  totalPackages: PropTypes.object.isRequired,
  handleUpdateTotalPackages: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default AdminSeatManagement;
