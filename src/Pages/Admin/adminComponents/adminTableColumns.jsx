import React from 'react';
import { Row, Form, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminTableColumns = ({ addFormData, editFormData, handleFormChange, addForm, editForm }) => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return (
    <Row>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Pacote:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="package.title"
            value={editForm ? editFormData.package.title : addFormData.package?.title}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Pacote 01 - Nome do Pacote' : ''}
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Nome:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="personalInformation.name"
            value={editForm ? editFormData.personalInformation.name : addFormData.personalInformation?.name}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Nome do Acampante' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Observação:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="observation"
            value={editForm ? editFormData.observation : addFormData.observation}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Observação sobre inscrição' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Pagamento:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="formPayment.formPayment"
            value={editForm ? editFormData.formPayment.formPayment : addFormData.formPayment?.formPayment}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Pago ou Não' : ''}
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Igreja:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.church"
            value={editForm ? editFormData.contact.church : addFormData.contact?.church}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'IPBV ou Outra' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Vai de Carro:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.car"
            value={editForm ? editFormData.contact.car : addFormData.contact?.car}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sim ou Não' : ''}
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Precisa de Carona:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.needRide"
            value={editForm ? editFormData.contact.needRide : addFormData.contact?.needRide}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sim ou Não' : ''}
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Vagas de Carona:</Form.Label>
          </b>
          <Form.Control
            type="number"
            name="contact.numberVacancies"
            value={editForm ? editFormData.contact.numberVacancies : addFormData.contact?.numberVacancies}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? '0' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Data de Inscrição:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="registrationDate"
            value={editForm ? editFormData.registrationDate : formattedDate}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            disabled
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Nascimento:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="personalInformation.birthday"
            value={editForm ? editFormData.personalInformation.birthday : addFormData.personalInformation?.birthday}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? '01/01/1990' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>CPF:</Form.Label>
          </b>
          <Form.Control
            type="number"
            name="personalInformation.cpf"
            value={editForm ? editFormData.personalInformation.cpf : addFormData.personalInformation?.cpf}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? '1234567890' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>RG:</Form.Label>
          </b>
          <Form.Control
            type="number"
            name="personalInformation.rg"
            value={editForm ? editFormData.personalInformation.rg : addFormData.personalInformation?.rg}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? '0123456' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Órgão Expedidor:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="personalInformation.rgShipper"
            value={editForm ? editFormData.personalInformation.rgShipper : addFormData.personalInformation?.rgShipper}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'SDS' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Estado Expedidor:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="personalInformation.rgShipperState"
            value={
              editForm
                ? editFormData.personalInformation.rgShipperState
                : addFormData.personalInformation?.rgShipperState
            }
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'PE' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Categoria:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="personalInformation.gender"
            value={editForm ? editFormData.personalInformation.gender : addFormData.personalInformation?.gender}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Homem, Mulher ou Criança' : ''}
          ></Form.Control>
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Celular:</Form.Label>
          </b>
          <Form.Control
            type="number"
            name="contact.cellPhone"
            value={editForm ? editFormData.contact.cellPhone : addFormData.contact?.cellPhone}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? '81993727854' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Whatsapp:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.isWhatsApp"
            value={editForm ? editFormData.contact.isWhatsApp : addFormData.contact?.isWhatsApp}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sim ou Não' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Email:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.email"
            value={editForm ? editFormData.contact.email : addFormData.contact?.email}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'teste@teste.com' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Preço Total:</Form.Label>
          </b>
          <Form.Control
            type="number"
            name="totalPrice"
            value={editForm ? editFormData.totalPrice : addFormData.totalPrice}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? '500' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Alergia:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.allergy"
            value={editForm ? editFormData.contact.allergy : addFormData.contact?.allergy}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sim ou Não | Quais alergias' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Agregados:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="contact.aggregate"
            value={editForm ? editFormData.contact.aggregate : addFormData.contact?.aggregate}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sim ou Não | Quais agregados' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Acomodação:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="package.accomodation.name"
            value={editForm ? editFormData.package.accomodation.name : addFormData.package?.accomodation?.name}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Colégio, Seminário ou Outro' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Sub Acomodação:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="package.accomodation.subAccomodation"
            value={
              editForm
                ? editFormData.package.accomodation.subAccomodation
                : addFormData.package?.accomodation?.subAccomodation
            }
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sala Individual, família, camping, seminário ou outra' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Alimentação Extra:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="extraMeals.someFood"
            value={editForm ? editFormData.extraMeals.someFood : addFormData.extraMeals?.someFood}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Sim ou Não' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Dias de Alimentação Extra:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="extraMeals.extraMeals"
            value={editForm ? editFormData.extraMeals.extraMeals : addFormData.extraMeals?.extraMeals}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Domingo, Segunda, Terça' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Alimentação:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="package.food"
            value={editForm ? editFormData.package.food : addFormData.package?.food}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Café da manhã, almoço e jantar; Almoço e jantar ou Sem Alimentação' : ''}
          />
        </Form.Group>
      </Col>
      <Col md={12} lg={4} className="mb-3">
        <Form.Group>
          <b>
            <Form.Label>Transporte:</Form.Label>
          </b>
          <Form.Control
            type="text"
            name="package.transportation"
            value={editForm ? editFormData.package.transportation : addFormData.package?.transportation}
            onChange={handleFormChange}
            className={`form-control-lg form-control-bg ${addForm && 'custom-new-registration'}`}
            placeholder={addForm ? 'Com ônibus ou Sem ônibus' : ''}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default AdminTableColumns;
