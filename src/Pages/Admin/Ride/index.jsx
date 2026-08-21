import { useState, useEffect, useMemo } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { downloadSingleSheet, flattenForExcel } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import { listRideOffers, listRideNeeds, matchRide, deleteRide } from '@/services/rides';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';

const digitsOnly = (v) => (v || '').replace(/\D/g, '');
const normalize = (v) =>
  (v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const WhatsAppLink = ({ phone }) => {
  const digits = digitsOnly(phone);
  if (!digits) return <span className="text-secondary">—</span>;
  const wa = digits.length > 11 ? digits : `55${digits}`;
  return (
    <a className="ride-contact" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
      <Icons typeIcon="whatsapp" iconSize={16} fill="#25D366" />
      <span>{phone}</span>
    </a>
  );
};
WhatsAppLink.propTypes = { phone: PropTypes.string };

const SeatIndicator = ({ total, used }) => {
  const seatCount = Number(total) || 0;
  const usedCount = used || 0;
  const free = Math.max(seatCount - usedCount, 0);
  return (
    <div className="ride-seats">
      <span className="ride-seats__pills">
        {Array.from({ length: seatCount }).map((_, i) => (
          <span key={i} className={`ride-seats__pill ${i < usedCount ? 'is-used' : ''}`} />
        ))}
      </span>
      <span className="ride-seats__count">
        {usedCount}/{seatCount}
      </span>
      {free > 0 ? (
        <Badge bg="teal-blue">
          {free} livre{free === 1 ? '' : 's'}
        </Badge>
      ) : (
        <Badge bg="danger">Lotado</Badge>
      )}
    </div>
  );
};
SeatIndicator.propTypes = { total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), used: PropTypes.number };

const RideStat = ({ label, value, tone }) => (
  <div className={`ride-stat ride-stat--${tone || 'default'}`}>
    <span className="ride-stat__value">{value}</span>
    <span className="ride-stat__label">{label}</span>
  </div>
);
RideStat.propTypes = { label: PropTypes.string, value: PropTypes.node, tone: PropTypes.string };

const AdminRide = ({ loggedUsername }) => {
  const [rideData, setRideData] = useState({ offerRide: [], needRide: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [carSort, setCarSort] = useState('free');
  const [showDeleteRelationshipModal, setShowDeleteRelationshipModal] = useState(false);
  const [camperToDelete, setCamperToDelete] = useState(false);

  scrollUp();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offerRide, needRide] = await Promise.all([listRideOffers(), listRideNeeds()]);
        setRideData({ offerRide, needRide });
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRelationship = async (offerRideId, needRideId) => {
    try {
      const needRide = rideData.needRide.find((ride) => ride.id === needRideId);
      const offerRide = rideData.offerRide.find((ride) => ride.id === offerRideId);

      await matchRide(offerRideId, needRideId);
      setRideData((prevData) => {
        const updatedOfferRide = prevData.offerRide.map((offer) =>
          offer.id === offerRideId
            ? { ...offer, relationship: [...(offer.relationship || []), { id: needRideId, name: needRide?.name }] }
            : offer,
        );
        const updatedNeedRide = prevData.needRide.filter((ride) => ride.id !== needRideId);
        toast.success('Carona vinculada com sucesso');

        if (needRide && offerRide) {
          registerLog(
            `Criou o relacionamento de carona entre ${offerRide.name} (oferecendo) e ${needRide.name} (solicitando)`,
            loggedUsername,
          );
        }

        return { offerRide: updatedOfferRide, needRide: updatedNeedRide };
      });
    } catch (error) {
      console.error('Erro ao criar relacionamento:', error);
      toast.error('Erro ao vincular carona');
    }
  };

  const handleShowDeleteRelationshipModal = (needRideId) => {
    setCamperToDelete(needRideId);
    setShowDeleteRelationshipModal(true);
  };

  const handleCloseDeleteRelationshipModal = () => {
    setCamperToDelete(null);
    setShowDeleteRelationshipModal(false);
  };

  const handleDeleteRelationship = async (needRideId) => {
    try {
      await deleteRide(needRideId);

      const removedNeedRide = rideData.offerRide
        .flatMap((offer) => offer.relationship)
        .find((related) => related.id === needRideId);

      const offerWithRelationship = rideData.offerRide.find((offer) =>
        offer.relationship.some((related) => related.id === needRideId),
      );

      setRideData((prevData) => {
        const updatedOfferRide = prevData.offerRide.map((offer) => ({
          ...offer,
          relationship: offer.relationship.filter((related) => related.id !== needRideId),
        }));
        const updatedNeedRide = removedNeedRide ? [...prevData.needRide, removedNeedRide] : prevData.needRide;

        toast.success('Carona desvinculada com sucesso');
        handleCloseDeleteRelationshipModal();

        if (offerWithRelationship && removedNeedRide) {
          registerLog(
            `Deletou o relacionamento de carona entre ${offerWithRelationship.name} (oferecendo) e ${removedNeedRide.name} (necessitando)`,
            loggedUsername,
          );
        }

        return { offerRide: updatedOfferRide, needRide: updatedNeedRide };
      });
    } catch (error) {
      console.error('Erro ao desvincular carona:', error);
    }
  };

  const generateExcel = () => {
    const fieldMapping = {
      id: 'ID',
      type: 'Tipo',
      name: 'Nome',
      seatsInTheCar: 'Vagas no Carro',
      observation: 'Observação',
      cellPhone: 'Contato',
      checked: 'Checked',
    };
    const rows = [...rideData.offerRide, ...rideData.needRide].map((row) => flattenForExcel(row, fieldMapping));
    downloadSingleSheet({ filename: 'caronas.xlsx', sheetName: 'Rides', rows });
  };

  const stats = useMemo(() => {
    const cars = rideData.offerRide.length;
    const totalSeats = rideData.offerRide.reduce((s, o) => s + (Number(o.seatsInTheCar) || 0), 0);
    const usedSeats = rideData.offerRide.reduce((s, o) => s + (o.relationship?.length || 0), 0);
    const freeSeats = Math.max(totalSeats - usedSeats, 0);
    const waiting = rideData.needRide.length;
    const totalPeople = usedSeats + waiting;
    const matchedPct = totalPeople > 0 ? Math.round((usedSeats / totalPeople) * 100) : 0;
    return { cars, totalSeats, usedSeats, freeSeats, waiting, matchedPct };
  }, [rideData]);

  const term = normalize(search);

  const filteredOffers = useMemo(() => {
    let list = rideData.offerRide.map((offer) => ({
      ...offer,
      free: (Number(offer.seatsInTheCar) || 0) - (offer.relationship?.length || 0),
    }));

    if (term) {
      list = list.filter(
        (offer) =>
          normalize(offer.name).includes(term) ||
          (offer.relationship || []).some((p) => normalize(p.name).includes(term)),
      );
    }

    if (carFilter === 'free') list = list.filter((offer) => offer.free >= 1);
    else if (carFilter === 'full') list = list.filter((offer) => offer.free <= 0);

    return [...list].sort((a, b) =>
      carSort === 'name' ? a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }) : b.free - a.free,
    );
  }, [rideData.offerRide, term, carFilter, carSort]);

  const filteredNeeds = useMemo(() => {
    if (!term) return rideData.needRide;
    return rideData.needRide.filter((need) => normalize(need.name).includes(term));
  }, [rideData.needRide, term]);

  const carsWithFreeSeats = useMemo(
    () =>
      rideData.offerRide
        .map((offer) => ({
          ...offer,
          free: (Number(offer.seatsInTheCar) || 0) - (offer.relationship?.length || 0),
        }))
        .filter((offer) => offer.free >= 1),
    [rideData.offerRide],
  );

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'rides-excel',
      name: 'Baixar Relatório',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--ride ride-page">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Caronas"
        subtitle="Ofertas e pedidos de carona dos inscritos"
        typeIcon="ride"
      />

      <div className="admin-subpage__content">
        <div className="ride-stats">
          <RideStat label="Carros" value={stats.cars} />
          <RideStat label="Vagas totais" value={stats.totalSeats} />
          <RideStat label="Ocupadas" value={stats.usedSeats} tone="used" />
          <RideStat label="Livres" value={stats.freeSeats} tone="free" />
          <RideStat label="Aguardando carona" value={stats.waiting} tone="waiting" />
          <RideStat label="Alocados" value={`${stats.matchedPct}%`} tone="pct" />
        </div>

        <div className="ride-toolbar">
          <div className="ride-search">
            <Icons typeIcon="m-glass" iconSize={18} fill="#8a8a8a" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AdminToolbar buttons={toolsButtons} />
        </div>

        <div className="ride-section-title">
          <h4>Carros</h4>
          <span className="ride-section-title__count">{filteredOffers.length}</span>
          <div className="ride-section-title__line" />
        </div>

        <div className="ride-filters">
          <div className="ride-chips">
            <button
              type="button"
              className={`ride-filter-chip ${carFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => setCarFilter('all')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`ride-filter-chip ${carFilter === 'free' ? 'is-active' : ''}`}
              onClick={() => setCarFilter('free')}
            >
              Com vaga
            </button>
            <button
              type="button"
              className={`ride-filter-chip ${carFilter === 'full' ? 'is-active' : ''}`}
              onClick={() => setCarFilter('full')}
            >
              Lotados
            </button>
          </div>
          <Form.Select size="sm" className="ride-sort" value={carSort} onChange={(e) => setCarSort(e.target.value)}>
            <option value="free">Ordenar por: vagas livres</option>
            <option value="name">Ordenar por: nome (A→Z)</option>
          </Form.Select>
        </div>

        {filteredOffers.length === 0 ? (
          <p className="ride-empty">Nenhum carro para exibir.</p>
        ) : (
          <div className="ride-cards">
            {filteredOffers.map((offer) => {
              const used = offer.relationship?.length || 0;
              const free = (Number(offer.seatsInTheCar) || 0) - used;
              return (
                <div key={offer.id} className="ride-car">
                  <div className="ride-car__head">
                    <span className="ride-car__icon">
                      <Icons typeIcon="ride" iconSize={26} fill="#007185" />
                    </span>
                    <div className="ride-car__driver">
                      <span className="ride-car__name">{offer.name}</span>
                      <WhatsAppLink phone={offer.cellPhone} />
                    </div>
                  </div>

                  <SeatIndicator total={offer.seatsInTheCar} used={used} />

                  {offer.observation && <p className="ride-car__obs">{offer.observation}</p>}

                  <div className="ride-car__passengers">
                    {used === 0 ? (
                      <span className="ride-car__empty">Nenhum passageiro ainda</span>
                    ) : (
                      offer.relationship.map((p) => (
                        <span key={p.id} className="ride-chip">
                          {p.name}
                          <button
                            type="button"
                            className="ride-chip__remove"
                            title="Remover passageiro"
                            onClick={() => handleShowDeleteRelationshipModal(p.id)}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {free > 0 && rideData.needRide.length > 0 && (
                    <Form.Select
                      size="sm"
                      className="ride-car__assign"
                      value=""
                      onChange={(e) => e.target.value && handleCreateRelationship(offer.id, e.target.value)}
                    >
                      <option value="">+ Adicionar passageiro...</option>
                      {rideData.needRide.map((need) => (
                        <option key={need.id} value={need.id}>
                          {need.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="ride-section-title">
          <h4>Aguardando carona</h4>
          <span className="ride-section-title__count">{filteredNeeds.length}</span>
          <div className="ride-section-title__line" />
        </div>

        {filteredNeeds.length === 0 ? (
          <p className="ride-empty">Ninguém aguardando carona. 🎉</p>
        ) : (
          <div className="ride-pool">
            {filteredNeeds.map((need) => (
              <div key={need.id} className="ride-need">
                <div className="ride-need__info">
                  <span className="ride-need__name">{need.name}</span>
                  <WhatsAppLink phone={need.cellPhone} />
                  {need.observation && <span className="ride-need__obs">“{need.observation}”</span>}
                </div>
                <Form.Select
                  size="sm"
                  className="ride-need__assign"
                  value=""
                  disabled={carsWithFreeSeats.length === 0}
                  onChange={(e) => e.target.value && handleCreateRelationship(e.target.value, need.id)}
                >
                  <option value="">
                    {carsWithFreeSeats.length === 0 ? 'Sem vagas disponíveis' : 'Atribuir a um carro...'}
                  </option>
                  {carsWithFreeSeats.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name} — {car.free} vaga{car.free === 1 ? '' : 's'}
                    </option>
                  ))}
                </Form.Select>
              </div>
            ))}
          </div>
        )}

        <CustomModal
          show={showDeleteRelationshipModal}
          onHide={handleCloseDeleteRelationshipModal}
          variant="cancel"
          title="Confirmar Exclusão"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseDeleteRelationshipModal}>
                Cancelar
              </Button>
              <Button variant="danger" className="btn-cancel" onClick={() => handleDeleteRelationship(camperToDelete)}>
                Excluir
              </Button>
            </>
          }
        >
          Tem certeza de que deseja remover esse passageiro dessa carona?
        </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminRide.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminRide;
