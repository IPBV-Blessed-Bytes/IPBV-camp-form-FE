import { Container } from 'react-bootstrap';
import { StoreNav, StoreFooter } from '@/components/Storefront/StorefrontChrome';
import './style.scss';

const TERMS_VERSION = '2026-09-29';

const Terms = () => (
  <div className="storefront terms-page">
    <StoreNav />
    <Container className="terms-page__wrap">
      <h1>Termos e Condições de Uso</h1>
      <p className="terms-page__meta">Versão {TERMS_VERSION}</p>

      <div className="terms-page__notice">
        <strong>Rascunho — pendente de revisão jurídica.</strong> Este texto é um ponto de partida e deve ser
        revisado e aprovado por um advogado/contador antes do uso comercial. Não constitui aconselhamento jurídico.
      </div>

      <section>
        <h2>1. Sobre o serviço</h2>
        <p>
          A plataforma oferece um sistema de inscrições e gestão de eventos (o &quot;Serviço&quot;) para igrejas e
          organizações (&quot;Cliente&quot;). O Cliente é responsável pelo conteúdo do seu evento, pelos valores
          cobrados e pela relação com os seus inscritos.
        </p>
      </section>

      <section>
        <h2>2. Conta e responsabilidades do Cliente</h2>
        <p>
          O Cliente é responsável por manter a confidencialidade das suas credenciais, pela veracidade das
          informações cadastradas e pelo cumprimento das leis aplicáveis ao seu evento, incluindo obrigações
          fiscais e a emissão de notas fiscais aos seus inscritos, quando aplicável.
        </p>
      </section>

      <section>
        <h2>3. Pagamentos e taxas</h2>
        <p>
          Os pagamentos das inscrições são processados por um provedor de pagamento terceirizado. Sobre cada
          inscrição paga pode incidir uma taxa da plataforma, informada no momento da criação do evento. Nos
          eventos gratuitos pode ser cobrada uma taxa fixa. O repasse dos valores ao Cliente segue as regras e
          prazos do provedor de pagamento.
        </p>
      </section>

      <section>
        <h2>4. Proteção de dados (LGPD)</h2>
        <p>
          A plataforma trata dados pessoais dos inscritos em nome do Cliente, na qualidade de operadora, conforme a
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018). O Cliente, como controlador, é responsável pela base
          legal do tratamento e pelas comunicações aos titulares.
        </p>
      </section>

      <section>
        <h2>5. Disponibilidade e limitação de responsabilidade</h2>
        <p>
          O Serviço é fornecido &quot;no estado em que se encontra&quot;. Empregamos esforços razoáveis para manter
          a plataforma disponível, mas não garantimos operação ininterrupta. A responsabilidade da plataforma
          limita-se, no máximo, aos valores de taxa efetivamente pagos pelo Cliente à plataforma.
        </p>
      </section>

      <section>
        <h2>6. Inadimplência e suspensão</h2>
        <p>
          O não pagamento das taxas devidas pode acarretar a suspensão do formulário público e, posteriormente, do
          acesso administrativo, conforme comunicado ao Cliente, até a regularização.
        </p>
      </section>

      <section>
        <h2>7. Alterações</h2>
        <p>
          Estes Termos podem ser atualizados. A versão vigente é identificada pela data acima. O uso continuado do
          Serviço após alterações implica concordância com a versão então vigente.
        </p>
      </section>

      <section>
        <h2>8. Contato</h2>
        <p>Dúvidas sobre estes Termos podem ser encaminhadas pelos canais de contato informados na plataforma.</p>
      </section>
    </Container>
    <StoreFooter />
  </div>
);

export default Terms;
