import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { exportBackup, emailBackup } from '@/services/backup';
import { registerLog } from '@/services/logs';
import { getEventSlug } from '@/config/eventScope';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import './style.scss';

const AdminBackup = ({ loggedUsername }) => {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  scrollUp();

  const slug = getEventSlug();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${slug || 'evento'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Backup baixado com sucesso.');
      registerLog('Baixou o backup completo do evento', loggedUsername);
    } catch {
      toast.error('Não foi possível gerar o backup.');
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      const res = await emailBackup();
      if (res?.status === 'success') {
        toast.success(`Backup enviado para ${res.sentTo || 'seu e-mail'}.`);
        registerLog('Enviou o backup do evento por e-mail', loggedUsername);
      } else {
        toast.error('O e-mail de backup não pôde ser enviado.');
      }
    } catch {
      toast.error('Não foi possível enviar o backup por e-mail.');
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="admin-subpage backup-page">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Backup"
        subtitle="Exporte uma cópia completa e restaurável deste evento"
        typeIcon="excel"
      />

      <div className="admin-subpage__content backup-page__content">
        <Card className="backup-card">
          <Card.Body>
            <Card.Title>O que o backup inclui</Card.Title>
            <p className="text-secondary mb-0">
              Um arquivo JSON com a configuração do evento, o formulário (seções e campos), produtos, lotes e preços,
              inscrições e pagamentos, além de quartos e caronas. Contém apenas os dados <b>deste evento</b>.
            </p>
          </Card.Body>
        </Card>

        <div className="backup-actions">
          <Card className="backup-action">
            <Card.Body>
              <span className="backup-action__icon">
                <Icons typeIcon="excel" iconSize={30} fill="#007185" />
              </span>
              <Card.Title>Baixar backup</Card.Title>
              <Card.Text className="text-secondary">Gera e baixa o arquivo JSON agora, no seu dispositivo.</Card.Text>
              <Button variant="teal-blue" onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Gerando...' : 'Baixar backup (JSON)'}
              </Button>
            </Card.Body>
          </Card>

          <Card className="backup-action">
            <Card.Body>
              <span className="backup-action__icon">
                <Icons typeIcon="message" iconSize={30} fill="#007185" />
              </span>
              <Card.Title>Enviar por e-mail</Card.Title>
              <Card.Text className="text-secondary">Envia o backup em anexo para o seu e-mail de administrador.</Card.Text>
              <Button variant="outline-teal-blue" onClick={handleEmail} disabled={emailing}>
                {emailing ? 'Enviando...' : 'Enviar para meu e-mail'}
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

AdminBackup.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminBackup;
