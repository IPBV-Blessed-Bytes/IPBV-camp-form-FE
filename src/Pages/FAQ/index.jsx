import { Accordion, Card } from 'react-bootstrap';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import scrollUp from '@/hooks/useScrollUp';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import './style.scss';
import InfoButton from '@/components/Global/InfoButton';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';
import FormStepLayout from '@/components/Global/FormStepLayout';
import { eventPath, getEventSlug } from '@/config/eventScope';
import { useEventBranding } from '@/contexts/EventBrandingContext';
import { listFaqs } from '@/services/faqs';

const FAQ = () => {
  useDocumentTitle('site.pageTitles.faq');
  const navigate = useNavigate();
  const { contact } = useEventBranding();
  const phone = contact;

  const { data: faqs = [] } = useQuery({
    queryKey: ['event-faqs', getEventSlug()],
    queryFn: listFaqs,
    staleTime: 5 * 60 * 1000,
  });
  const showDynamic = faqs.length > 0;

  scrollUp();

  return (
    <div className="components-container">
      <Header />
      <div className="form__container faq">
        <FormStepLayout onBack={() => navigate(eventPath('/'))}>
            <Card.Title>Perguntas Frequentes:</Card.Title>
            <Card.Text>
              Dúvidas frequentes que podem ajudar no processo de inscrição, no pré e durante o acampamento. Caso ainda
              restem dúvidas, entre em contato com a organização do evento
              {phone ? ` pelo contato ${phone} (WhatsApp).` : '.'}
            </Card.Text>
            {showDynamic ? (
              <Accordion>
                {faqs.map((faq, index) => (
                  <Accordion.Item eventKey={String(index)} key={faq.id}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>
                      <div className="faq-answer" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer || '') }} />
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Card.Text className="text-secondary">Nenhuma pergunta cadastrada ainda.</Card.Text>
            )}
        </FormStepLayout>
        <InfoButton />
      </div>
      <Footer handleAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default FAQ;
