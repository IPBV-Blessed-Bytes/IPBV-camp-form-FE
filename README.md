
# 🎉 **Site de Inscrições - Acampamento IPBV** 🎉

Este projeto faz parte da iniciativa **Blessed Bytes**, sendo a terceira versão da plataforma de inscrições para o acampamento da nossa igreja. Desenvolvemos uma aplicação robusta e segura para simplificar o processo de inscrição, gestão de participantes e pagamentos, tornando a experiência tanto para os usuários quanto para a equipe organizadora muito mais eficiente.

## 🚀 **Visão Geral**

Após o sucesso da primeira e segunda versão, que facilitou a inscrição de mais de 1000 participantes para o acampamento de 2024 e 2025, esta versão 3.0 vem com várias melhorias no frontend e backend, resolvendo débitos técnicos e preenchendo lacunas, mesmo com recursos e tempo limitados. A plataforma agora conta com novas funcionalidades e maior segurança, graças à autenticação via JWT e ao gerenciamento de pagamentos com a biblioteca Pagar.me.

## ✨ **Principais Funcionalidades**

### 🔒 **Autenticação e Segurança**
- Autenticação via **JWT** para proteger todas as áreas logadas.
- Segurança aprimorada com **TLS** implementado via Nginx.
- Gerenciamento de pagamentos seguro utilizando a biblioteca **Pagar.me**.

### 🎨 **Frontend: Simplicidade e Eficiência**
- **Formulário de Inscrição** otimizado com um design mais amigável e intuitivo, 100% responsivo.
- **Refeições Extras**: Participantes que optarem por pacotes sem alimentação podem escolher refeições específicas para determinados dias, pagando apenas pelo que utilizarem.
- **Painel de Administração**: Nova interface para a equipe organizadora, oferecendo:
  - Controle de inscritos e vagas.
  - Controle de usuários
  - Logs de usuários
  - Relatórios em Excel.
  - Filtros de busca e edição direta de inscrições.
- **Gestão de Caronas**: Facilita a conexão entre quem oferece e quem precisa de caronas.
- **Gerenciamento de Quartos**: Facilita a alocação de participantes.
- **Cupons de Desconto**: Administra cupons vinculados ao CPF dos inscritos.
- **Cálculo de Pacotes em função da idade**: Cálculo automático dos valores dos pacotes em função da idade do participante.

### 🛠 **Backend: Estrutura e Eficiência**
- **Refatoração de Código**: Melhor organização e manutenibilidade.
- **Automação de E-mails**: Envio automático de confirmações de inscrição e pagamento.
- **Deploy na AWS**: Redução de custos de R$ 250 para R$ 25 mensais.
- **Documentação**: API documentada com **Swagger**.
- **Docker**: Aplicação completamente containerizada com **Docker Compose**.
- **Boas Práticas**: Uso de DTOs e validação com **Bean Validation**.

## 🛠 **Tecnologias Utilizadas**
- **Frontend**: Javascript com React.Js como framework 
- **Backend**: Spring Boot
- **Testes**: Playwright
- **Autenticação**: JWT
- **Pagamento**: Pagar.me
- **Hospedagem**: AWS (Amazon Web Services)
- **Containerização**: Docker
- **Segurança**: TLS (via Nginx)
- **Documentação**: Swagger

## 🛠 **Tests End to End**
Estamos com 100% da nossa solução coberta por testes end-to-end utilizando o Playwright. Esses testes verificam o bom funcionamento do login, funcionalidades de administração, inscrições, formulário de inscrição, entre outros. Isso garante maior segurança para a aplicação e assegura que nenhuma funcionalidade deixe de funcionar após alterações no código.

## 📂 **Como Executar o Projeto Localmente**

1. Clone o repositório:
   `git clone https://github.com/IPBV-Blessed-Bytes/IPBV-camp-form-FE.git`

2. Instale as dependências:
   `yarn` (considerando que você já tem o yarn instalado, caso contrário instale o yarn via npm)

3. Execute a aplicação:
   `yarn dev`

4. Você poderá acessar pela porta 3000:
   `http://localhost:3000/`

## 🌍 **Deployment**

O projeto está em produção e pode ser acessado [neste link](https://inscricaoipbv.com.br/).

## 👐 **Contribuições**

Este projeto é **open source** e está aberto a contribuições! Sinta-se à vontade para fazer PRs com melhorias, sugestões ou para adaptar a plataforma ao seu contexto local.

1. Faça um fork do repositório.
2. Crie uma nova branch:
   `git checkout -b minha-feature`
3. Faça suas alterações e faça o commit:
   `git commit -m 'Minha nova feature'`
4. Envie para o repositório:
   `git push origin minha-feature`
5. Abra um **Pull Request**.

## 🧑‍💻 **Equipe**

- **Frontend**: Álvaro Leal, Isaac Araujo
- **Backend**: Rodrigo Moura

## 🙏 **Agradecimentos**

Agradecemos a Deus por nos sustentar em cada etapa deste projeto. A Ele toda honra, glória e louvor!
