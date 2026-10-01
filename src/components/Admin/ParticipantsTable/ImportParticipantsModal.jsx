import { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import { downloadCampersTemplate, parseCampersFile } from '@/Pages/Admin/Participants/utils/importParticipants';
import './ImportParticipantsModal.scss';

const ImportParticipantsModal = ({ show, onHide, onImport, loading }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [result, setResult] = useState(null);
  const [parsing, setParsing] = useState(false);

  const reset = () => {
    setFileName('');
    setParsed(null);
    setUpdateExisting(true);
    setResult(null);
    setParsing(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onHide();
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    try {
      const data = await parseCampersFile(file, t);
      if (!data.rows.length && !data.errors.length) {
        toast.error(t('admin.participantsTable.toastImportEmpty'));
        reset();
        return;
      }
      setParsed(data);
    } catch (error) {
      console.error('Error parsing spreadsheet:', error);
      toast.error(t('admin.participantsTable.toastImportReadError'));
      reset();
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    const res = await onImport({ rows: parsed.rows, updateExisting });
    if (res) setResult(res);
  };

  const footer = result ? (
    <Button variant="teal-blue" onClick={handleClose}>
      {t('admin.participantsTable.importDone')}
    </Button>
  ) : parsed ? (
    <>
      <Button variant="secondary" onClick={reset} disabled={loading}>
        {t('admin.participantsTable.importChangeFile')}
      </Button>
      <Button variant="teal-blue" onClick={handleConfirm} disabled={loading || !parsed.rows.length}>
        {loading
          ? t('admin.participantsTable.importing')
          : t('admin.participantsTable.importCount', { count: parsed.rows.length })}
      </Button>
    </>
  ) : (
    <Button variant="secondary" onClick={handleClose}>
      {t('admin.participantsTable.cancel')}
    </Button>
  );

  return (
    <CustomModal
      show={show}
      onHide={handleClose}
      variant="confirm"
      icon="cart"
      iconFill="#007185"
      title={t('admin.participantsTable.importTitle')}
      centered={false}
      footer={footer}
    >
      <div className="import-campers">
        {!parsed && !result && (
          <div className="import-campers__select">
            <p className="import-campers__hint">
              <Trans
                i18nKey="admin.participantsTable.importHint"
                components={[<b key="0" />, <b key="1" />, <b key="2" />, <b key="3" />, <b key="4" />]}
              />
            </p>

            <button type="button" className="import-campers__template my-2" onClick={downloadCampersTemplate}>
              <Icons typeIcon="excel" iconSize={18} fill="#007185" />
              <span>{t('admin.participantsTable.importDownloadTemplate')}</span>
            </button>

            <label className="import-campers__drop">
              <Icons typeIcon="excel" iconSize={26} fill="#007185" />
              <span>
                {parsing
                  ? t('admin.participantsTable.importReading')
                  : fileName || t('admin.participantsTable.importChooseFile')}
              </span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFile}
                hidden
              />
            </label>
          </div>
        )}

        {parsed && !result && (
          <div className="import-campers__preview">
            <div className="import-campers__counts">
              <span className="chip chip--ok">
                {t('admin.participantsTable.importReadyCount', { count: parsed.rows.length })}
              </span>
              {parsed.errors.length > 0 && (
                <span className="chip chip--err">
                  {t('admin.participantsTable.importErrorCount', { count: parsed.errors.length })}
                </span>
              )}
            </div>

            {parsed.errors.length > 0 && (
              <div className="import-campers__errors">
                <p className="import-campers__errors-title">{t('admin.participantsTable.importIgnoredRows')}</p>
                <ul>
                  {parsed.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>
                      <b>{t('admin.participantsTable.importRowLabel', { row: e.row })}</b> ({e.name}): {e.message}
                    </li>
                  ))}
                </ul>
                {parsed.errors.length > 50 && (
                  <p className="import-campers__more">
                    {t('admin.participantsTable.importAndMore', { count: parsed.errors.length - 50 })}
                  </p>
                )}
              </div>
            )}

            <Form.Check
              type="switch"
              id="import-update-existing"
              className="import-campers__switch"
              label={t('admin.participantsTable.importUpdateExisting')}
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
            />
          </div>
        )}

        {result && (
          <div className="import-campers__result">
            <div className="import-campers__counts">
              <span className="chip chip--ok">
                {t('admin.participantsTable.importCreatedCount', { count: result.created || 0 })}
              </span>
              <span className="chip chip--info">
                {t('admin.participantsTable.importUpdatedCount', { count: result.updated || 0 })}
              </span>
              {(result.skipped || 0) > 0 && (
                <span className="chip chip--muted">
                  {t('admin.participantsTable.importSkippedCount', { count: result.skipped })}
                </span>
              )}
              {(result.errors?.length || 0) > 0 && (
                <span className="chip chip--err">
                  {t('admin.participantsTable.importErrorCount', { count: result.errors.length })}
                </span>
              )}
            </div>
            {result.errors?.length > 0 && (
              <div className="import-campers__errors">
                <p className="import-campers__errors-title">{t('admin.participantsTable.importServerErrors')}</p>
                <ul>
                  {result.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>
                      <b>{t('admin.participantsTable.importRowLabel', { row: (e.index ?? 0) + 1 })}</b>
                      {e.cpf ? t('admin.participantsTable.importCpfLabel', { cpf: e.cpf }) : ''}: {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomModal>
  );
};

ImportParticipantsModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ImportParticipantsModal;
