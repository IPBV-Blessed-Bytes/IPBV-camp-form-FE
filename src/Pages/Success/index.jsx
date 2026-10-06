import { Container, Button } from 'react-bootstrap';
import campLogo from '../../../public/Images/camp_logo.png';
import { useFormState } from '@/contexts/FormStateContext';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { getEventSchedule } from '@/Pages/Packages/utils/calculateAge';
import { buildEventCalendarUrl } from '@/utils/calendar';
import Icons from '@/components/Global/Icons';
import FormStepLayout from '@/components/Global/FormStepLayout';
import './style.scss';

const Success = () => {
  const { initialStep, resetFormValues, resetFormSubmitted } = useFormState();
  const { name: eventName, mapQuery } = useEventBranding();
  const pathnamePagarme = window.location.search;

  const schedule = getEventSchedule() || {};
  const calendarUrl = buildEventCalendarUrl({
    title: eventName || 'Acampamento',
    baseDate: schedule.baseDate,
    startTime: schedule.startTime,
    endDate: schedule.endDate,
    endTime: schedule.endTime,
    location: mapQuery,
    details: eventName ? `Inscrição confirmada — ${eventName}` : 'Inscrição confirmada',
  });

  const handleNewRegistration = () => {
    resetFormValues();
    initialStep();
    resetFormSubmitted();
    window.location.pathname = '/';
  };

  return (
    <FormStepLayout
      footer={
        <div className="d-flex justify-content-center w-100">
          <Button variant="warning" size="lg" onClick={handleNewRegistration} className="form-success__button">
            Novo Cadastro
          </Button>
        </div>
      }
    >
      <Container>
          <div className="form__success text-center">
            <div className="form__success__title">
              <b>Formulário enviado com sucesso!</b>
            </div>
            <p className="form__success__message">Obrigado por enviar suas informações.</p>
            <p className="form__success__contact">
              <b>Qualquer dúvida entraremos em contato.</b>
              <br />
              <b>Nos vemos em Garanhuns!!!</b>
            </p>
            {calendarUrl && (
              <div className="form__success__calendar">
                <Button
                  variant="teal-blue"
                  as="a"
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons typeIcon="calendar" iconSize={18} fill="#fff" />
                  &nbsp; Adicionar ao Google Agenda
                </Button>
              </div>
            )}
            <small className={`${pathnamePagarme ? 'mt-5' : ''}`}>
              <em>Igreja Presbiteriana de Boa Viagem</em>
            </small>
            <img src={campLogo} className="form__success__logo" alt="logo" />
          </div>
        </Container>
    </FormStepLayout>
  );
};

export default Success;
