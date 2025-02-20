import { Locator, Page } from '@playwright/test';

export class FormComponent {
  readonly formTitle: Locator;
  readonly forwardButton: Locator;
  readonly personalInfoHeading: Locator;
  readonly nameField: Locator;
  readonly genderField: Locator;
  readonly birthdayField: Locator;
  readonly cpfField: Locator;
  readonly rgField: Locator;
  readonly rgShipperField: Locator;
  readonly rgShipperStateField: Locator;
  readonly contactHeading: Locator;
  readonly cellphoneField: Locator;
  readonly isWhatsappField: Locator;
  readonly emailField: Locator;
  readonly churchField: Locator;
  readonly carField: Locator;
  readonly numberVacanciesField: Locator;
  readonly rideObservationField: Locator;
  readonly hasAllergyField: Locator;
  readonly allergyField: Locator;
  readonly hasAgregateField: Locator;
  readonly aggregateField: Locator;
  readonly packagesHeading: Locator;
  readonly accomodationAccordion: Locator;
  readonly packageField: Locator;
  readonly finalReviewHeading: Locator;
  readonly finalReviewItems: Locator[];
  readonly nomeFinalField: Locator;
  readonly genderFinalField: Locator;
  readonly packageFinalField: Locator;
  readonly priceFinalField: Locator;
  readonly rideFinalField: Locator;
  readonly numberVacanciesFinalField: Locator;
  readonly birthdayFinalField: Locator;
  readonly churchFinalField: Locator;
  readonly cpfFinalField: Locator;
  readonly rgFinalField: Locator;
  readonly cellphoneFinalField: Locator;
  readonly emailFinalField: Locator;
  readonly allergyFinalField: Locator;
  readonly aggregateFinalField: Locator;
  readonly confirmDataText: Locator;
  readonly confirmDataCheckbox: Locator;
  readonly PaymentHeading: Locator;
  readonly formPaymentField: Locator;
  readonly pagarmeReference: Locator;

  constructor(readonly page: Page) {
    this.formTitle = page.getByRole('heading', { name: 'Acampamento no período de' });
    this.forwardButton = page.getByRole('button', { name: 'Avançar' });
    this.personalInfoHeading = page.locator('div').filter({ hasText: /^Informações Pessoais$/ });

    this.nameField = page.locator('#name');
    this.genderField = page.locator('#gender');
    this.birthdayField = page.getByRole('textbox', { name: 'Preencher Data de nascimento' });
    this.cpfField = page.getByRole('textbox', { name: 'Preencher CPF válido' });
    this.rgField = page.getByRole('textbox', { name: 'Preencher RG válido. Caso não' });
    this.rgShipperField = page.locator('#rgShipper');
    this.rgShipperStateField = page.locator('#rgShipperState');
    this.contactHeading = page.getByText('Informações de Contato');
    this.cellphoneField = page.getByRole('textbox', { name: '(00) 00000-' });
    this.isWhatsappField = page.locator('select[name="isWhatsApp"]');
    this.emailField = page.locator('input[name="email"]');
    this.churchField = page.locator('#church');
    this.carField = page.locator('#car');
    this.numberVacanciesField = page.locator('#numberVacancies');
    this.rideObservationField = page.getByRole('textbox', { name: 'Descreva sua observação sobre' });
    this.hasAllergyField = page.locator('#hasAllergy');
    this.allergyField = page.getByRole('textbox', { name: 'Descreva sua alergia' });
    this.hasAgregateField = page.locator('#hasAggregate');
    this.aggregateField = page.getByRole('textbox', { name: 'NOME e SOBRENOME dos' });
    this.packagesHeading = page.locator('div').filter({ hasText: /^Pacotes$/ });
    this.accomodationAccordion = page.getByRole('button', { name: 'Colégio XV de Novembro' });
    this.packageField = page.getByText('PACOTE 2 - HOSPEDAGEM');
    this.finalReviewHeading = page.getByText('Revisão de Dados');

    this.nomeFinalField = page.getByText('Nome: Test Test');
    this.genderFinalField = page.getByText('Gênero: Homem');
    this.packageFinalField = page.getByText('Pacote: Nome = Colégio XV de Novembro');
    this.priceFinalField = page.getByText('Valor Total:R$ 300');
    this.rideFinalField = page.getByText('Vai de carro e pode oferecer carona: Sim');
    this.numberVacanciesFinalField = page.getByText('Vagas de Carona: 3');
    this.birthdayFinalField = page.getByText('Data de Nascimento: 10/10/1959');
    this.churchFinalField = page.getByText('Igreja: Boa Viagem');
    this.cpfFinalField = page.getByText('CPF: 74510673434');
    this.rgFinalField = page.getByText('RG: 0000000');
    this.cellphoneFinalField = page.getByText('Telefone: 00000000000');
    this.emailFinalField = page.getByText('Email: test@test.com');
    this.allergyFinalField = page.getByText('Alergia: Sim - alergia');
    this.aggregateFinalField = page.getByText('Acompanhantes: Sim');

    this.finalReviewItems = [
      this.nomeFinalField,
      this.genderFinalField,
      this.packageFinalField,
      this.priceFinalField,
      this.rideFinalField,
      this.numberVacanciesFinalField,
      this.birthdayFinalField,
      this.churchFinalField,
      this.cpfFinalField,
      this.rgFinalField,
      this.cellphoneFinalField,
      this.emailFinalField,
      this.allergyFinalField,
      this.aggregateFinalField,
    ];

    this.confirmDataText = page.getByText('Confirma que os dados foram');
    this.confirmDataCheckbox = page.getByRole('checkbox', { name: 'Confirma que os dados foram' });
    this.PaymentHeading = page.locator('div').filter({ hasText: /^Pagamento$/ });
    this.formPaymentField = page.locator('#formPayment');
    this.pagarmeReference = page.getByText('Pedido ACAMP IPBV 2025 x1R$ 300,00SubtotalR$ 300,00Tarifas-TotalR$');
  }

  async fillFormFields(text: string, section: Locator, type: string) {
    if (type === 'text') {
      await this.fillFormTextFields(text, section);
    } else {
      await this.fillFormSelectFields(text, section);
    }
  }

  async fillFormTextFields(text: string, section: Locator) {
    await section.fill(text);
    await section.press('Tab');
  }

  async fillFormSelectFields(select: string, section: Locator) {
    await section.selectOption(select);
    await section.press('Tab');
  }

  async finalReviewFields() {}
}
