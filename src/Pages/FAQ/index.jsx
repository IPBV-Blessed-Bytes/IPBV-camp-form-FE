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
              restem dúvidas, entre em contato com a organização do evento pelo contato 81 9.9999-7767 (WhatsApp).
            </Card.Text>
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>1. Quando e onde será o acampamento?</Accordion.Header>
                <Accordion.Body>
                  O acampamento ocorrerá no feriado de Carnaval, de 14/02 a 18/02 (sábado a quarta-feira), com chegada a
                  partir das 10h no sábado e saída até 10h na quarta-feira. O local será o Colégio Presbiteriano XV de
                  Novembro, em Garanhuns (Praça Souto Filho, 696 - Heliópolis, Garanhuns - PE, 55295-400).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>2. Como faço minha inscrição para o acampamento?</Accordion.Header>
                <Accordion.Body>
                  Exclusivamente pelo link ou QR CODE divulgados. Não haverá inscrição em papel ou verbal. A inscrição
                  só é confirmada após o preenchimento de todos os campos obrigatórios e o pagamento. Não é necessário
                  anexar nem enviar o comprovante, pois o sistema reconhecerá o pagamento automaticamente.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>3. Quais formas de pagamento estão disponíveis?</Accordion.Header>
                <Accordion.Body>
                  Como todas as inscrições são feitas pelo sistema, aceitamos: cartão de crédito (em até 12 vezes), PIX
                  e boleto bancário (este, apenas em parcela única). Certifique-se de seguir as instruções até a etapa
                  final para confirmar o pagamento. Após a validação, você receberá um email de confirmação (verifique
                  também sua caixa de spam).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  4. Posso cancelar minha inscrição? Existe a possibilidade de reembolso?
                </Accordion.Header>
                <Accordion.Body>
                  Sim, você pode cancelar sua inscrição. Se o pedido for feito em até 48 horas úteis após a inscrição, o
                  valor poderá ser reembolsado integralmente, desde que respeitado o prazo limite de 01/02/2026. Após
                  esse período de 48 horas, o reembolso será limitado a 50% do valor pago.
                  <br />
                  <br />
                  Os pedidos de cancelamento devem ser realizados até duas semanas antes do acampamento (data limite em
                  01/02/2026). Passado esse prazo, não haverá reembolso, devido aos custos já aplicados em fornecedores
                  e insumos.
                  <br />
                  <br />
                  Em caso de desistência, o valor pago não será convertido em crédito para outros eventos. Também não
                  haverá devolução do valor correspondente às refeições caso o participante opte por não consumi-las.
                  <br />
                  <br />
                  Situações excepcionais (como motivos de saúde comprovados) poderão ser analisadas individualmente, sem
                  garantia de reembolso. Caso precise repassar sua inscrição para outra pessoa, os valores devem ser
                  resolvidos entre os envolvidos, sendo obrigatório informar a organização para atualização do cadastro.
                  <br />
                  <br />
                  Para solicitar cancelamento, entre em contato com a organização do evento pelo contato 81 9.9999-7767
                  (WhatsApp).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="4">
                <Accordion.Header>5. Como confirmo se minha inscrição está correta?</Accordion.Header>
                <Accordion.Body>
                  Haverá um campo no canto inferior esquerdo chamado &quot;verificar inscrição&quot;, onde você poderá
                  confirmar se sua inscrição está ativa e visualizar seus dados. Também é possível acessar diretamente
                  em{' '}
                  <a
                    className="faq-link"
                    href="https://inscricaoipbv.com.br/verificacao"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://inscricaoipbv.com.br/verificacao
                  </a>
                  .
                  <br />
                  <br />
                  Para corrigir algum dado incorreto, entre em contato com a organização do evento pelo contato 81
                  9.9999-7767 (WhatsApp) e solicite a alteração.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="5">
                <Accordion.Header>6. Eu posso verificar ou editar os dados da minha inscrição?</Accordion.Header>
                <Accordion.Body>
                  Sim, você pode verificar e editar os dados da sua inscrição. Para verificar, acesse{' '}
                  <a
                    className="faq-link"
                    href="https://inscricaoipbv.com.br/verificacao"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://inscricaoipbv.com.br/verificacao
                  </a>{' '}
                  e informe o CPF e a data de nascimento. O sistema exibirá seus dados cadastrados. Para editar algum
                  dado, entre em contato com a organização do evento pelo contato 81 9.9999-7767 (WhatsApp).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="6">
                <Accordion.Header>7. Quando pode acontecer de a inscrição não gerar pagamento?</Accordion.Header>
                <Accordion.Body>
                  Isso pode ocorrer se você informar incorretamente sua data de nascimento. Nesse caso, o sistema pode
                  interpretar que você é criança e não gerar cobrança. Entre em contato com a organização do evento pelo
                  contato 81 9.9999-7767 (WhatsApp) para corrigir o dado e efetuar o pagamento corretamente.
                  <br />
                  <br />
                  Atenção ao preencher todos os campos!
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="7">
                <Accordion.Header>8. Posso preencher o formulário e pagar depois?</Accordion.Header>
                <Accordion.Body>
                  Não. O sistema não salva dados sem pagamento. A inscrição só é confirmada após o pagamento.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="8">
                <Accordion.Header>9. O que fazer se houver erro ao tentar fazer a inscrição?</Accordion.Header>
                <Accordion.Body>
                  Primeiro, observe a mensagem de erro exibida. Se for algo simples, corrija e tente novamente. Caso
                  persista, atualize a página e/ou tente mais tarde. Se o problema continuar, entre em contato com a
                  organização do evento pelo contato 81 9.9999-7767 (WhatsApp).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="9">
                <Accordion.Header>10. Não sei usar computador. Como faço?</Accordion.Header>
                <Accordion.Body>
                  A equipe de credenciamento poderá, excepcionalmente, realizar sua inscrição aos domingos ou por meio
                  da secretaria da igreja até o dia 01/02/2026.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="10">
                <Accordion.Header>11. Por que preciso pagar uma taxa de inscrição?</Accordion.Header>
                <Accordion.Body>
                  Para o acampamento de 2026, os produtos foram separados para melhor organização dos custos. Cada
                  participante poderá visualizar e adquirir transporte, hospedagem e alimentação separadamente. Além
                  disso, há a taxa de inscrição, obrigatória a todos, que cobre despesas gerais (preletor, utilização do
                  colégio, equipe de limpeza, etc.).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="11">
                <Accordion.Header>12. Por que há taxas adicionais nas operações de pagamento?</Accordion.Header>
                <Accordion.Body>
                  Essas taxas são definidas pela empresa de pagamentos (Pagar.me - Stone). Elas variam conforme o
                  método: fixa para PIX e boleto, e proporcional ao número de parcelas no cartão de crédito. A IPBV não
                  recebe esse valor; ele vai integralmente para a administradora financeira.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="12">
                <Accordion.Header>13. O que está incluso no valor da taxa de inscrição?</Accordion.Header>
                <Accordion.Body>
                  O acesso ao auditório para assistir as palestras e às áreas de lazer do colégio.
                  <br />
                  Nenhuma refeição está inclusa.
                  <br />A partir deste ano, haverá pacotes específicos: um de alimentação e outro de inscrição.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="13">
                <Accordion.Header>14. O que está incluso no valor da inscrição?</Accordion.Header>
                <Accordion.Body>
                  Temos pacotes variados, cada um com sua abrangência. Em geral, a inscrição inclui transporte,
                  hospedagem e alimentação completa (café da manhã, almoço e jantar), iniciando com o almoço de sábado e
                  encerrando com o café da manhã de quarta-feira.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="14">
                <Accordion.Header>15. Posso adquirir refeições extras (avulsas)?</Accordion.Header>
                <Accordion.Body>
                  Não. As refeições estarão disponíveis apenas mediante compra antecipada de pacotes (com ou sem
                  alimentação). Não haverá venda de refeições avulsas antes ou durante o evento.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="15">
                <Accordion.Header>16. É necessário cadastrar todos os membros da minha família?</Accordion.Header>
                <Accordion.Body>
                  Sim, é altamente importante e necessário cadastrar TODOS os membros da sua família que irão ao
                  acampamento, desde um bebê até um idoso. Precisamos garantir alimentação para todos, inclusive
                  crianças, e o departamento infantil precisa se programar com base na quantidade de participantes.
                  Lembrando que as inscrições são INDIVIDUAIS.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="16">
                <Accordion.Header>17. O que é o campo de acompanhante no formulário de inscrição?</Accordion.Header>
                <Accordion.Body>
                  O campo de acompanhante serve para informar quem vai dormir com você no seu quarto (filhos, cônjuge ou
                  parentes). Essa informação nos ajuda na organização da hospedagem, tanto no seminário quanto na
                  escola. Não é necessário informar acompanhantes caso você vá dormir em hospedagem externa.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="17">
                <Accordion.Header>18. Posso escolher meu quarto?</Accordion.Header>
                <Accordion.Body>
                  Não é possível escolher quartos específicos. A divisão será feita pela equipe de organização, visando
                  melhor acomodação para todos, com base nos nomes informados no campo de acompanhantes.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="18">
                <Accordion.Header>19. Existe transporte organizado para o acampamento?</Accordion.Header>
                <Accordion.Body>
                  Sim, oferecemos transporte partindo da igreja, ida e volta. Certifique-se de escolher a opção com
                  ônibus no formulário de inscrição.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="19">
                <Accordion.Header>20. Qual o horário e local de saída do ônibus?</Accordion.Header>
                <Accordion.Body>
                  O ônibus sairá da IPBV às 7h da manhã no sábado. Chegue com, no mínimo, 30 minutos de antecedência.
                  Todos devem portar documento de identificação com foto.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="20">
                <Accordion.Header>
                  21. Meu filho menor de idade vai comigo no ônibus. Devo enviar algum documento?
                </Accordion.Header>
                <Accordion.Body>
                  Sim, você deve digitalizar e enviar com antecedência o documento de identificação do seu filho (RG ou
                  certidão de nascimento) para a organização do evento pelo contato 81 9.9999-7767 (WhatsApp), além de
                  levá-lo no dia da viagem.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="21">
                <Accordion.Header>22. Quais itens devo levar para o acampamento?</Accordion.Header>
                <Accordion.Body>
                  Leve roupas confortáveis para o dia a dia, roupas para piscina
                  <span className="text-danger">
                    <b>*</b>
                  </span>{' '}
                  e atividades, itens de higiene pessoal, toalha de banho, roupa de cama, colchão e travesseiro (caso vá
                  ficar no colégio) e Bíblia.
                  <br />
                  <ul className="my-2">
                    <li className="mb-2">
                      <b>Colégio:</b> colchão, roupa de cama, travesseiro, extensão, adaptador &quot;T&quot;,
                      ventilador, Bíblia, repelente, roupas de cama, toalha, itens de uso pessoal, garrafa de água,
                      roupa de piscina
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      , roupa de frio, fantasia (opcional), camisas de time (opcional).
                    </li>
                    <li className="mb-2">
                      <b>Seminário:</b> roupa de cama, travesseiro, extensão, adaptador &quot;T&quot;, ventilador,
                      Bíblia, repelente, toalha, itens de uso pessoal, garrafa de água, roupa de piscina
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      , roupa de frio, fantasia (opcional), camisas de time (opcional).
                    </li>
                    <li>
                      <b>Externo:</b> Bíblia, repelente, itens de uso pessoal, garrafa de água, roupa de piscina
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      , roupa de frio, fantasia (opcional), camisas de time (opcional).
                    </li>
                  </ul>
                  <span className="text-danger">
                    <b>*OBS.:</b>
                  </span>{' '}
                  <u>
                    <em>Homens:</em> short de cor <br />
                    <em>Mulheres:</em> blusa ou maiô + short de cor <br />
                    <b>Proibido apenas sunga e apenas biquíni!</b>
                  </u>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="22">
                <Accordion.Header>23. Qual deve ser minha primeira ação ao chegar em Garanhuns?</Accordion.Header>
                <Accordion.Body>
                  Antes de ir para os hotéis ou o seminário, vá primeiro ao colégio para fazer o check-in, pegar sua
                  pulseira e identificação do carro. Somente após isso siga para a hospedagem escolhida. Haverá uma
                  recepção próxima à guarita, com equipe designada para o check-in.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="23">
                <Accordion.Header>24. Quais serão as programações?</Accordion.Header>
                <Accordion.Body>
                  O acampamento contará com espaços de lazer (piscina, campo society, quadra de basquete, quadra de
                  vôlei, parquinho e área verde). Haverá oficinas à tarde e programações especiais à noite, após os
                  cultos. Todas as atividades serão divulgadas previamente no site e no grupo de WhatsApp (a ser
                  criado).
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="24">
                <Accordion.Header>25. Haverá departamento infantil?</Accordion.Header>
                <Accordion.Body>Sim, haverá atividades para crianças de 3 a 10 anos.</Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="25">
                <Accordion.Header>26. Posso levar animais de estimação?</Accordion.Header>
                <Accordion.Body>Animais de estimação não são permitidos.</Accordion.Body>
              </Accordion.Item>
            </Accordion>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" size="lg" onClick={() => navigate('/')}>
                Voltar pro Início
              </Button>
            </div>
          </Card.Body>
        </Card>
        <InfoButton />
      </div>
      <Footer handleAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default FAQ;
