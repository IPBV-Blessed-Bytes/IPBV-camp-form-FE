import { useState, useEffect } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import { exportBackup, emailBackup, getBackupConfig, saveBackupConfig, restoreBackup } from '@/services/backup';
import { registerLog } from '@/services/logs';
import { getEventSlug } from '@/config/eventScope';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const AdminBackup = ({ loggedUsername }) => {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [config, setConfig] = useState({ backupEmail: '', backupFrequency: 'off', lastBackupAt: null });
  const [savingConfig, setSavingConfig] = useState(false);
  const [restore, setRestore] = useState({ snapshot: null, fileName: '', newSlug: '', newName: '' });
  const [restoring, setRestoring] = useState(false);
  scrollUp();

  const slug = getEventSlug();

  useEffect(() => {
    getBackupConfig()
      .then((data) => setConfig({ backupEmail: data?.backupEmail || '', backupFrequency: data?.backupFrequency || 'off', lastBackupAt: data?.lastBackupAt || null }))
      .catch(() => {});
  }, []);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      if (config.backupFrequency !== 'off' && !config.backupEmail.trim()) {
        toast.error('Informe um e-mail de destino para o agendamento.');
        setSavingConfig(false);
        return;
      }
      const data = await saveBackupConfig({ backupEmail: config.backupEmail.trim(), backupFrequency: config.backupFrequency });
      setConfig((prev) => ({ ...prev, ...data }));
      toast.success('Agendamento de backup salvo.');
      registerLog('Atualizou o agendamento de backup do evento', loggedUsername);
    } catch {
      toast.error('Não foi possível salvar o agendamento.');
    } finally {
      setSavingConfig(false);
    }
  };

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

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed?.tables) {
          toast.error('Arquivo de backup inválido.');
          return;
        }
        setRestore((prev) => ({ ...prev, snapshot: parsed, fileName: file.name }));
      } catch {
        toast.error('Não foi possível ler o arquivo (JSON inválido).');
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!restore.snapshot) {
      toast.error('Selecione um arquivo de backup.');
      return;
    }
    if (!restore.newSlug.trim()) {
      toast.error('Informe o slug do novo evento.');
      return;
    }
    setRestoring(true);
    try {
      const res = await restoreBackup({
        newSlug: restore.newSlug.trim(),
        newName: restore.newName.trim(),
        snapshot: restore.snapshot,
      });
      toast.success(`Evento restaurado em "${res.slug}" (${res.restoredRows} registros).`);
      registerLog(`Restaurou um backup no evento ${res.slug}`, loggedUsername);
      setRestore({ snapshot: null, fileName: '', newSlug: '', newName: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Não foi possível restaurar o backup.');
    } finally {
      setRestoring(false);
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
              <SpinnerButton variant="teal-blue" onClick={handleDownload} loading={downloading}>Baixar backup (JSON)</SpinnerButton>
            </Card.Body>
          </Card>

          <Card className="backup-action">
            <Card.Body>
              <span className="backup-action__icon">
                <Icons typeIcon="message" iconSize={30} fill="#007185" />
              </span>
              <Card.Title>Enviar por e-mail</Card.Title>
              <Card.Text className="text-secondary">Envia o backup em anexo para o seu e-mail de administrador.</Card.Text>
              <SpinnerButton variant="outline-teal-blue" onClick={handleEmail} loading={emailing}>Enviar para meu e-mail</SpinnerButton>
            </Card.Body>
          </Card>
        </div>

        <Card className="backup-card mt-4">
          <Card.Body>
            <Card.Title>Backup automático</Card.Title>
            <p className="text-secondary">
              Envie o backup deste evento por e-mail automaticamente, na frequência escolhida.
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Frequência</Form.Label>
              <Form.Select
                value={config.backupFrequency}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupFrequency: e.target.value }))}
                style={{ maxWidth: 280 }}
              >
                <option value="off">Desligado</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>E-mail de destino</Form.Label>
              <Form.Control
                type="email"
                value={config.backupEmail}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupEmail: e.target.value }))}
                placeholder="backup@suaigreja.com"
                disabled={config.backupFrequency === 'off'}
                style={{ maxWidth: 420 }}
              />
            </Form.Group>
            {config.lastBackupAt && (
              <p className="text-secondary small mb-3">
                Último backup automático: {String(config.lastBackupAt).slice(0, 16).replace('T', ' ')}
              </p>
            )}
            <SpinnerButton variant="teal-blue" onClick={handleSaveConfig} loading={savingConfig}>Salvar agendamento</SpinnerButton>
          </Card.Body>
        </Card>

        <Card className="backup-card mt-4">
          <Card.Body>
            <Card.Title>Restaurar backup</Card.Title>
            <p className="text-secondary">
              Cria um <b>novo evento</b> a partir de um arquivo de backup (configuração, formulário, produtos, lotes,
              inscrições e quartos). Não altera eventos existentes.
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Arquivo de backup (.json)</Form.Label>
              <Form.Control type="file" accept="application/json,.json" onChange={handleFile} />
              {restore.fileName && <Form.Text className="text-success">Selecionado: {restore.fileName}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Slug do novo evento</Form.Label>
              <Form.Control
                type="text"
                value={restore.newSlug}
                onChange={(e) => setRestore((prev) => ({ ...prev, newSlug: e.target.value }))}
                placeholder="acampamento-2027"
                style={{ maxWidth: 420 }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nome do novo evento (opcional)</Form.Label>
              <Form.Control
                type="text"
                value={restore.newName}
                onChange={(e) => setRestore((prev) => ({ ...prev, newName: e.target.value }))}
                placeholder="Acampamento 2027"
                style={{ maxWidth: 420 }}
              />
            </Form.Group>
            <Button variant="teal-blue" onClick={handleRestore} disabled={restoring || !restore.snapshot}>
              {restoring ? 'Restaurando...' : 'Restaurar como novo evento'}
            </Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

AdminBackup.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminBackup;
