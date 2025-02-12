import { expect } from '@playwright/test';
import { faqTest as test } from 'tests/fixtures/faqTest';

test.describe('FAQ flow', () => {
  test('Verify if it is possible to view FAQ page', async ({ page, faq }) => {
    await page.goto('/', {
      waitUntil: 'commit',
    });

    await expect(faq.infoButton).toBeHidden();
    await faq.ageToast.click();
    await page.waitForTimeout(5000);
    await faq.openFaqPage();
    await expect(faq.faqHeading).toBeVisible();

    await faq.firstQuestionButton.click();
    await expect(faq.firstQuestionContent).toBeVisible();

    await faq.secondQuestionButton.click();
    await expect(faq.secondQuestionContent).toBeVisible();

    await faq.thirdQuestionButton.click();
    await expect(faq.thirdQuestionContent).toBeVisible();

    const expectedQuestions = [
      '1. Como faço minha inscrição para o acampamento?',
      '2. Eu posso verificar ou editar os dados da minha inscrição?',
      '3. Quais formas de pagamento estão disponíveis?',
      '4. Quando pode acontecer de a minha inscrição não gerar pagamento?',
      '5. O que está incluso no valor da inscrição?',
      '6. Posso cancelar minha inscrição? Existe a possibilidade de reembolso?',
      '7. Por que preciso pagar taxas nas operações de pagamento?',
      '8. Por que apareceu uma taxa de 50 reais para eu pagar?',
      '9. O que fazer se houver erro ao tentar fazer a inscrição?',
      '10. Quando e onde será o acampamento?',
      '11. Existe transporte organizado para o acampamento?',
      '12. Qual o horário e local de saída do ônibus?',
      '13. Meu filho menor de idade vai comigo no ônibus. Devo enviar algum documento?',
      '14. Posso adquirir refeições extras (avulsas) durante o acampamento?',
      '15. Qual deve ser minha primeira ação ao chegar em Garanhuns?',
      '16. É necessário cadastrar todos os membros da minha família?',
      '17. Quais itens devo levar para o acampamento?',
      '18. O que é o campo de acompanhante no formulário de inscrição?',
      '19. Haverá departamento infantil?',
      '20. Posso escolher meu quarto?',
    ];

    const receivedQuestions = await faq.question.allTextContents();
    expect(receivedQuestions).toEqual(expectedQuestions);

    await faq.backButton.click();
    await expect(faq.formMainTitle).toBeVisible();
  });
});
