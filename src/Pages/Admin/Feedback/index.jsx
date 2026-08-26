import { useState, useEffect } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import './style.scss';
import { downloadSingleSheet } from '@/utils/excelExport';
import { registerLog } from '@/services/logs';
import { listFeedback, deleteAllFeedback } from '@/services/feedback';
import scrollUp from '@/hooks/useScrollUp';
import Loading from '@/components/Global/Loading';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import AdminToolbar from '@/components/Admin/AdminToolbar';
import SectionHeader from '@/components/Admin/SectionHeader';
import StatCards from '@/components/Admin/StatCards';
import SearchBox from '@/components/Admin/SearchBox';
import FilterChips from '@/components/Admin/FilterChips';
import CustomModal from '@/components/Global/CustomModal';
import { TABLE_HEADERS } from '@/utils/constants';

const RATING_HEADERS = new Set([
  'Organização',
  'Experiência nas Inscrições',
  'Alimentação',
  'Programação',
  'Estrutura Física',
  'Acolhimento',
  'Probabilidade de Volta',
]);

const RATING_TONE = {
  Excelente: 'success',
  'Muito fácil': 'success',
  'Sim, completamente': 'success',
  'Muito provável': 'success',
  Boa: 'primary',
  Fácil: 'primary',
  'Sim, em parte': 'primary',
  Provável: 'primary',
  Regular: 'warning',
  'Um pouco difícil': 'warning',
  'Poderia ter mais variedade': 'warning',
  'Pouco provável': 'warning',
  'Não muito': 'warning',
  'Precisa melhorar': 'danger',
  Difícil: 'danger',
  'Não gostei das atividades': 'danger',
  'Não, poderiam melhorar': 'danger',
  'Não, fiquei insatisfeito(a)': 'danger',
  'Não, me senti deslocado(a)': 'danger',
  Improvável: 'danger',
  'Não quero opinar': 'secondary',
};

const HIGH_RECOMMENDATION = new Set(['Muito provável', 'Provável']);

const AdminFeedback = ({ loggedUsername }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [search, setSearch] = useState('');
  const [identityFilter, setIdentityFilter] = useState('all');

  scrollUp();

  const fetchFeedbacks = async () => {
    try {
      const data = await listFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDeleteFeedbacks = async () => {
    try {
      await deleteAllFeedback();

      toast.success('Todos os feedbacks foram deletados com sucesso');
      registerLog(`Deletou todos os feedbacks`, loggedUsername);
      setShowDeleteModal(false);
      fetchFeedbacks();
    } catch (error) {
      console.error('Erro ao deletar feedbacks:', error);
      toast.error('Erro ao deletar feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = () => {
    if (!feedbacks || feedbacks.length === 0) {
      toast.error('Nenhum feedback disponível para exportar');
      return;
    }

    const filteredHeaders = TABLE_HEADERS.filter((header) => header !== 'ID');

    const rows = feedbacks.map((feedback) => {
      const values = Object.values(feedback);
      const row = {};

      TABLE_HEADERS.forEach((header, index) => {
        if (header === 'ID') return;
        const value = values[index];
        row[header] =
          value && !isNaN(Date.parse(value))
            ? new Date(value).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : value;
      });

      return row;
    });

    downloadSingleSheet({
      filename: 'feedbacks.xlsx',
      sheetName: 'Feedbacks',
      rows,
      headers: filteredHeaders,
    });
  };

  const namedCount = feedbacks.filter((f) => (f.name || '').trim()).length;
  const anonCount = feedbacks.length - namedCount;
  const highRecommendation = feedbacks.filter((f) => HIGH_RECOMMENDATION.has(f.probability)).length;

  const statItems = [
    { label: 'Total de respostas', value: feedbacks.length },
    { label: 'Identificadas', value: namedCount, tone: 'accent' },
    { label: 'Anônimas', value: anonCount, tone: 'used' },
    { label: 'Recomendação alta', value: highRecommendation, tone: 'free' },
  ];

  const identityChips = [
    { value: 'all', label: 'Todas', count: feedbacks.length },
    { value: 'named', label: 'Identificadas', count: namedCount },
    { value: 'anon', label: 'Anônimas', count: anonCount },
  ];

  const term = search.trim().toLowerCase();
  const filteredFeedbacks = feedbacks.filter((f) => {
    const hasName = !!(f.name || '').trim();
    if (identityFilter === 'named' && !hasName) return false;
    if (identityFilter === 'anon' && hasName) return false;
    if (term && !(f.name || '').toLowerCase().includes(term)) return false;
    return true;
  });

  const toolsButtons = [
    {
      fill: '#007185',
      iconSize: 22,
      id: 'export-feedbacks',
      name: 'Baixar Relatório',
      onClick: () => generateExcel(),
      typeButton: 'outline-teal-blue',
      typeIcon: 'excel',
    },
    {
      fill: '#dc3545',
      iconSize: 22,
      id: 'delete-all',
      name: 'Deletar Todos Feedbacks',
      onClick: () => setShowDeleteModal(true),
      typeButton: 'outline-danger',
      typeIcon: 'danger',
    },
  ];

  return (
    <div className="admin-subpage admin-subpage--feedback">
      <AdminSubpageHeader
        sessionKey="opiniao"
        username={loggedUsername}
        title="Feedbacks"
        subtitle="Opiniões enviadas pelos participantes"
        typeIcon="feedback"
      />

      <div className="admin-subpage__content">
        <AdminToolbar buttons={toolsButtons} />

        <StatCards items={statItems} />

        <div className="feedback-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Buscar por nome..." />
          <FilterChips options={identityChips} value={identityFilter} onChange={setIdentityFilter} />
        </div>

        <SectionHeader title="Feedbacks" count={filteredFeedbacks.length} />

        <div className="admin-table-card">
          <Table striped bordered hover responsive className="custom-table">
            <thead>
              <tr>
                {TABLE_HEADERS.map((header, index) => (
                  <th key={index} className="table-cells-header">
                    {header}:
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((feedback, rowIndex) => {
                const values = Object.values(feedback);
                return (
                  <tr key={rowIndex}>
                    {TABLE_HEADERS.map((header, colIndex) => {
                      const value = values[colIndex];
                      if (RATING_HEADERS.has(header) && value) {
                        const tone = RATING_TONE[value] || 'secondary';
                        return (
                          <td key={colIndex}>
                            <Badge bg={tone} text={tone === 'warning' ? 'dark' : undefined}>
                              {value}
                            </Badge>
                          </td>
                        );
                      }
                      return <td key={colIndex}>{value || <span className="text-secondary small">—</span>}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

      <CustomModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        variant="cancel"
        title="Confirmar Exclusão"
        centered={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="btn-cancel" onClick={handleDeleteFeedbacks}>
              Deletar
            </Button>
          </>
        }
      >
        Tem certeza que deseja excluir todos os Feedbacks?{' '}
        <em>
          <b>Essa ação é irreversível!</b>
        </em>
      </CustomModal>

        <Loading loading={loading} />
      </div>
    </div>
  );
};

AdminFeedback.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminFeedback;
