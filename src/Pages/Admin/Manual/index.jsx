import PropTypes from 'prop-types';
import scrollUp from '@/hooks/useScrollUp';
import AdminSubpageHeader from '@/components/Admin/AdminSubpageHeader';
import Icons from '@/components/Global/Icons';
import './style.scss';

const SECTIONS = [
  {
    id: 'visao-geral',
    icon: 'camp',
    title: 'Visão geral do painel',
    items: [
      'A tela inicial mostra os contadores do evento (inscritos, vagas, ônibus) e os cards de acesso rápido às seções.',
      'O botão "Configurações" abre as seções de ajuste do evento (produtos, lotes, conteúdo, usuários e mais).',
      'O que você vê depende do seu papel: cada usuário enxerga apenas as seções que o papel dele permite.',
    ],
  },
  {
    id: 'estagio',
    icon: 'form-context',
    title: 'Estágio do formulário (abrir e fechar inscrições)',
    items: [
      'Em Configurações → "Estágio do Formulário" você controla se o formulário público está aberto, em espera, fechado ou em manutenção.',
      '"Aberto" libera as inscrições; "Fechado" mostra uma tela de encerramento; "Manutenção" bloqueia o acesso público e move o admin para /dev.',
      'Ajuste o estágio antes de divulgar o link e ao final do período de inscrições.',
    ],
  },
  {
    id: 'acampantes',
    icon: 'person',
    title: 'Inscrições (Acampantes)',
    items: [
      'Liste, busque e filtre todas as inscrições. Clique numa linha para ver e editar os dados do inscrito.',
      'Faça check-in, gere/consulte boletos, exporte para Excel e acompanhe o status de pagamento.',
      'Inscrições excluídas vão para a Lixeira, de onde podem ser restauradas ou removidas em definitivo.',
    ],
  },
  {
    id: 'produtos',
    icon: 'cart',
    title: 'Produtos, Lotes, Preços e Descontos',
    items: [
      'Em "Produtos" você cadastra hospedagem e transporte, define ícone ou imagem do card, e ativa/desativa itens.',
      'O preço e as vagas são definidos por lote — em "Lotes" você controla os períodos e valores.',
      'Descontos por idade (ex.: crianças grátis) são configurados na própria tela de Produtos, de forma global (alimentação) ou por produto.',
    ],
  },
  {
    id: 'financeiro',
    icon: 'money',
    title: 'Financeiro (Boletos, Taxas, Doações, Reembolsos)',
    items: [
      'Boletos: acompanhe parcelas, reemita, ajuste vencimento e cancele quando necessário.',
      'Taxas de Pagamento: configure as taxas repassadas ao inscrito nas diferentes formas de pagamento.',
      'Doações e Reembolsos: registre doações manuais e processe devoluções de valores.',
    ],
  },
  {
    id: 'organizacao',
    icon: 'rooms',
    title: 'Organização do evento',
    items: [
      'Quartos e Times: distribua os inscritos em acomodações e equipes.',
      'Ônibus e Caronas: organize o transporte e as vagas.',
      'Check-in e Pulseiras: controle a chegada e a identificação durante o acampamento.',
    ],
  },
  {
    id: 'conteudo',
    icon: 'megaphone',
    title: 'Conteúdo público',
    items: [
      'Área Institucional: monta a página inicial pública (textos, fotos, equipe, programação, avisos e parceiros).',
      'Informações Iniciais e Utilitárias: textos de apoio exibidos no formulário.',
      'Perguntas Frequentes (FAQ): monta as dúvidas exibidas na página pública de perguntas.',
    ],
  },
  {
    id: 'acessos',
    icon: 'roles',
    title: 'Usuários, Papéis e Permissões',
    items: [
      'Usuários: cadastre a equipe que terá acesso ao painel.',
      'Papéis e Permissões: defina o que cada papel pode ver e fazer — atribua o papel certo a cada usuário.',
      'Logs de Usuários: acompanhe as ações realizadas no painel.',
    ],
  },
  {
    id: 'manutencao',
    icon: 'settings',
    title: 'Backup, Lixeira e Solicitações',
    items: [
      'Backup: exporte os dados do evento para segurança.',
      'Lixeira: recupere ou remova em definitivo inscrições excluídas.',
      'Solicitações de Alteração: aprove ou recuse pedidos de mudança feitos pelos inscritos.',
    ],
  },
  {
    id: 'deslogado',
    icon: 'form',
    title: 'Como o inscrito usa o sistema (visão pública)',
    items: [
      'A página inicial pública é a Área Institucional; o botão de inscrição leva ao formulário em /inscricao.',
      'O inscrito preenche dados pessoais e contato, escolhe hospedagem e transporte, revisa e escolhe a forma de pagamento.',
      'Ele pode criar conta para acompanhar inscrições e boletos em "Minha conta", e consultar uma inscrição pelo CPF em /verificacao.',
      'As dúvidas comuns ficam na página de Perguntas Frequentes, que você edita no FAQ.',
    ],
  },
];

const AdminManual = ({ loggedUsername }) => {
  scrollUp();

  return (
    <div className="admin-subpage admin-manual">
      <AdminSubpageHeader
        username={loggedUsername}
        title="Manual do Admin"
        subtitle="Guia escrito das seções do painel e de como o inscrito usa o sistema"
        typeIcon="notebook"
      />

      <div className="admin-subpage__content">
        <nav className="admin-manual__toc" aria-label="Índice do manual">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="admin-manual__toc-link">
              <Icons typeIcon={s.icon} iconSize={20} fill="#007185" />
              <span>{s.title}</span>
            </a>
          ))}
        </nav>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="admin-manual__section">
            <h5 className="admin-manual__section-title">
              <Icons typeIcon={s.icon} iconSize={24} fill="#007185" />
              {s.title}
            </h5>
            <ul className="admin-manual__list">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

AdminManual.propTypes = {
  loggedUsername: PropTypes.string,
};

export default AdminManual;
