import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_TITLE = 'Acampamento IPBV';
const DEFAULT_DESCRIPTION =
  'Inscreva-se no Acampamento da Igreja Presbiteriana de Boa Viagem (IPBV). Escolha seu pacote e garanta sua vaga de forma rápida e segura.';

const ROUTE_META = {
  '/': {
    title: 'Acampamento IPBV — Igreja Presbiteriana de Boa Viagem',
    description: DEFAULT_DESCRIPTION,
  },
  '/inscricao': {
    title: 'Inscrição — Acampamento IPBV',
    description: 'Faça sua inscrição online no Acampamento IPBV: preencha seus dados, escolha seu pacote e garanta sua vaga.',
  },
  '/perguntas': {
    title: 'Perguntas Frequentes — Acampamento IPBV',
    description: 'Tire suas dúvidas sobre o Acampamento IPBV: inscrição, pagamento, pacotes e mais.',
  },
  '/verificacao': {
    title: 'Consultar Inscrição — Acampamento IPBV',
    description: 'Consulte os dados da sua inscrição no Acampamento IPBV informando seu CPF.',
  },
  '/entrar': {
    title: 'Entrar — Acampamento IPBV',
    description: 'Acesse sua conta para acompanhar suas inscrições no Acampamento IPBV.',
  },
  '/criar-conta': {
    title: 'Criar Conta — Acampamento IPBV',
    description: 'Crie sua conta para se inscrever e acompanhar o Acampamento IPBV.',
  },
  '/minha-conta': {
    title: 'Minha Conta — Acampamento IPBV',
    description: 'Acompanhe suas inscrições e pagamentos do Acampamento IPBV.',
  },
};

const setMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setProperty = (property, content) => {
  const tag = document.querySelector(`meta[property="${property}"]`);
  if (tag) tag.setAttribute('content', content);
};

const RouteMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = ROUTE_META[pathname];
    const title = meta ? meta.title : BASE_TITLE;
    const description = meta ? meta.description : DEFAULT_DESCRIPTION;

    document.title = title;
    setMetaTag('description', description);
    setProperty('og:title', title);
    setProperty('og:description', description);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);

    const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/dev');
    setMetaTag('robots', isAdmin ? 'noindex, nofollow' : 'index, follow');
  }, [pathname]);

  return null;
};

export default RouteMeta;
