import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

import {
  getMinorTemplateExists,
  uploadMinorTemplate,
  deleteMinorTemplate,
  minorTemplateDownloadUrl,
} from '@/services/minorTemplate';
import { getApiErrorMessage } from '@/fetchers/helpers';
import Icons from '@/components/Global/Icons';
import './MinorTemplateCard.scss';

const MinorTemplateCard = () => {
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
      toast.success('Modelo enviado com sucesso.');
      setExists(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Não foi possível enviar o modelo.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteMinorTemplate();
      toast.success('Modelo removido.');
      setExists(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Não foi possível remover o modelo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="minor-template-card">
      <div className="minor-template-card__info">
        <Icons typeIcon="form-context" iconSize={26} fill="#204691" />
        <div>
          <p className="minor-template-card__title">Modelo de documento para menores</p>
          <p className="minor-template-card__subtitle">
            Arquivo modelo (ex.: declaração/autorização) que os responsáveis podem baixar no formulário. Um por evento.
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
            Baixar atual
          </a>
        )}
        <Button size="sm" variant="teal-blue" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? 'Enviando...' : exists ? 'Substituir' : 'Enviar modelo'}
        </Button>
        {!loading && exists && (
          <Button size="sm" variant="outline-danger" disabled={busy} onClick={handleDelete}>
            Remover
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
