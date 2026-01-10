import { useEffect, useState } from 'react';
import { Container, Button, Form, Modal, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import fetcher from '@/fetchers/fetcherWithCredentials';
import { registerLog } from '@/fetchers/userLogs';
import Icons from '@/components/Global/Icons';
import AdminHeader from '@/components/Admin/Header/AdminHeader';
import Loading from '@/components/Global/Loading';
import Tools from '@/components/Admin/Header/Tools';

const AdminTeams = ({ loggedUsername }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    wristbandId: '',
  });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetcher.get('/team');
      console.log('response: ', response);
      if (response.status === 200) {
        setTeams(response.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar times');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenModal = (team = null) => {
    setEditTeam(team);
    setFormData({
      name: team?.name || '',
      wristbandId: team?.wristbandId || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTeam(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (editTeam) {
        await fetcher.patch(`/team/${editTeam.id}`, formData);
        toast.success('Time atualizado com sucesso');
        registerLog(`Editou o time "${editTeam.name}"`, loggedUsername);
      } else {
        await fetcher.post('/team', formData);
        toast.success('Time criado com sucesso');
        registerLog(`Criou o time "${formData.name}"`, loggedUsername);
      }

      handleCloseModal();
      fetchTeams();
    } catch (error) {
      toast.error('Erro ao salvar time');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Deseja realmente remover este time?')) return;

    try {
      setLoading(true);
      const teamToDelete = teams.find((team) => team.id === teamId);
      
      await fetcher.delete(`/team/${teamId}`);
      toast.success('Time removido com sucesso');
      registerLog(`Removeu o time "${teamToDelete?.name}"`, loggedUsername);
      fetchTeams();
    } catch (error) {
      toast.error('Erro ao remover time');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = () => {
    const numericFields = ['Qtd. Campers'];

    const parseNumber = (value) => {
      if (value === undefined || value === null) return '';
      const num = Number(value);
      return isNaN(num) ? '' : num;
    };

    const fieldMapping = teams.map((team) => {
      let row = {
        'Nome do Time': team.name,
        'Cor da Pulseira': team.wristbandColor || '-',
        'Qtd. Campers': team.campersCount ?? 0,
      };

      numericFields.forEach((key) => {
        row[key] = parseNumber(row[key]);
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(fieldMapping);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Times');
    XLSX.writeFile(workbook, 'times.xlsx');
  };

  const toolsButtons = [
    {
      buttonClassName: 'w-100 h-100 py-3 d-flex flex-column align-items-center mb-3 mb-md-0',
      cols: { xs: 12, md: 6 },
      fill: '#007185',
      iconSize: 40,
      id: 'team-excel',
      name: 'Baixar Relatório Times',
      onClick: generateExcel,
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      buttonClassName: 'w-100 h-100 py-3 btn-bw-3 d-flex flex-column align-items-center',
      cols: { xs: 12, md: 6 },
      fill: '#fff',
      iconSize: 40,
      id: 'team-add',
      name: 'Criar Novo Time',
      onClick: handleOpenModal,
      typeButton: 'teal-blue',
      typeIcon: 'plus',
    },
  ];

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Times" sessionTypeIcon="team" iconSize={80} fill="#007185" />

      <Tools buttons={toolsButtons} />

      <div className="table-responsive">
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">Nome:</th>
              <th className="table-cells-header">Cor da Pulseira:</th>
              <th className="table-cells-header">Qtd. Campers:</th>
              <th className="table-cells-header">Ações:</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>{team.name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, background: team.wristbandColor }} />
                    {team.wristbandColor}
                  </div>
                </td>
                <td>{team.campersCount}</td>
                <td>
                  <Button variant="link" onClick={() => handleOpenModal(team)}>
                    <Icons typeIcon="edit" />
                  </Button>
                  <Button variant="link" onClick={() => handleDelete(team.id)}>
                    <Icons typeIcon="trash" fill="#c00" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal className="custom-modal" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton className="custom-modal__header--confirm">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Icons typeIcon={editTeam ? 'edit' : 'team'} iconSize={25} fill={editTeam ? '' : '#057c05'} />
            <b>{editTeam ? 'Editar Time' : 'Criar Novo Time'}</b>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              <b>Nome do Time:</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              size="lg"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <b>ID da Pulseira:</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.wristbandId}
              size="lg"
              onChange={(e) => setFormData({ ...formData, wristbandId: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" className="btn-confirm" onClick={handleSubmit}>
            {editTeam ? 'Salvar Alterações' : 'Criar Time'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Loading loading={loading} />
    </Container>
  );
};

AdminTeams.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminTeams;
