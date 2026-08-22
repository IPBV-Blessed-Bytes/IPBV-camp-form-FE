import { useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import CustomModal from '@/components/Global/CustomModal';
import Icons from '@/components/Global/Icons';
import { downloadCampersTemplate, parseCampersFile } from '@/Pages/Admin/Campers/utils/importCampers';
import './ImportCampersModal.scss';

const ImportCampersModal = ({ show, onHide, onImport, loading }) => {
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
      const data = await parseCampersFile(file);
      if (!data.rows.length && !data.errors.length) {
        toast.error('A planilha está vazia ou não segue o modelo esperado.');
        reset();
        return;
      }
      setParsed(data);
    } catch (error) {
      console.error('Error parsing spreadsheet:', error);
      toast.error('Não foi possível ler o arquivo. Use um .xlsx ou .csv no modelo.');
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
      Concluir
    </Button>
  ) : parsed ? (
    <>
      <Button variant="secondary" onClick={reset} disabled={loading}>
        Trocar arquivo
      </Button>
      <Button variant="teal-blue" onClick={handleConfirm} disabled={loading || !parsed.rows.length}>
        {loading ? 'Importando…' : `Importar ${parsed.rows.length} inscrição(ões)`}
      </Button>
    </>
  ) : (
    <Button variant="secondary" onClick={handleClose}>
      Cancelar
    </Button>
  );

  return (
    <CustomModal
      show={show}
      onHide={handleClose}
      variant="confirm"
      icon="cart"
      iconFill="#007185"
      title="Importar inscrições por planilha"
      centered={false}
      footer={footer}
    >
      <div className="import-campers">
        {!parsed && !result && (
          <div className="import-campers__select">
            <p className="import-campers__hint">
              Envie uma planilha <b>.xlsx</b> ou <b>.csv</b> seguindo o modelo. Cada linha vira uma inscrição.
              As colunas <b>Hospedagem</b>, <b>Transporte</b> e <b>Alimentação</b> são casadas com um pacote já
              existente. CPFs já cadastrados podem ser atualizados.
            </p>

            <button type="button" className="import-campers__template my-2" onClick={downloadCampersTemplate}>
              <Icons typeIcon="excel" iconSize={18} fill="#007185" />
              <span>Baixar modelo (.xlsx)</span>
            </button>

            <label className="import-campers__drop">
              <Icons typeIcon="excel" iconSize={26} fill="#007185" />
              <span>{parsing ? 'Lendo arquivo…' : fileName || 'Clique para escolher a planilha'}</span>
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
              <span className="chip chip--ok">{parsed.rows.length} prontas para importar</span>
              {parsed.errors.length > 0 && <span className="chip chip--err">{parsed.errors.length} com erro</span>}
            </div>

            {parsed.errors.length > 0 && (
              <div className="import-campers__errors">
                <p className="import-campers__errors-title">Linhas ignoradas por erro:</p>
                <ul>
                  {parsed.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>
                      <b>Linha {e.row}</b> ({e.name}): {e.message}
                    </li>
                  ))}
                </ul>
                {parsed.errors.length > 50 && <p className="import-campers__more">e mais {parsed.errors.length - 50}…</p>}
              </div>
            )}

            <Form.Check
              type="switch"
              id="import-update-existing"
              className="import-campers__switch"
              label="Atualizar inscrições cujo CPF já existe"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
            />
          </div>
        )}

        {result && (
          <div className="import-campers__result">
            <div className="import-campers__counts">
              <span className="chip chip--ok">{result.created || 0} criadas</span>
              <span className="chip chip--info">{result.updated || 0} atualizadas</span>
              {(result.skipped || 0) > 0 && <span className="chip chip--muted">{result.skipped} ignoradas</span>}
              {(result.errors?.length || 0) > 0 && <span className="chip chip--err">{result.errors.length} com erro</span>}
            </div>
            {result.errors?.length > 0 && (
              <div className="import-campers__errors">
                <p className="import-campers__errors-title">Erros no servidor:</p>
                <ul>
                  {result.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>
                      <b>Linha {(e.index ?? 0) + 1}</b>
                      {e.cpf ? ` (CPF ${e.cpf})` : ''}: {e.message}
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

ImportCampersModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ImportCampersModal;
