import { useState } from 'react';
import { Row, Col, Form, Spinner } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import { InputMask, format } from '@react-input/mask';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import Tips from '@/components/Global/Tips';
import Icons from '@/components/Global/Icons';
import { CPF_MASK, PHONE_MASK } from '@/utils/masks';
import { uploadGuardianDocument } from '@/services/documents';
import { extractNumbers } from '../utils/fieldHelpers';

const GenderAndGuardianRow = ({ showLegalGuardianFields, onPersistGuardianName }) => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext();
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDocumentsChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const results = [];
      for (const file of files) {
        const data = await uploadGuardianDocument(file);
        results.push({ id: data.id, fileName: data.fileName });
      }
      const nextDocs = [...uploadedDocs, ...results];
      setUploadedDocs(nextDocs);
      setFieldValue('guardianDocuments', nextDocs.map((doc) => doc.id).join(','));
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast.error('Não foi possível enviar o arquivo. Tente novamente.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeDocument = (id) => {
    const nextDocs = uploadedDocs.filter((doc) => doc.id !== id);
    setUploadedDocs(nextDocs);
    setFieldValue('guardianDocuments', nextDocs.map((doc) => doc.id).join(','));
  };

  return (
    <>
      <Row>
        <Col md={6} className="mb-3">
          <Form.Group>
            <Form.Label>
              <b>Categoria de Acampante:</b>
            </Form.Label>
            <Form.Select
              isInvalid={!!errors.gender}
              value={values.gender}
              name="gender"
              id="gender"
              onChange={handleChange}
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              <option value="Crianca">Criança (até 10 anos)</option>
              <option value="Homem">Adulto Masculino</option>
              <option value="Mulher">Adulto Feminimo</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        {showLegalGuardianFields && (
          <Col md={6} className="mb-3">
            <Form.Group>
              <div className="d-flex gap-2">
                <Form.Label>
                  <b>Nome do Responsável Legal:</b>
                </Form.Label>
                <Tips
                  placement="top"
                  typeIcon="info"
                  size={18}
                  color={'#7f7878'}
                  text="Como a idade informada é menor que 18 anos, é necessário informar os dados de um responsável legal QUE ESTARÁ NO ACAMPAMENTO"
                />
              </div>
              <Form.Control
                type="text"
                id="legalGuardianName"
                isInvalid={!!errors.legalGuardianName}
                value={values.legalGuardianName}
                onChange={(e) => {
                  handleChange(e);
                  onPersistGuardianName({ ...values, legalGuardianName: e.target.value });
                }}
              />
              <Form.Control.Feedback className="d-block" type="invalid">
                {errors.legalGuardianName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
      </Row>

      {showLegalGuardianFields && (
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                <b>CPF do Responsável Legal:</b>
              </Form.Label>
              <InputMask
                component={Form.Control}
                {...CPF_MASK}
                isInvalid={!!errors.legalGuardianCpf}
                name="legalGuardianCpf"
                id="legalGuardianCpf"
                className="cpf-container"
                value={format(values.legalGuardianCpf || '', CPF_MASK)}
                onChange={(event) =>
                  handleChange({
                    target: {
                      name: 'legalGuardianCpf',
                      value: extractNumbers(event.target.value),
                    },
                  })
                }
                placeholder="000.000.000-00"
                title="Preencher CPF válido"
              />
              <Form.Control.Feedback type="invalid">{errors.legalGuardianCpf}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                <b>Telefone do Responsável Legal:</b>
              </Form.Label>
              <InputMask
                component={Form.Control}
                type="text"
                {...PHONE_MASK}
                isInvalid={!!errors.legalGuardianCellPhone}
                id="legalGuardianCellPhone"
                value={format(values.legalGuardianCellPhone || '', PHONE_MASK)}
                onChange={(event) => {
                  handleChange({
                    target: {
                      name: 'legalGuardianCellPhone',
                      value: extractNumbers(event.target.value),
                    },
                  });
                }}
                placeholder="(00) 00000-0000"
              />
              <Form.Control.Feedback type="invalid">{errors.legalGuardianCellPhone}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}

      {showLegalGuardianFields && (
        <Row>
          <Col md={12} className="mb-3">
            <Form.Group>
              <div className="d-flex gap-2">
                <Form.Label>
                  <b>Certidão de Nascimento + Declaração de Responsabilidade:</b>
                </Form.Label>
                <Tips
                  placement="top"
                  typeIcon="info"
                  size={18}
                  color={'#7f7878'}
                  text="Envie foto/PDF da certidão de nascimento do menor e da declaração de responsabilidade assinada, caso este vá sem um responsável legal. Baixe o modelo da declaração no link abaixo."
                />
              </div>
              <div className="guardian-docs-actions">
                <label
                  className={`guardian-upload-btn${errors.guardianDocuments ? ' guardian-upload-btn--invalid' : ''}`}
                >
                  <Icons typeIcon="upload" iconSize={18} />
                  <span>Selecionar Arquivos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    disabled={uploading}
                    onChange={handleDocumentsChange}
                    hidden
                  />
                </label>
                <a className="guardian-template-btn" href="/autorizacao-menor.pdf" download>
                  <Icons typeIcon="download" iconSize={18} />
                  <span>Modelo de Autorização</span>
                </a>
              </div>
              <Form.Text className="text-muted d-block mt-2">
                Baixe o modelo de autorização para viagem de menor desacompanhado caso o menor for sozinho, imprima e
                assine. Depois envie a foto ou PDF da declaração assinada <b>junto com a certidão de nascimento</b> do
                menor. Caso o menor de idade esteja acompanhado de responsável,{' '}
                <b>basta enviar a certidão de nascimento.</b>
              </Form.Text>
              {uploading && (
                <div className="mt-2 d-flex align-items-center gap-2 text-secondary">
                  <Spinner animation="border" size="sm" /> Enviando arquivo...
                </div>
              )}
              {uploadedDocs.length > 0 && (
                <ul className="mt-2 mb-0 ps-3">
                  {uploadedDocs.map((doc) => (
                    <li key={doc.id}>
                      {doc.fileName}{' '}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-danger align-baseline"
                        onClick={() => removeDocument(doc.id)}
                      >
                        remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Form.Control.Feedback className="d-block" type="invalid">
                {errors.guardianDocuments}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}
    </>
  );
};

GenderAndGuardianRow.propTypes = {
  showLegalGuardianFields: PropTypes.bool,
  onPersistGuardianName: PropTypes.func.isRequired,
};

export default GenderAndGuardianRow;
