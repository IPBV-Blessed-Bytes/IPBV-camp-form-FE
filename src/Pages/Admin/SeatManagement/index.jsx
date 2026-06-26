import { useState } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { registerLog } from '@/services/logs';
import { updatePackageCount, updateTotalBusVacancies } from '@/services/packages';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';

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
  const [loadingContent, setLoadingContent] = useState(false);

  const packageLabels = {
    schoolIndividual: 'Colégio Individual',
    schoolFamily: 'Colégio Família',
    schoolCamping: 'Colégio Camping',
    seminary: 'Seminário',
    other: 'Outra Hospedagem Externa',
  };

  const packageOrder = ['schoolIndividual', 'schoolFamily', 'schoolCamping', 'seminary', 'other'];

  scrollUp();

  const updateSeats = async () => {
    const currentTotalPackages = Object.values(totalPackages).reduce((acc, curr) => acc + curr, 0);

    if (totalSeats < currentTotalPackages) {
      toast.error(
        `A quantidade de vagas totais não pode ser inferior à soma das vagas por pacotes que é de ${currentTotalPackages}!`,
      );
      return;
    }

    try {
      setLoadingContent(true);

      await updatePackageCount({ totalSeats, totalPackages });
      toast.success(`Quantidade de vagas totais e por pacote ajustadas com sucesso`);
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
      toast.error(`A quantidade de vagas de ônibus não pode ser menor que 0!`);
      return;
    }

    try {
      setLoadingContent(true);

      await updateTotalBusVacancies({ totalBusVacancies });
      toast.success(`Quantidade de vagas totais do ônibus ajustadas com sucesso`);
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

  return (
    <div className="admin-subpage admin-subpage--seats">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Gerenciamento de Vagas"
        subtitle="Vagas totais, por pacote e de ônibus"
        typeIcon="camp"
      />

      <div className="admin-subpage__content">
        <div className="seat-summary">
          <div className="seat-summary__card">
            <span className="seat-summary__label">Vagas totais</span>
            <span className="seat-summary__value">{Number(totalSeats || 0)}</span>
          </div>
          <div className="seat-summary__card">
            <span className="seat-summary__label">Distribuídas em pacotes</span>
            <span className="seat-summary__value">{sumPackages}</span>
          </div>
          <div className={`seat-summary__card ${undistributedSeats < 0 ? 'seat-summary__card--warn' : ''}`}>
            <span className="seat-summary__label">Não distribuídas</span>
            <span className="seat-summary__value">{undistributedSeats}</span>
          </div>
          <div className="seat-summary__card">
            <span className="seat-summary__label">Vagas no ônibus</span>
            <span className="seat-summary__value">{Number(totalBusVacancies || 0)}</span>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} lg={7}>
            <Form className="admin-panel">
              <h2 className="admin-panel__title">Vagas e pacotes</h2>

              <Form.Group controlId="inputSeats" className="seat-total-field">
                <Form.Label>
                  <b>Vagas Totais Inscritos:</b>
                </Form.Label>
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
                    <Form.Label>
                      <b>{packageLabels[packageType]}:</b>
                    </Form.Label>
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
                  Ajustar Vagas Pacotes
                </Button>
              </div>
            </Form>
          </Col>

          <Col xs={12} lg={5}>
            <Form className="admin-panel">
              <h2 className="admin-panel__title">Vagas de ônibus</h2>
              <Form.Group controlId="inputBus">
                <Form.Label>
                  <b>Vagas Totais no Ônibus:</b>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={totalBusVacancies}
                  onChange={(e) => handleUpdateTotalBusVacancies(Number(e.target.value))}
                />
              </Form.Group>

              <div className="d-flex mt-3 justify-content-end">
                <Button variant="teal-blue" onClick={updateBusVacancies}>
                  Ajustar Vagas Ônibus
                </Button>
              </div>
            </Form>
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
