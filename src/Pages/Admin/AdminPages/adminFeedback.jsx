import { useState, useEffect } from 'react';
import { Container, Row, Table } from 'react-bootstrap';
import fetcher from '@/fetchers/fetcherWithCredentials';
import Loading from '@/components/Loading';
import AdminHeader from '../AdminComponents/adminHeader';
import scrollUp from '@/fetchers/scrollUp';

const AdminFeedback = () => {
  const [loading, setLoading] = useState(false);

  scrollUp();

  return (
    <Container fluid>
      <AdminHeader pageName="Gerenciamento de Feedbacks" sessionTypeIcon="feedback" iconSize={80} fill={'#204691'} />

      <Row>
        <Table striped bordered hover responsive className="custom-table">
          <thead>
            <tr>
              <th className="table-cells-header">Nome:</th>
              <th className="table-cells-header">Organização:</th>
              <th className="table-cells-header">Experiência:</th>
              <th className="table-cells-header">Alimentação:</th>
              <th className="table-cells-header">Programação:</th>
              <th className="table-cells-header">Estrutura Física:</th>
              <th className="table-cells-header">Acolhimento:</th>
              <th className="table-cells-header">Probabilidade de Volta:</th>
              <th className="table-cells-header">Campo Aberto:</th>
            </tr>
          </thead>
          <tbody></tbody>
        </Table>
      </Row>

      <Loading loading={loading} />
    </Container>
  );
};

export default AdminFeedback;
