import { Accordion, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import scrollUp from '@/hooks/useScrollUp';
import './style.scss';
import InfoButton from '@/components/Global/InfoButton';
import Header from '@/components/Global/Header';
import Footer from '@/components/Global/Footer';

const FAQ = () => {
  const navigate = useNavigate();

  scrollUp();

  return (
    <div className="components-container">
      <Header />
      <div className="form__container faq">
        <Card>
          <Card.Body>
            <Card.Title>Perguntas Frequentes:</Card.Title>
            <Card.Text>
              Dúvidas frequentes que podem ajudar no processo de inscrição, no pré e durante o acampamento. Caso ainda
              restem dúvidas, entre em contato com a secretaria pelo telefone: (81) 9 9839-0194 (WhatsApp).
            </Card.Text>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>1. Como faço minha inscrição para o acampamento?</Accordion.Header>
                <Accordion.Body>
                  Você pode fazer sua inscrição preenchendo o formulário disponível na nossa plataforma online. Após
                  preencher todos os dados, não se esqueça de confirmar o pagamento para garantir sua vaga. Lembrando
                  que, este ano, todo o processo é digital aqui pela plataforma. Além disso, crianças de até 6 anos não
                  pagam.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>2. Quais formas de pagamento estão disponíveis?</Accordion.Header>
                <Accordion.Body>
                  Como todas as inscrições são feitas pelo sistema, aceitamos uma ampla variedade de formas de
                  pagamento: cartão de crédito (em até 12 vezes), PIX e boleto bancário. Certifique-se de seguir as
                  instruções até a etapa final para confirmar seu pagamento. Após a validação do pagamento, você
                  receberá um email de confirmação, que provavelmente chegará na sua caixa de entrada ou span.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>3. O que está incluso no valor da inscrição?</Accordion.Header>
                <Accordion.Body>
                  Temos vários pacotes, e cada um possui sua abrangência. De forma geral, o valor da inscrição inclui
                  transporte, hospedagem e alimentação completa: café da manhã, almoço e jantar.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  4. Posso cancelar minha inscrição? Existe a possibilidade de reembolso?
                </Accordion.Header>
                <Accordion.Body>
                  Sim, você pode cancelar sua inscrição. Os pedidos de cancelamento devem ser feitos até 7 dias antes do
                  acampamento, sendo definida a data de 22/02/25. Após esse prazo, não haverá reembolso. Caso haja
                  necessidade de cancelamento, entre em contato com a secretaria da IPBV pelo número (81) 9 9839-0194.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header>5. Por que preciso pagar taxas nas operações de pagamento?</Accordion.Header>
                <Accordion.Body>
                  Informamos que a taxa de pagamento, além do valor do pacote, é definida pela empresa de pagamentos
                  (Pagar.me - Stone) que utilizamos. Esse valor é uma taxa proporcional: fixa no caso de PIX ou boleto,
                  e baseada no número de parcelas quando via cartão de crédito. A IPBV não recebe esses valores; eles
                  vão diretamente para a administradora financeira.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="5">
                <Accordion.Header>6. Por que apareceu uma taxa de 50 reais para eu pagar?</Accordion.Header>
                <Accordion.Body>
                  Se você escolheu um pacote SEM ALIMENTAÇÃO, foi cobrada uma taxa de 50 reais para fins de manutenção
                  do acampamento e custos gerais. Se optou por um pacote com alimentação, essa taxa não foi cobrada.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="6">
                <Accordion.Header>7. O que fazer se houver erro ao tentar fazer a inscrição?</Accordion.Header>
                <Accordion.Body>
                  Primeiro, verifique qual mensagem de erro aparece. Se for um erro específico, entenda o problema e
                  ajuste. Caso persista, atualize a página e tente novamente mais tarde. Persistindo o problema, entre
                  em contato com a secretaria pelo número (81) 9 9839-0194.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="7">
                <Accordion.Header>8. Quando e onde será o acampamento?</Accordion.Header>
                <Accordion.Body>
                  O acampamento ocorrerá no feriado de Carnaval, de 01/03 a 05/03 (sábado a quarta-feira), com chegada a
                  partir das 10h no sábado e saída até 10h na quarta-feira. O local será o Colégio Presbiteriano XV de
                  Novembro, em Garanhuns (Praça Souto Filho, 696 - Helópolis, Garanhuns - PE, 55295-400).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="8">
                <Accordion.Header>9. Existe transporte organizado para o acampamento?</Accordion.Header>
                <Accordion.Body>
                  Sim, oferecemos transporte partindo da igreja, ida e volta. Certifique-se de escolher um pacote com
                  essa opção no formulário de inscrição.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="9">
                <Accordion.Header>10. Qual o horário e local de saída do ônibus?</Accordion.Header>
                <Accordion.Body>
                  O ônibus sairá da IPBV às 7h da manhã no sábado. Chegue com, no mínimo, 30 minutos de antecedência.
                  Todos devem portar documento de identificação com foto.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="10">
                <Accordion.Header>
                  11. Meu filho menor de idade vai comigo no ônibus. Devo enviar algum documento?
                </Accordion.Header>
                <Accordion.Body>
                  Sim, você deve digitalizar e enviar o documento de identificação do seu filho (RG ou certidão de
                  nascimento) para o WhatsApp da secretaria da IPBV: (81) 9 9839-0194.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="11">
                <Accordion.Header>
                  12. Posso adquirir refeições extras (avulsas) durante o acampamento?
                </Accordion.Header>
                <Accordion.Body>
                  Sim, porém não é recomendável. Solicitamos que, caso você tenha optado por um pacote sem alimentação,
                  onde o sistema já pergunta se há necessidade de refeições avulsas, adquira-as antecipadamente pelo
                  sistema para evitar trabalho manual. No entanto, se você não tiver feito essa solicitação diretamente
                  no sistema e posteriormente surgir essa necessidade, será possível adquirir refeições avulsas até, no
                  máximo, a refeição anterior. Não será permitido pagar por alimentação avulsa no momento da refeição.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="12">
                <Accordion.Header>13. Qual deve ser minha primeira ação ao chegar em Garanhuns?</Accordion.Header>
                <Accordion.Body>
                  Antes de ir para os hotéis e o seminário, você deve ir primeiro ao colégio para fazer seu check-in,
                  pegar sua pulseira e identificação de carro. Somente após isso, deve se deslocar para a acomodação
                  previamente escolhida. No colégio, haverá uma recepção próxima à guarita, com uma equipe designada
                  para realizar o check-in.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="13">
                <Accordion.Header>14. É necessário cadastrar todos os membros da minha família?</Accordion.Header>
                <Accordion.Body>
                  Sim, é altamente importante e necessário cadastrar TODOS os membros da sua família que irão ao
                  acampamento, desde um bebê com poucos dias de vida até um idoso. A razão é simples: precisamos
                  garantir alimentação para todos, inclusive para as crianças. Além disso, o departamento infantil
                  precisa se programar com base na quantidade de crianças presentes. Lembrando que as inscrições são
                  INDIVIDUAIS.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="14">
                <Accordion.Header>15. Quais itens devo levar para o acampamento?</Accordion.Header>
                <Accordion.Body>
                  Leve roupas confortáveis para o dia a dia, roupas para piscina
                  <span className="text-danger">
                    <b>*</b>
                  </span>{' '}
                  e atividades, itens de higiene pessoal, toalha de banho, roupa de cama, colchão e travesseiro (caso vá
                  ficar no colégio) e Bíblia. <br />
                  <ul className="my-2">
                    <li className="mb-2">
                      <b>Colégio:</b> <br />
                      Colchão, extensão, ventilador, Bíblia, repelente, roupas de cama, toalha, itens de uso pessoal,
                      roupa de piscina
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      , fantasia (camisa de herói, personagens, etc).
                    </li>
                    <li className="mb-2">
                      <b>Seminário:</b> <br />
                      Extensão, ventilador, Bíblia, repelente, toalha, itens de uso pessoal, roupa de piscina
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      , fantasia (camisa de herói, personagens, etc).
                    </li>
                    <li>
                      <b>Externo:</b>
                      <br />
                      Bíblia, repelente, itens de uso pessoal, roupa de piscina
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      , fantasia (camisa de herói, personagens, etc).
                    </li>
                  </ul>
                  <span className="text-danger">
                    <b>*OBS.:</b>
                  </span>{' '}
                  <u>
                    <em>Homens = </em> Com short de cor <br /> <em>Mulheres = </em> Com blusa ou maiô e short de cor
                    <br />
                    Proibido apenas sunga e apenas biquíni!
                  </u>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="15">
                <Accordion.Header>16. O que é o campo de acompanhante no formulário de inscrição?</Accordion.Header>
                <Accordion.Body>
                  O campo de acompanhante serve para informar quem vai dormir com você no seu quarto, sejam filhos,
                  cônjuges ou parentes em geral. Essa informação nos permite organizar a logística de hospedagem, tanto
                  no seminário quanto na escola. Não é necessário informar acompanhantes caso você vá dormir em uma
                  hospedagem diferente do seminário ou da escola.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="16">
                <Accordion.Header>17. Haverá departamento infantil?</Accordion.Header>
                <Accordion.Body>
                  Sim, haverá atividades do departamento infantil para crianças de 2 anos e meio até 10 anos.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="17">
                <Accordion.Header>18. Posso escolher meu quarto?</Accordion.Header>
                <Accordion.Body>
                  Não é possível escolher quartos específicos. A divisão será feita pela equipe de organização visando
                  melhor acomodação para todos, baseado nos nomes informados no campo acompanhantes.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="warning" size="lg" onClick={() => navigate('/')}>
                Voltar pro formulário
              </Button>
            </div>
          </Card.Body>
        </Card>
        <InfoButton />
      </div>
      <Footer onAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default FAQ;
