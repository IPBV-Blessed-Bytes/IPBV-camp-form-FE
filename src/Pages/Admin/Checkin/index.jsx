import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import AdminHeader from '@/components/Admin/Header/AdminHeader';

const AdminCheckin = ({ loggedUsername }) => {
  const [cpf, setCpf] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState(false);

  scrollUp();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetcher.get('aggregate/room');
        if (response.status === 200) {
          setRooms(response.data);
        }
      } catch (error) {
        toast.error('Erro ao carregar quartos');
        console.error('Erro ao buscar quartos:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleSearchUser = async () => {
    try {
      setLoading(true);
      const response = await fetcher.get('camper', {
        params: {
          size: 100000,
        },
      });

      if (response.status === 200) {
        const user = response.data.content.find((u) => u.personalInformation.cpf === cpf);

        if (user) {
          setUserInfo(user);
          setCheckinStatus(user.checkin);
          toast.success('Usuário encontrado com sucesso');

          const [day, month, year] = user.personalInformation.birthday.split('/');
          const birthDate = new Date(`${year}-${month}-${day}`);
          const age = calculateAge(birthDate);

          if (age <= 10) {
            toast.warn(`Usuário tem ${age < 2 ? `${age} ano` : `${age} anos`} de idade. Atenção ao revisar os dados!`);
          }
        } else {
          toast.error('Usuário não encontrado');
          setUserInfo(null);
          setCheckinStatus(false);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
      setUserInfo(null);
      setCheckinStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeBR = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleCheckin = async () => {
    if (!userInfo) {
      toast.error('Primeiro busque por um usuário antes de realizar o check-in');
      return;
    }

    try {
      setLoading(true);
      const checkinTime = formatDateTimeBR();

      await fetcher.patch(`camper/checkin/${userInfo.id}`, {
        checkin: checkinStatus,
        checkinTime: checkinTime,
      });

      if (checkinStatus === true) {
        toast.success('Check-in realizado com sucesso');
        registerLog(`Fez check-in para o usuário ${userInfo.personalInformation.name}`, loggedUsername);
      } else {
        toast.success('Status de Check-in atualizado para não checado');
        registerLog(
          `Atualizou o status de checkin do usuário ${userInfo.personalInformation.name} para não checado`,
          loggedUsername,
        );
      }
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      toast.error('Erro ao realizar check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => e.key === 'Enter' && handleSearchUser();

  const userRoom = rooms.find((room) => room.campers.some((camper) => camper.cpf === cpf));

  const userWristbands = [];

  const accomodationName = userInfo?.package?.accomodation?.name;
  const foodName = userInfo?.package?.food?.name;

  const isSchoolAccommodation = ['Colégio Quarto Coletivo', 'Colégio Quarto Família', 'Colégio Camping'].includes(
    accomodationName,
  );

  if (isSchoolAccommodation) {
    userWristbands.push('#FFFF00');
  }

  if (foodName === 'Alimentação Completa (Café da manhã, Almoço e Jantar)') {
    userWristbands.push('#0000FF');
  } else if (foodName === 'Alimentação Parcial (Almoço e Jantar)') {
    userWristbands.push('#D36AD6');
  } else {
    userWristbands.push('#000000');
  }

  return (
    <Container fluid>
      <AdminHeader pageName="Check-in de Usuário" sessionTypeIcon="checkin" iconSize={80} fill={'#204691'} />

      <Row className="mb-3">
        <Col lg={8} md={8} xs={8}>
          <Form.Group controlId="cpf">
            <Form.Label>
              <b>CPF do Usuário:</b>
            </Form.Label>
            <Form.Control
              type="number"
              placeholder="Digite o CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              size="lg"
              onKeyDown={handleKeyDown}
            />
          </Form.Group>
        </Col>
        <Col lg={4} md={4} xs={4} className="d-flex align-items-end">
          <Button onClick={handleSearchUser} size="lg" disabled={!cpf}>
            <Icons typeIcon="m-glass" iconSize={25} fill="#fff" />
            <span className="d-none d-md-inline">&nbsp;Buscar Usuário</span>
          </Button>
        </Col>
      </Row>

      {userInfo && (
        <>
          <Row className="my-3 p-0 checkin-color-status-wrapper">
            {userWristbands.map((color, index) => (
              <div key={index} className="checkin-color-status-wrapper__line" style={{ background: color }} />
            ))}
          </Row>
          <Row className="mb-2">
            <Col className="form-label">
              <b>Informações do Usuário:</b>
            </Col>
          </Row>
          <Row>
            <Col lg={6} md={6} xs={12}>
              <p>
                <strong>Nome:</strong>{' '}
                <span className="emphasize-checkin-username">{userInfo.personalInformation.name}</span>
              </p>
              <p>
                <strong>Forma de Pagamento:</strong>{' '}
                {userInfo.formPayment.formPayment === 'creditCard'
                  ? 'Cartão de Crédito'
                  : userInfo.formPayment.formPayment === 'pix'
                  ? 'PIX'
                  : userInfo.formPayment.formPayment === 'boleto'
                  ? 'Boleto Bancário à Vista'
                  : userInfo.formPayment.formPayment === 'installmentBill'
                  ? 'Boleto Bancário Parcelado'
                  : 'Não Pagante'}
              </p>
              <p>
                <strong>Valor do Pagamento:</strong> {userInfo.totalPrice}
              </p>
              <p>
                <strong>Observação:</strong> {userInfo.observation}
              </p>
            </Col>
            <Col lg={6} md={6} xs={12}>
              <p>
                <strong>Data de Nascimento:</strong> {userInfo.personalInformation.birthday}
              </p>
              <p>
                <strong>Hospedagem:</strong> {userInfo.package.accomodationName}
              </p>
              <p>
                <strong>Quarto:</strong> {userRoom?.name || 'Não alocado'}
              </p>
              <p>
                <strong>Alimentação:</strong> {userInfo.package.foodName || '-'}
              </p>
              <p>
                <strong>Dias de Refeição Extra:</strong>{' '}
                {userInfo.extraMeals.extraMeals ? userInfo.extraMeals.extraMeals : '-'}
              </p>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={8} md={7} xs={8} className="mb-2">
              <Form.Group controlId="checkinStatus">
                <Form.Label>
                  <b>Check-in realizado?</b>
                </Form.Label>
                <Form.Select
                  value={checkinStatus}
                  onChange={(e) => setCheckinStatus(e.target.value === 'true')}
                  size="lg"
                >
                  <option value={false}>Não</option>
                  <option value={true}>Sim</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={4} md={5} xs={4} className="d-flex align-items-end mb-2">
              <Button variant="success" onClick={handleCheckin} size="lg" disabled={checkinStatus === null}>
                <Icons typeIcon="checked" iconSize={20} fill="#fff" />
                <span className="d-none d-md-inline">&nbsp;Atualizar Check-in</span>
              </Button>
            </Col>
          </Row>
        </>
      )}

      <Loading loading={loading} />
    </Container>
  );
};

AdminCheckin.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminCheckin;
