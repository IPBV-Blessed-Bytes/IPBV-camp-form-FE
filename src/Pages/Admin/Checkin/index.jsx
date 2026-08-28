import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { MAX_SIZE_CAMPERS } from '@/utils/constants';
import { listCampers, checkinCamper } from '@/services/campers';
import { listWristbands } from '@/services/wristbands';
import { registerLog } from '@/services/logs';
import { useRoomsList } from '@/hooks/useRoomsList';
import { permissionsSections } from '@/fetchers/permissions';
import { getApiErrorMessage } from '@/fetchers/helpers';
import { AuthContext } from '@/hooks/useAuth/AuthProvider';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import calculateAge from '@/Pages/Packages/utils/calculateAge';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';
import QrScannerModal from '@/components/Global/QrScannerModal';
import CheckinReviewModal from '@/components/Global/CheckinReviewModal';
import { parseCheckoutQr } from '@/utils/checkinQr';

const AdminCheckin = ({ loggedUsername, userRole }) => {
  const [cpf, setCpf] = useState('');
  const [cpfLoading, setCpfLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const { rooms } = useRoomsList();
  const [loading, setLoading] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState(false);
  const [userWristbands, setUserWristbands] = useState([]);
  const [cpfMatches, setCpfMatches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkinStats, setCheckinStats] = useState({ total: 0, checked: 0 });
  const [showScanner, setShowScanner] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewApproving, setReviewApproving] = useState(false);
  const { formStage } = useContext(AuthContext);
  const { campersTableButtonPermissions } = permissionsSections(userRole);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  scrollUp();

  const fetchCheckinStats = async () => {
    try {
      const data = await listCampers({ size: MAX_SIZE_CAMPERS });
      const campers = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setCheckinStats({
        total: campers.length,
        checked: campers.filter((camper) => camper.checkin).length,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas de check-in:', error);
    }
  };

  useEffect(() => {
    fetchCheckinStats();
  }, []);

  const searchUsersByCpfPrefix = async (cpfPrefix) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setCpfLoading(true);
      setCpfMatches([]);
      setShowSuggestions(true);

      const data = await listCampers(
        { cpfPrefix, size: MAX_SIZE_CAMPERS },
        { signal: controller.signal },
      );

      const users = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];

      setCpfMatches(users);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }

      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      if (abortControllerRef.current === controller) {
        setCpfLoading(false);
      }
    }
  };

  useEffect(() => {
    if (cpf.length < 3) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setCpfMatches([]);
      setShowSuggestions(false);
      setCpfLoading(false);
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
      const wristbandsResponse = await listWristbands({ userId });

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

      await checkinCamper(userInfo.id, {
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

      fetchCheckinStats();
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      const status = error?.response?.status;
      const apiMessage = getApiErrorMessage(error);
      if (status === 404) {
        toast.error(apiMessage || 'Acampante não encontrado');
      } else {
        toast.error('Erro ao realizar check-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user) => {
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

    if (age <= 8) {
      toast.warn(
        `Usuário tem ${age < 2 ? `${age} ano` : `${age} anos`} de idade. Atenção ao revisar os dados!`,
      );
    }
  };

  const selectUserRef = useRef(selectUser);
  selectUserRef.current = selectUser;

  const handleScan = useCallback(async (text) => {
    setShowScanner(false);

    const checkoutOrderNumber = parseCheckoutQr(text);
    if (checkoutOrderNumber) {
      try {
        const data = await listCampers({ orderNumber: checkoutOrderNumber, size: MAX_SIZE_CAMPERS });
        const campers = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
        if (campers.length === 0) {
          toast.warn('Nenhum inscrito encontrado para este pedido');
          return;
        }
        setReviewData({ orderNumber: checkoutOrderNumber, campers });
      } catch (error) {
        console.error('Erro ao buscar inscritos do pedido:', error);
        toast.error('Erro ao buscar os inscritos do pedido');
      }
      return;
    }

    const cpfDigits = String(text || '').replace(/\D/g, '').slice(0, 11);

    if (cpfDigits.length !== 11) {
      toast.error('QR inválido: não contém um CPF válido');
      return;
    }

    setCpf(cpfDigits);

    try {
      const data = await listCampers({ cpfPrefix: cpfDigits, size: MAX_SIZE_CAMPERS });
      const users = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      const match = users.find((u) => u.personalInformation.cpf.replace(/\D/g, '') === cpfDigits);

      if (!match) {
        toast.warn('Nenhum acampante encontrado para este CPF');
        return;
      }

      selectUserRef.current(match);

      if (match.checkin) {
        toast.info('Este acampante já estava com check-in feito.');
        return;
      }

      await checkinCamper(match.id, { checkin: true, checkinTime: formatDateTimeBR() });
      setCheckinStatus(true);
      registerLog(`Fez check-in (via QR) para o usuário ${match.personalInformation.name}`, loggedUsername);
      toast.success('Check-in confirmado automaticamente via QR.');
      fetchCheckinStats();
    } catch (error) {
      console.error('Erro ao buscar usuário do QR:', error);
      toast.error('Erro ao buscar o usuário do QR');
    }
  }, [loggedUsername]);

  const applyReviewCheckin = async (camper) => {
    await checkinCamper(camper.id, { checkin: true, checkinTime: formatDateTimeBR() });
    registerLog(`Fez check-in (via QR do pedido) para o usuário ${camper.personalInformation.name}`, loggedUsername);
  };

  const handleReviewApprove = async (camper) => {
    if (camper.checkin) return;
    setReviewApproving(true);
    try {
      await applyReviewCheckin(camper);
      setReviewData((prev) =>
        prev ? { ...prev, campers: prev.campers.map((c) => (c.id === camper.id ? { ...c, checkin: true } : c)) } : prev,
      );
      fetchCheckinStats();
      toast.success('Check-in confirmado.');
    } catch (error) {
      console.error('Erro no check-in:', error);
      toast.error('Erro ao confirmar o check-in');
    } finally {
      setReviewApproving(false);
    }
  };

  const handleReviewApproveAll = async () => {
    if (!reviewData) return;
    const pending = reviewData.campers.filter((camper) => !camper.checkin);
    if (pending.length === 0) return;
    setReviewApproving(true);
    try {
      for (const camper of pending) {
        await applyReviewCheckin(camper);
      }
      setReviewData((prev) => (prev ? { ...prev, campers: prev.campers.map((c) => ({ ...c, checkin: true })) } : prev));
      fetchCheckinStats();
      toast.success('Check-in de todos confirmado.');
    } catch (error) {
      console.error('Erro no check-in em lote:', error);
      toast.error('Erro ao confirmar o check-in de todos');
    } finally {
      setReviewApproving(false);
    }
  };

  const normalizedCpf = String(cpf || '').replace(/\D/g, '');
  const userRoom = rooms.find((room) =>
    room.campers.some((camper) => String(camper.cpf || '').replace(/\D/g, '') === normalizedCpf),
  );

  const goToCampersTable = () => {
    formStage === 'maintenance' ? navigate('/dev/acampantes') : navigate('/admin/acampantes');
  };

  const pendingCheckins = Math.max(checkinStats.total - checkinStats.checked, 0);
  const checkinPercent = checkinStats.total
    ? Math.round((checkinStats.checked / checkinStats.total) * 100)
    : 0;
  const checkinStatItems = [
    { label: 'Total de acampantes', value: checkinStats.total },
    { label: 'Com check-in', value: checkinStats.checked, tone: 'free' },
    { label: 'Pendentes', value: pendingCheckins, tone: 'used' },
    { label: '% concluído', value: `${checkinPercent}%`, tone: 'info' },
  ];

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'campers-table',
      name: 'Tabela de Acampantes',
      onClick: () => goToCampersTable(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'add-person',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--checkin">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Check-in de Usuário"
        subtitle="Confirmação de presença dos acampantes"
        typeIcon="checkin"
      />

      <div className="admin-subpage__content">
        {campersTableButtonPermissions && <AdminToolbar buttons={toolsButtons} />}

        <StatCards items={checkinStatItems} />

      <div className="admin-panel checkin-search">
        <Form.Group controlId="cpf">
          <Form.Label>
            <b>CPF do Usuário:</b>
          </Form.Label>

          <div className="cpf-input-wrapper">
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

            {cpf && (
              <button
                aria-label="Limpar CPF"
                className="cpf-clear-button"
                type="button"
                onClick={() => {
                  setCpf('');
                  setUserInfo(null);
                  setCpfMatches([]);
                  setShowSuggestions(false);
                }}
              >
                <Icons typeIcon="close" iconSize={30} fill="#6c757d" />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="teal-blue"
            className="d-lg-none w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowScanner(true)}
          >
            <Icons typeIcon="camera" iconSize={20} fill="#007185" />
            Escanear QR
          </Button>

          {showSuggestions && !userInfo && (
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
                    onClick={() => selectUser(user)}
                  >
                    <strong>{user.personalInformation.name}</strong>
                    <span>{user.personalInformation.cpf}</span>
                  </div>
                ))
              ) : (
                <div className="cpf-suggestions-empty">Nenhum usuário encontrado para este CPF</div>
              )}
            </div>
          )}
        </Form.Group>
      </div>

      {userInfo && (
        <div className="admin-panel checkin-user">
          <div className="checkin-user__head">
            <div className="checkin-user__identity">
              <span className="checkin-user__eyebrow">Acampante</span>
              <h2 className="checkin-user__name">{userInfo.personalInformation.name}</h2>
            </div>
            <span className={`checkin-status-badge checkin-status-badge--${checkinStatus ? 'in' : 'out'}`}>
              <Icons
                typeIcon={checkinStatus ? 'checked' : 'close'}
                iconSize={16}
                fill={checkinStatus ? '#0c9183' : '#d32f2f'}
              />
              {checkinStatus ? 'Check-in feito' : 'Sem check-in'}
            </span>
          </div>

          {userWristbands.length > 0 && (
            <div className="checkin-wristbands">
              {userWristbands.map((band) => (
                <div key={band.id} className="checkin-wristbands__item">
                  <span className="checkin-wristbands__label">
                    {band.id === 'food' ? 'Pulseira Alimentação' : 'Pulseira Time'}
                  </span>
                  <span className="checkin-wristbands__swatch" style={{ background: band.color || 'transparent' }} />
                  {band.label && <span className="checkin-wristbands__name">{band.label}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="checkin-info">
            <div className="checkin-info__item">
              <span className="checkin-info__label">Data de Nascimento</span>
              <span className="checkin-info__value">{userInfo.personalInformation.birthday}</span>
            </div>
            <div className="checkin-info__item">
              <span className="checkin-info__label">Forma de Pagamento</span>
              <span className="checkin-info__value">
                {userInfo.formPayment.formPayment === 'creditCard'
                  ? 'Cartão de Crédito'
                  : userInfo.formPayment.formPayment === 'pix'
                  ? 'PIX'
                  : userInfo.formPayment.formPayment === 'ticket'
                  ? 'Boleto Bancário'
                  : 'Não Pagante'}
              </span>
            </div>
            <div className="checkin-info__item">
              <span className="checkin-info__label">Valor do Pagamento</span>
              <span className="checkin-info__value">{userInfo.totalPrice}</span>
            </div>
            <div className="checkin-info__item">
              <span className="checkin-info__label">Hospedagem</span>
              <span className="checkin-info__value">{userInfo.package.accomodationName}</span>
            </div>
            <div className="checkin-info__item">
              <span className="checkin-info__label">Quarto</span>
              <span className="checkin-info__value">{userRoom?.name || 'Não alocado'}</span>
            </div>
            <div className="checkin-info__item">
              <span className="checkin-info__label">Alimentação</span>
              <span className="checkin-info__value">{userInfo.package.foodName || '-'}</span>
            </div>
            <div className="checkin-info__item">
              <span className="checkin-info__label">Time</span>
              <span className="checkin-info__value">{userInfo.teamName || 'Time Não Selecionado'}</span>
            </div>
            <div className="checkin-info__item checkin-info__item--full">
              <span className="checkin-info__label">Observação da Equipe</span>
              <span className="checkin-info__value">{userInfo.observation || '-'}</span>
            </div>
            <div className="checkin-info__item checkin-info__item--full">
              <span className="checkin-info__label">Observação do Usuário</span>
              <span className="checkin-info__value">{userInfo.finalObservation || '-'}</span>
            </div>
          </div>

          <div className="checkin-user__action">
            <Form.Group controlId="checkinStatus" className="checkin-user__select">
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
            <Button
              variant="teal-blue"
              onClick={handleCheckin}
              size="lg"
              disabled={checkinStatus === null}
              className="checkin-user__submit"
            >
              <Icons typeIcon="checked" iconSize={20} fill="#fff" />
              <span>&nbsp;Atualizar Check-in</span>
            </Button>
          </div>
        </div>
      )}

        <Loading loading={loading} />
      </div>

      <QrScannerModal show={showScanner} onHide={() => setShowScanner(false)} onScan={handleScan} />

      <CheckinReviewModal
        show={Boolean(reviewData)}
        onHide={() => setReviewData(null)}
        orderNumber={reviewData?.orderNumber}
        campers={reviewData?.campers || []}
        onApprove={handleReviewApprove}
        onApproveAll={handleReviewApproveAll}
        approving={reviewApproving}
      />
    </div>
  );
};

AdminCheckin.propTypes = {
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
};

export default AdminCheckin;
