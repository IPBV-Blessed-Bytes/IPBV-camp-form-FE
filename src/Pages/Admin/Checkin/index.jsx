import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import { permissions } from '@/fetchers/permissions';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Tools from '@/components/Admin/Header/Tools';

const AdminCheckin = ({ loggedUsername, userRole }) => {
  const [cpf, setCpf] = useState('');
  const [cpfLoading, setCpfLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState(false);
  const [userWristbands, setUserWristbands] = useState([]);
  const [cpfMatches, setCpfMatches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { formContext } = useContext(AuthContext);
  const campersTableButton = permissions(userRole, 'campers-table-button-checkin');
  const navigate = useNavigate();

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

  const searchUsersByCpfPrefix = async (cpfPrefix) => {
    try {
      setCpfLoading(true);
      setCpfMatches([]);
      setShowSuggestions(true);

      const response = await fetcher.get('camper', {
        params: {
          size: MAX_SIZE_CAMPERS,
        },
      });

      if (response.status === 200) {
        const matches = response.data.content.filter((u) => u.personalInformation.cpf.startsWith(cpfPrefix));

        setCpfMatches(matches);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setCpfLoading(false);
    }
  };

  useEffect(() => {
    if (cpf.length < 3) {
      setCpfMatches([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(() => {
      searchUsersByCpfPrefix(cpf);
    }, 400);

    return () => clearTimeout(timeout);
  }, [cpf]);

  const normalizeText = (text = '') =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ç/g, 'c')
      .trim();

  const fetchUserWristbands = async (userId, foodName, teamName) => {
    try {
      const response = await fetcher.get('/user-wristbands', {
        params: { userId },
      });

      if (response.status !== 200) return;

      const wristbandsResponse = response.data;

      const activeBands = wristbandsResponse.filter((band) => band.active);

      const teamBands = activeBands.filter((band) => band.type === 'TEAM');
      const foodBands = activeBands.filter((band) => band.type === 'FOOD');

      const wristbands = [];

      if (foodName) {
        const normalizedFoodName = normalizeText(foodName);
        const matchedFood = foodBands.find((band) => normalizeText(band.label) === normalizedFoodName);

        wristbands.push({
          id: 'food',
          label: matchedFood?.label || '',
          color: matchedFood?.color || '',
        });
      }

      if (teamName) {
        const normalizedTeamName = normalizeText(teamName);

        const matchedTeam = teamBands.find((band) => normalizeText(band.label) === normalizedTeamName);

        wristbands.push({
          id: 'team',
          label: matchedTeam?.label || '',
          color: matchedTeam?.color || '',
        });
      }

      setUserWristbands(wristbands);
    } catch (error) {
      console.error('Erro ao buscar pulseiras:', error);
      toast.error('Erro ao carregar pulseiras do usuário');
      setUserWristbands([]);
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

  const userRoom = rooms.find((room) => room.campers.some((camper) => camper.cpf === cpf));

  const goToCampersTable = () => {
    formContext === 'maintenance' ? navigate('/dev/acampantes') : navigate('/admin/acampantes');
  };

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'campers-table',
      name: 'Tabela de Acampantes',
      onClick: () => goToCampersTable(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'add-person',
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Check-in de Usuário" sessionTypeIcon="checkin" iconSize={80} fill={'#007185'} />

      {campersTableButton && <Tools buttons={toolsButtons} />}

      <Row className="mb-3">
        <Col xs={12}>
          <Form.Group controlId="cpf">
            <Form.Label>
              <b>CPF do Usuário:</b>
            </Form.Label>
            <Form.Control
              autoComplete="off"
              type="text"
              placeholder="Digite o CPF"
              value={cpf}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCpf(value);
                setUserInfo(null);
              }}
              size="lg"
            />
          </Form.Group>
        </Col>
        {showSuggestions && !userInfo && (
          <Col xs={12}>
            <div className="cpf-suggestions">
              {cpfLoading ? (
                <div className="cpf-suggestions-loading">
                  <span className="dot-typing">
                    <span />
                  </span>
                </div>
              ) : cpfMatches.length > 0 ? (
                cpfMatches.map((user) => (
                  <div
                    key={user.id}
                    className="cpf-suggestions-item"
                    onClick={() => {
                      setCpf(user.personalInformation.cpf);
                      setUserInfo(user);
                      setCheckinStatus(user.checkin);
                      setCpfMatches([]);
                      setShowSuggestions(false);
                      fetchUserWristbands(user.id, user.package.foodName, user.teamName);

                      toast.success('Usuário selecionado');

                      const [day, month, year] = user.personalInformation.birthday.split('/');
                      const birthDate = new Date(`${year}-${month}-${day}`);
                      const age = calculateAge(birthDate);

                      if (age <= 10) {
                        toast.warn(
                          `Usuário tem ${
                            age < 2 ? `${age} ano` : `${age} anos`
                          } de idade. Atenção ao revisar os dados!`,
                        );
                      }
                    }}
                  >
                    <strong>{user.personalInformation.name}</strong>
                    <span>{user.personalInformation.cpf}</span>
                  </div>
                ))
              ) : (
                <div className="cpf-suggestions-empty">Nenhum usuário encontrado para este CPF</div>
              )}
            </div>
          </Col>
        )}
      </Row>

      {userInfo && (
        <>
          <Row className="my-3 p-0 checkin-color-status-wrapper">
            {userWristbands.map((band) => (
              <div key={band.id} className="checkin-color-status-wrapper__item px-0">
                <span className="checkin-color-status-wrapper__label pl-2">
                  {band.id === 'food' ? 'Pulseira Alimentação:' : 'Pulseira Time:'}
                </span>
                <div className="checkin-color-status-wrapper__line" style={{ background: band.color }} />
              </div>
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
                  : userInfo.formPayment.formPayment === 'ticket'
                  ? 'Boleto Bancário'
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
                <strong>Time:</strong> {userInfo.teamName || 'Time Não Selecionado'}
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
              <Button variant="outline-teal-blue" onClick={handleCheckin} size="lg" disabled={checkinStatus === null}>
                <Icons typeIcon="checked" iconSize={20} fill="#007185" />
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
  userRole: PropTypes.string,
};

export default AdminCheckin;
