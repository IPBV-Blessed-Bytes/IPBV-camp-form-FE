import { useMemo, useState } from 'react';
import { Badge, Button, Form, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './style.scss';

import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import Loading from '@/components/Global/Loading';
import CustomModal from '@/components/Global/CustomModal';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';

import useCampersData from '../Campers/hooks/useCampersData';

const BUS_TRANSPORTATIONS = ['Com Ônibus', 'Com Onibus', 'Ônibus Equipe', 'Onibus Equipe'];

const goesByBus = (camper) => BUS_TRANSPORTATIONS.includes(camper?.package?.transportationName);

const isTeamBus = (camper) => (camper?.package?.transportationName || '').toLowerCase().includes('equipe');

const EDIT_FIELDS = [
  { key: 'name', label: 'Nome', path: 'personalInformation' },
  { key: 'cpf', label: 'CPF', path: 'personalInformation' },
  { key: 'rg', label: 'RG', path: 'personalInformation' },
  { key: 'rgShipper', label: 'Órgão Expedidor', path: 'personalInformation' },
  { key: 'cellPhone', label: 'Telefone', path: 'contact' },
  { key: 'birthday', label: 'Data de Nascimento', path: 'personalInformation' },
];

const AdminBus = ({ loggedUsername, userRole }) => {
  scrollUp();

  const { data, loading, saveEdit } = useCampersData({ loggedUsername });

  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(null); // { camper, originalIndex }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'collaborator';

  const busCampers = useMemo(() => {
    const list = (data || [])
      .map((camper, originalIndex) => ({ camper, originalIndex }))
      .filter(({ camper }) => goesByBus(camper));
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      ({ camper }) =>
        (camper.personalInformation?.name || '').toLowerCase().includes(term) ||
        (camper.personalInformation?.cpf || '').toLowerCase().includes(term),
    );
  }, [data, search]);

  const statItems = useMemo(() => {
    const total = (data || []).filter(goesByBus).length;
    return [{ label: 'Passageiros no ônibus', value: total, tone: 'info' }];
  }, [data]);

  const openEdit = ({ camper, originalIndex }) => {
    setEditing({ camper, originalIndex });
    setForm({
      name: camper.personalInformation?.name || '',
      cpf: camper.personalInformation?.cpf || '',
      rg: camper.personalInformation?.rg || '',
      rgShipper: camper.personalInformation?.rgShipper || '',
      cellPhone: camper.contact?.cellPhone || '',
      birthday: camper.personalInformation?.birthday || '',
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { camper, originalIndex } = editing;
    const editFormData = {
      ...camper,
      personalInformation: {
        ...camper.personalInformation,
        name: form.name,
        cpf: form.cpf,
        rg: form.rg,
        rgShipper: form.rgShipper,
        birthday: form.birthday,
      },
      contact: {
        ...camper.contact,
        cellPhone: form.cellPhone,
      },
    };
    const success = await saveEdit({ editFormData, editRowIndex: originalIndex });
    setSaving(false);
    if (success) setShowEditModal(false);
  };

  return (
    <div className="admin-subpage admin-subpage--bus">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Ônibus"
        subtitle="Passageiros que marcaram ir de ônibus"
        typeIcon="bus"
      />

      <div className="admin-subpage__content">
        <StatCards items={statItems} />

        <div className="bus-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome ou CPF..." />
        </div>

        <SectionHeader title="Passageiros" count={busCampers.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="table-cells-header">Nome:</th>
                <th className="table-cells-header">Transporte:</th>
                <th className="table-cells-header">CPF:</th>
                <th className="table-cells-header">RG:</th>
                <th className="table-cells-header">Órgão Expedidor:</th>
                <th className="table-cells-header">Telefone:</th>
                <th className="table-cells-header">Data de Nascimento:</th>
                {canEdit && <th className="table-cells-header">Ações:</th>}
              </tr>
            </thead>
            <tbody>
              {busCampers.map(({ camper, originalIndex }) => (
                <tr key={camper.id ?? originalIndex}>
                  <td>{camper.personalInformation?.name || '-'}</td>
                  <td>
                    <Badge bg={isTeamBus(camper) ? 'warning' : 'primary'} text={isTeamBus(camper) ? 'dark' : undefined}>
                      {isTeamBus(camper) ? 'Ônibus Equipe' : 'Ônibus normal'}
                    </Badge>
                  </td>
                  <td>{camper.personalInformation?.cpf || '-'}</td>
                  <td>{camper.personalInformation?.rg || '-'}</td>
                  <td>{camper.personalInformation?.rgShipper || '-'}</td>
                  <td>{camper.contact?.cellPhone || '-'}</td>
                  <td>{camper.personalInformation?.birthday || '-'}</td>
                  {canEdit && (
                    <td>
                      <Button variant="outline-success" onClick={() => openEdit({ camper, originalIndex })}>
                        <Icons typeIcon="edit" iconSize={22} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {busCampers.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="text-center text-secondary py-4">
                    Nenhum passageiro de ônibus encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <CustomModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          variant="confirm"
          icon="edit"
          iconFill='none'
          title="Editar Passageiro do Ônibus"
          centered={false}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button variant="confirm" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </>
          }
        >
          <Form>
            {EDIT_FIELDS.map((field) => (
              <Form.Group key={field.key} className="mb-3">
                <Form.Label>
                  <b>{field.label}:</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={form[field.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              </Form.Group>
            ))}
          </Form>
        </CustomModal>

        <Loading loading={loading || saving} />
      </div>
    </div>
  );
};

AdminBus.propTypes = {
  loggedUsername: PropTypes.string,
  userRole: PropTypes.string,
};

export default AdminBus;
