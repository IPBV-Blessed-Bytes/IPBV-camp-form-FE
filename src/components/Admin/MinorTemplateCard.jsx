import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import {
  getMinorTemplateExists,
  uploadMinorTemplate,
  deleteMinorTemplate,
  minorTemplateDownloadUrl,
} from '@/services/minorTemplate';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Icons from '@/components/Global/Icons';
import './MinorTemplateCard.scss';
import SpinnerButton from '@/components/Global/SpinnerButton';

const MinorTemplateCard = () => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setExists(await getMinorTemplateExists());
    } catch {
      setExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      await uploadMinorTemplate(file);
      toast.success(t('admin.formBuilder.minorTemplate.uploadSuccess'));
      setExists(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.minorTemplate.uploadError'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteMinorTemplate();
      toast.success(t('admin.formBuilder.minorTemplate.removeSuccess'));
      setExists(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || t('admin.formBuilder.minorTemplate.removeError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="minor-template-card">
      <div className="minor-template-card__info">
        <Icons typeIcon="form-context" iconSize={26} fill="#204691" />
        <div>
          <p className="minor-template-card__title">{t('admin.formBuilder.minorTemplate.title')}</p>
          <p className="minor-template-card__subtitle">
            {t('admin.formBuilder.minorTemplate.subtitle')}
          </p>
        </div>
      </div>

      <div className="minor-template-card__actions">
        {!loading && exists && (
          <a
            className="btn btn-outline-teal-blue btn-sm"
            href={minorTemplateDownloadUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('admin.formBuilder.minorTemplate.download')}
          </a>
        )}
        <SpinnerButton size="sm" variant="teal-blue" loading={busy} onClick={() => inputRef.current?.click()}>
          {exists ? t('admin.formBuilder.minorTemplate.replace') : t('admin.formBuilder.minorTemplate.upload')}
        </SpinnerButton>
        {!loading && exists && (
          <Button size="sm" variant="outline-danger" disabled={busy} onClick={handleDelete}>
            {t('admin.formBuilder.minorTemplate.remove')}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          className="d-none"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleUpload}
        />
      </div>
    </div>
  );
};

export default MinorTemplateCard;
