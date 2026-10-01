import { useState, useEffect } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { exportBackup, emailBackup, getBackupConfig, saveBackupConfig, restoreBackup } from '@/services/backup';
import { registerLog } from '@/services/logs';
import { getEventSlug } from '@/config/eventScope';
import scrollUp from '@/hooks/useScrollUp';
import Icons from '@/components/Global/Icons';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import FormSection from '@/components/Admin/FormSection';
import './style.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const AdminBackup = ({ loggedUsername }) => {
  const { t } = useTranslation();
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
        toast.error(t('admin.backup.scheduleEmailRequired'));
        setSavingConfig(false);
        return;
      }
      const data = await saveBackupConfig({ backupEmail: config.backupEmail.trim(), backupFrequency: config.backupFrequency });
      setConfig((prev) => ({ ...prev, ...data }));
      toast.success(t('admin.backup.scheduleSaved'));
      registerLog('Atualizou o agendamento de backup do evento', loggedUsername);
    } catch {
      toast.error(t('admin.backup.scheduleSaveError'));
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
      toast.success(t('admin.backup.downloadSuccess'));
      registerLog('Baixou o backup completo do evento', loggedUsername);
    } catch {
      toast.error(t('admin.backup.downloadError'));
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      const res = await emailBackup();
      if (res?.status === 'success') {
        toast.success(t('admin.backup.emailSuccess', { target: res.sentTo || t('admin.backup.emailTargetFallback') }));
        registerLog('Enviou o backup do evento por e-mail', loggedUsername);
      } else {
        toast.error(t('admin.backup.emailNotSent'));
      }
    } catch {
      toast.error(t('admin.backup.emailError'));
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
          toast.error(t('admin.backup.invalidFile'));
          return;
        }
        setRestore((prev) => ({ ...prev, snapshot: parsed, fileName: file.name }));
      } catch {
        toast.error(t('admin.backup.readError'));
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!restore.snapshot) {
      toast.error(t('admin.backup.selectFile'));
      return;
    }
    if (!restore.newSlug.trim()) {
      toast.error(t('admin.backup.slugRequired'));
      return;
    }
    setRestoring(true);
    try {
      const res = await restoreBackup({
        newSlug: restore.newSlug.trim(),
        newName: restore.newName.trim(),
        snapshot: restore.snapshot,
      });
      toast.success(t('admin.backup.restoreSuccess', { slug: res.slug, rows: res.restoredRows }));
      registerLog(`Restaurou um backup no evento ${res.slug}`, loggedUsername);
      setRestore({ snapshot: null, fileName: '', newSlug: '', newName: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || t('admin.backup.restoreError'));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="admin-subpage backup-page">
      <AdminSubpageHeader
        username={loggedUsername}
        title={t('admin.backup.title')}
        subtitle={t('admin.backup.subtitle')}
        typeIcon="excel"
      />

      <div className="admin-subpage__content backup-page__content">
        <FormSection title={t('admin.backup.includesTitle')}>
          <p className="text-secondary mb-0">
            <Trans i18nKey="admin.backup.includesText" components={{ b: <b /> }} />
          </p>
        </FormSection>

        <div className="backup-actions">
          <Card className="backup-action">
            <Card.Body>
              <span className="backup-action__icon">
                <Icons typeIcon="excel" iconSize={30} fill="#007185" />
              </span>
              <Card.Title>{t('admin.backup.downloadCardTitle')}</Card.Title>
              <Card.Text className="text-secondary">{t('admin.backup.downloadCardText')}</Card.Text>
              <SpinnerButton variant="teal-blue" onClick={handleDownload} loading={downloading}>{t('admin.backup.downloadBtn')}</SpinnerButton>
            </Card.Body>
          </Card>

          <Card className="backup-action">
            <Card.Body>
              <span className="backup-action__icon">
                <Icons typeIcon="message" iconSize={30} fill="#007185" />
              </span>
              <Card.Title>{t('admin.backup.emailCardTitle')}</Card.Title>
              <Card.Text className="text-secondary">{t('admin.backup.emailCardText')}</Card.Text>
              <SpinnerButton variant="outline-teal-blue" onClick={handleEmail} loading={emailing}>{t('admin.backup.emailBtn')}</SpinnerButton>
            </Card.Body>
          </Card>
        </div>

        <FormSection title={t('admin.backup.autoTitle')}>
            <p className="text-secondary">
              {t('admin.backup.autoText')}
            </p>
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.backup.frequency')}</Form.Label>
              <Form.Select
                value={config.backupFrequency}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupFrequency: e.target.value }))}
                style={{ maxWidth: 280 }}
              >
                <option value="off">{t('admin.backup.freqOff')}</option>
                <option value="daily">{t('admin.backup.freqDaily')}</option>
                <option value="weekly">{t('admin.backup.freqWeekly')}</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.backup.destinationEmail')}</Form.Label>
              <Form.Control
                type="email"
                value={config.backupEmail}
                onChange={(e) => setConfig((prev) => ({ ...prev, backupEmail: e.target.value }))}
                placeholder={t('admin.backup.emailPlaceholder')}
                disabled={config.backupFrequency === 'off'}
                style={{ maxWidth: 420 }}
              />
            </Form.Group>
            {config.lastBackupAt && (
              <p className="text-secondary small mb-3">
                {t('admin.backup.lastAutoBackup', { date: String(config.lastBackupAt).slice(0, 16).replace('T', ' ') })}
              </p>
            )}
            <SpinnerButton variant="teal-blue" onClick={handleSaveConfig} loading={savingConfig}>{t('admin.backup.saveSchedule')}</SpinnerButton>
        </FormSection>

        <FormSection title={t('admin.backup.restoreTitle')}>
            <p className="text-secondary">
              <Trans i18nKey="admin.backup.restoreText" components={{ b: <b /> }} />
            </p>
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.backup.fileLabel')}</Form.Label>
              <Form.Control type="file" accept="application/json,.json" onChange={handleFile} />
              {restore.fileName && <Form.Text className="text-success">{t('admin.backup.selectedFile', { name: restore.fileName })}</Form.Text>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.backup.newSlugLabel')}</Form.Label>
              <Form.Control
                type="text"
                value={restore.newSlug}
                onChange={(e) => setRestore((prev) => ({ ...prev, newSlug: e.target.value }))}
                placeholder={t('admin.backup.slugPlaceholder')}
                style={{ maxWidth: 420 }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('admin.backup.newNameLabel')}</Form.Label>
              <Form.Control
                type="text"
                value={restore.newName}
                onChange={(e) => setRestore((prev) => ({ ...prev, newName: e.target.value }))}
                placeholder={t('admin.backup.namePlaceholder')}
                style={{ maxWidth: 420 }}
              />
            </Form.Group>
            <Button variant="teal-blue" onClick={handleRestore} disabled={restoring || !restore.snapshot}>
              {restoring ? t('admin.backup.restoring') : t('admin.backup.restoreBtn')}
            </Button>
        </FormSection>
      </div>
    </div>
  );
};

AdminBackup.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminBackup;
