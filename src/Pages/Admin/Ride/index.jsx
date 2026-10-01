import { useState, useEffect, useMemo } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.scss';
import { downloadSingleSheet, flattenForExcel } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import {
  listRideOffers,
  listRideNeeds,
  setRideChecked,
  matchRide,
  deleteRide,
  autoLinkRides,
} from '@/services/rides';
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
  const { t } = useTranslation();
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
        <Badge bg="teal-blue">{t('admin.ride.freeSeats', { count: free })}</Badge>
      ) : (
        <Badge bg="danger">{t('admin.ride.full')}</Badge>
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
  const { t } = useTranslation();
  const [rideData, setRideData] = useState({ offerRide: [], needRide: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [carSort, setCarSort] = useState('free');
  const [showDeleteRelationshipModal, setShowDeleteRelationshipModal] = useState(false);
  const [camperToDelete, setCamperToDelete] = useState(false);
  const [autoLinkOpen, setAutoLinkOpen] = useState(false);
  const [autoLinking, setAutoLinking] = useState(false);

  scrollUp();

  const reload = async () => {
    try {
      const [offerRide, needRide] = await Promise.all([listRideOffers(), listRideNeeds()]);
      setRideData({ offerRide, needRide });
    } catch (error) {
      console.error('Erro ao buscar os dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAutoLink = async () => {
    setAutoLinking(true);
    try {
      const result = await autoLinkRides();
      registerLog('Vinculou caronas automaticamente', loggedUsername);
      toast.success(
        t('admin.ride.toast.autoLinkResult', { linked: result.linked, unmatched: result.unmatched }),
      );
      setAutoLinkOpen(false);
      await reload();
    } catch (error) {
      console.error('Erro ao vincular automaticamente:', error);
      toast.error(t('admin.ride.toast.autoLinkError'));
    } finally {
      setAutoLinking(false);
    }
  };

  const handleCheckboxChange = async (type, id, checked) => {
    try {
      await setRideChecked(id, checked);

      setRideData((prevData) => ({
        ...prevData,
        [type]: prevData[type].map((ride) => (ride.id === id ? { ...ride, checked } : ride)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar o estado do checkbox:', error);
    }
  };

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
        toast.success(t('admin.ride.toast.rideLinked'));

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
      toast.error(t('admin.ride.toast.rideLinkError'));
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

        toast.success(t('admin.ride.toast.rideUnlinked'));
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
      name: t('admin.ride.toolbar.downloadReport'),
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#fff',
      iconSize: 20,
      id: 'rides-autolink',
      name: t('admin.ride.toolbar.autoLink'),
      onClick: () => setAutoLinkOpen(true),
      typeButton: 'teal-blue',
      typeIcon: 'ride',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--ride ride-page">
      <AdminSubpageHeader
        sessionKey="carona"
        username={loggedUsername}
        title={t('admin.ride.title')}
        subtitle={t('admin.ride.subtitle')}
        typeIcon="ride"
      />

      <div className="admin-subpage__content">
        <div className="ride-stats">
          <RideStat label={t('admin.ride.stats.cars')} value={stats.cars} />
          <RideStat label={t('admin.ride.stats.totalSeats')} value={stats.totalSeats} />
          <RideStat label={t('admin.ride.stats.used')} value={stats.usedSeats} tone="used" />
          <RideStat label={t('admin.ride.stats.free')} value={stats.freeSeats} tone="free" />
          <RideStat label={t('admin.ride.stats.waiting')} value={stats.waiting} tone="waiting" />
          <RideStat label={t('admin.ride.stats.allocated')} value={`${stats.matchedPct}%`} tone="pct" />
        </div>

        <div className="ride-toolbar">
          <div className="ride-search">
            <Icons typeIcon="m-glass" iconSize={18} fill="#8a8a8a" />
            <input
              type="text"
              placeholder={t('admin.ride.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AdminToolbar buttons={toolsButtons} />
        </div>

        <div className="ride-section-title">
          <h4>{t('admin.ride.carsTitle')}</h4>
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
              {t('admin.ride.filterAll')}
            </button>
            <button
              type="button"
              className={`ride-filter-chip ${carFilter === 'free' ? 'is-active' : ''}`}
              onClick={() => setCarFilter('free')}
            >
              {t('admin.ride.filterWithSeats')}
            </button>
            <button
              type="button"
              className={`ride-filter-chip ${carFilter === 'full' ? 'is-active' : ''}`}
              onClick={() => setCarFilter('full')}
            >
              {t('admin.ride.filterFull')}
            </button>
          </div>
          <Form.Select size="sm" className="ride-sort" value={carSort} onChange={(e) => setCarSort(e.target.value)}>
            <option value="free">{t('admin.ride.sortFree')}</option>
            <option value="name">{t('admin.ride.sortName')}</option>
          </Form.Select>
        </div>

        {filteredOffers.length === 0 ? (
          <p className="ride-empty">{t('admin.ride.noCars')}</p>
        ) : (
          <div className="ride-cards">
            {filteredOffers.map((offer) => {
              const used = offer.relationship?.length || 0;
              const free = (Number(offer.seatsInTheCar) || 0) - used;
              return (
                <div key={offer.id} className={`ride-car ${offer.checked ? 'is-checked' : ''}`}>
                  <div className="ride-car__head">
                    <span className="ride-car__icon">
                      <Icons typeIcon="ride" iconSize={26} fill="#007185" />
                    </span>
                    <div className="ride-car__driver">
                      <span className="ride-car__name">{offer.name}</span>
                      <WhatsAppLink phone={offer.cellPhone} />
                    </div>
                    <Form.Check
                      type="checkbox"
                      className="ride-car__mark"
                      title={t('admin.ride.markRide')}
                      checked={Boolean(offer.checked)}
                      onChange={(e) => handleCheckboxChange('offerRide', offer.id, e.target.checked)}
                    />
                  </div>

                  <SeatIndicator total={offer.seatsInTheCar} used={used} />

                  {offer.observation && <p className="ride-car__obs">{offer.observation}</p>}

                  <div className="ride-car__passengers">
                    {used === 0 ? (
                      <span className="ride-car__empty">{t('admin.ride.noPassengers')}</span>
                    ) : (
                      offer.relationship.map((p) => (
                        <span key={p.id} className="ride-chip">
                          {p.name}
                          <button
                            type="button"
                            className="ride-chip__remove"
                            title={t('admin.ride.removePassenger')}
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
                      <option value="">{t('admin.ride.addPassenger')}</option>
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
          <h4>{t('admin.ride.waitingTitle')}</h4>
          <span className="ride-section-title__count">{filteredNeeds.length}</span>
          <div className="ride-section-title__line" />
        </div>

        {filteredNeeds.length === 0 ? (
          <p className="ride-empty">{t('admin.ride.nobodyWaiting')}</p>
        ) : (
          <div className="ride-pool">
            {filteredNeeds.map((need) => (
              <div key={need.id} className={`ride-need ${need.checked ? 'is-checked' : ''}`}>
                <div className="ride-need__info">
                  <Form.Check
                    type="checkbox"
                    className="ride-need__mark"
                    title={t('admin.ride.markRide')}
                    checked={Boolean(need.checked)}
                    onChange={(e) => handleCheckboxChange('needRide', need.id, e.target.checked)}
                  />
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
                    {carsWithFreeSeats.length === 0 ? t('admin.ride.noSeatsAvailable') : t('admin.ride.assignToCar')}
                  </option>
                  {carsWithFreeSeats.map((car) => (
                    <option key={car.id} value={car.id}>
                      {t('admin.ride.carOption', { name: car.name, count: car.free })}
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
          title={t('admin.ride.confirmDeleteTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseDeleteRelationshipModal}>
                {t('admin.ride.cancel')}
              </Button>
              <Button variant="danger" className="btn-cancel" onClick={() => handleDeleteRelationship(camperToDelete)}>
                {t('admin.ride.delete')}
              </Button>
            </>
          }
        >
          {t('admin.ride.removePassengerConfirm')}
        </CustomModal>

        <CustomModal
          show={autoLinkOpen}
          onHide={() => setAutoLinkOpen(false)}
          variant="confirm"
          title={t('admin.ride.autoLinkTitle')}
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setAutoLinkOpen(false)} disabled={autoLinking}>
                {t('admin.ride.cancel')}
              </Button>
              <Button variant="teal-blue" onClick={handleAutoLink} disabled={autoLinking}>
                {autoLinking ? t('admin.ride.linking') : t('admin.ride.linkAll')}
              </Button>
            </>
          }
        >
          <p>
            <Trans i18nKey="admin.ride.autoLinkBody1" components={{ b: <b /> }} />
          </p>
          <p className="text-secondary small mb-0">
            {t('admin.ride.autoLinkBody2')}
          </p>
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
