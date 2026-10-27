import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import {
  listWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopRegistrations,
  uploadWorkshopImage,
  deleteWorkshopImage,
  workshopImageUrl,
} from '@/services/workshops';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import SectionHeader from '@/components/Admin/SectionHeader';
import ActionButton from '@/components/Global/ActionButton';
import CustomModal from '@/components/Global/CustomModal';
import Loading from '@/components/Global/Loading';
import Icons from '@/components/Global/Icons';
import './style.scss';

const emptyForm = { id: null, name: '', description: '', vacancies: '', active: true, hasImage: false, imageFile: null, removeImage: false };

const AdminWorkshops = ({ loggedUsername }) => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [regsModal, setRegsModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setWorkshops(await listWorkshops());
    } catch {
      toast.error('Não foi possível carregar os workshops.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (workshop) => {
    setForm({
      id: workshop.id,
      name: workshop.name || '',
      description: workshop.description || '',
      vacancies: workshop.vacancies ?? '',
      active: !!workshop.active,
      hasImage: !!workshop.hasImage,
      imageFile: null,
      removeImage: false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome do workshop.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        vacancies: Number(form.vacancies) || 0,
        active: form.active,
      };
      let workshopId = form.id;
      if (form.id) {
        await updateWorkshop(form.id, payload);
      } else {
        const created = await createWorkshop(payload);
        workshopId = created?.id;
      }
      if (workshopId) {
        if (form.imageFile) {
          await uploadWorkshopImage(workshopId, form.imageFile);
        } else if (form.removeImage && form.hasImage) {
          await deleteWorkshopImage(workshopId);
        }
      }
      toast.success(form.id ? 'Workshop atualizado.' : 'Workshop criado.');
      setShowForm(false);
      await load();
    } catch {
      toast.error('Erro ao salvar o workshop.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (workshop) => {
    try {
      await updateWorkshop(workshop.id, { active: !workshop.active });
      await load();
    } catch {
      toast.error('Erro ao atualizar.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteWorkshop(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      toast.success('Workshop excluído.');
    } catch {
      toast.error('Erro ao excluir.');
    } finally {
      setBusy(false);
    }
  };

  const openRegs = async (workshop) => {
    try {
      const regs = await getWorkshopRegistrations(workshop.id);
      setRegsModal({ workshop, regs });
    } catch {
      toast.error('Erro ao carregar inscritos.');
    }
  };

  const stats = useMemo(() => {
    const totalFilled = workshops.reduce((acc, w) => acc + (w.filled || 0), 0);
    const totalVacancies = workshops.reduce((acc, w) => acc + (w.vacancies || 0), 0);
    const active = workshops.filter((w) => w.active).length;
    return { totalFilled, totalVacancies, active };
  }, [workshops]);

  const statItems = [
    { label: 'Workshops', value: workshops.length },
    { label: 'Inscritos', value: stats.totalFilled, tone: 'free' },
    { label: 'Vagas totais', value: stats.totalVacancies, tone: 'used' },
    { label: 'Ativos', value: stats.active, tone: 'accent' },
  ];

  const term = search.trim().toLowerCase();
  const filtered = term ? workshops.filter((w) => (w.name || '').toLowerCase().includes(term)) : workshops;

  const toolsButtons = [
    {
      fill: '#fff',
      iconSize: 22,
      id: 'ws-add',
      name: 'Novo Workshop',
      onClick: openCreate,
      typeButton: 'teal-blue',
      typeIcon: 'plus',
    },
  ];

  if (loading) return <Loading loading />;

  return (
    <div className="admin-subpage admin-subpage--workshops">
      <AdminSubpageHeader username={loggedUsername} title="Workshops" subtitle="Cadastre os workshops e suas vagas" typeIcon="team" />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="ws-search">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por workshop..." />
        </div>

        <SectionHeader title="Workshops" count={filtered.length} />

        <div className="admin-table-card">
          <div className="table-responsive">
            <Table striped bordered hover className="custom-table">
              <thead>
                <tr>
                  <th className="table-cells-header">Nome:</th>
                  <th className="table-cells-header">Descrição:</th>
                  <th className="table-cells-header">Vagas:</th>
                  <th className="table-cells-header">Inscritos:</th>
                  <th className="table-cells-header">Status:</th>
                  <th className="table-cells-header">Ações:</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-start text-secondary p-4">
                      Nenhum workshop cadastrado
                    </td>
                  </tr>
                ) : (
                  filtered.map((workshop) => (
                    <tr key={workshop.id}>
                      <td>
                        <div className="ws-name-cell">
                          {workshop.hasImage ? (
                            <img className="ws-avatar" src={workshopImageUrl(workshop.id)} alt={workshop.name} />
                          ) : (
                            <span className="ws-avatar ws-avatar--empty">{workshop.name?.charAt(0)?.toUpperCase() || '?'}</span>
                          )}
                          <span className="fw-semibold">{workshop.name}</span>
                        </div>
                      </td>
                      <td className="ws-desc-cell text-secondary">{workshop.description || '—'}</td>
                      <td>{workshop.vacancies > 0 ? workshop.vacancies : 'Ilimitadas'}</td>
                      <td>
                        <Badge bg="teal-blue">
                          {workshop.filled || 0}
                          {workshop.vacancies > 0 ? ` / ${workshop.vacancies}` : ''}
                        </Badge>
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          id={`ws-active-${workshop.id}`}
                          checked={workshop.active}
                          onChange={() => handleToggle(workshop)}
                          label={workshop.active ? 'Ativo' : 'Inativo'}
                        />
                      </td>
                      <td>
                        <div className="table-action-cell">
                          <ActionButton action="edit" typeIcon="person" label="Ver inscritos" onClick={() => openRegs(workshop)} />
                          <ActionButton action="edit" label="Editar workshop" onClick={() => openEdit(workshop)} />
                          <ActionButton action="delete" label="Excluir workshop" onClick={() => setDeleteTarget(workshop)} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <CustomModal
        show={showForm}
        onHide={() => setShowForm(false)}
        variant="info"
        title={form.id ? 'Editar workshop' : 'Novo workshop'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="ws-btn" onClick={handleSave} disabled={busy}>
              {form.id ? 'Salvar' : 'Criar workshop'}
            </Button>
          </>
        }
      >
        <Form.Label className="fw-semibold mb-2">Imagem <span className="text-muted fw-normal">(opcional)</span></Form.Label>
        <div className="ws-uploader mb-4">
          <label className="ws-uploader__thumb">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null, removeImage: false })}
            />
            {form.imageFile ? (
              <img src={URL.createObjectURL(form.imageFile)} alt="Pré-visualização" />
            ) : form.hasImage && !form.removeImage && form.id ? (
              <img src={workshopImageUrl(form.id)} alt="Imagem atual" />
            ) : form.name.trim() ? (
              <span className="ws-uploader__initial">{form.name.trim().charAt(0).toUpperCase()}</span>
            ) : (
              <span className="ws-uploader__placeholder">
                <Icons typeIcon="camera" iconSize={30} fill="#9aa5ab" />
              </span>
            )}
            <span className="ws-uploader__overlay">
              <Icons typeIcon="camera" iconSize={22} fill="#fff" />
            </span>
          </label>
          <div className="ws-uploader__meta">
            <label className="ws-uploader__cta">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null, removeImage: false })}
              />
              {form.imageFile || (form.hasImage && !form.removeImage) ? 'Alterar imagem' : 'Enviar imagem'}
            </label>
            <small className="text-muted">PNG, JPG ou WEBP. Recomendado 16:10.</small>
            {(form.imageFile || (form.hasImage && !form.removeImage)) && (
              <button
                type="button"
                className="ws-uploader__remove"
                onClick={() => setForm({ ...form, imageFile: null, removeImage: true })}
              >
                <Icons typeIcon="delete" iconSize={14} fill="currentColor" /> Remover imagem
              </button>
            )}
          </div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Nome</Form.Label>
          <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Oficina de violão" autoFocus />
        </Form.Group>
        <Form.Group className="mb-3 ws-field-vagas">
          <Form.Label className="fw-semibold">Vagas</Form.Label>
          <Form.Control type="number" min="0" value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: e.target.value })} placeholder="0" />
          <Form.Text className="text-muted">Deixe 0 para vagas ilimitadas.</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Descrição</Form.Label>
          <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição do workshop (opcional)" />
        </Form.Group>
        <div className="ws-switch-row">
          <Form.Check
            type="switch"
            id="ws-form-active"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            label="Ativo (aparece na landing para inscrição)"
          />
        </div>
      </CustomModal>

      <CustomModal
        show={!!regsModal}
        onHide={() => setRegsModal(null)}
        variant="info"
        title={regsModal ? `Inscritos — ${regsModal.workshop.name}` : 'Inscritos'}
        footer={
          <Button variant="secondary" onClick={() => setRegsModal(null)}>
            Fechar
          </Button>
        }
      >
        {!regsModal?.regs?.length ? (
          <div className="ws-regs-empty">
            <Icons typeIcon="person" iconSize={40} fill="#c3ccd1" />
            <p>Nenhum inscrito ainda.</p>
          </div>
        ) : (
          <>
            <div className="ws-regs-count">
              <Badge bg="teal-blue">{regsModal.regs.length}</Badge>
              <span>{regsModal.regs.length === 1 ? 'inscrito' : 'inscritos'}</span>
            </div>
            <div className="ws-regs-wrap">
              <Table className="ws-regs-table mb-0">
                <thead>
                  <tr>
                    <th className="ws-regs-table__num">#</th>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Contato</th>
                  </tr>
                </thead>
                <tbody>
                  {regsModal.regs.map((r, i) => (
                    <tr key={r.id}>
                      <td className="ws-regs-table__num">{i + 1}</td>
                      <td className="fw-semibold">{r.name || '—'}</td>
                      <td>{r.cpf || '—'}</td>
                      <td>{r.contact || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </CustomModal>

      <CustomModal
        show={!!deleteTarget}
        onHide={() => setDeleteTarget(null)}
        variant="cancel"
        title="Excluir workshop"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={busy}>
              {busy ? 'Excluindo…' : 'Excluir'}
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir o workshop <b>{deleteTarget?.name}</b> e todas as suas inscrições? Esta ação não
        pode ser desfeita.
      </CustomModal>
    </div>
  );
};

AdminWorkshops.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminWorkshops;
