import { Locator, Page } from '@playwright/test';

export interface PersonalDataInput {
  cpf: string;
  birthday: string;
  name: string;
  rg?: string;
  rgShipper?: string;
  rgShipperState?: string;
  gender: string;
  legalGuardianName?: string;
  legalGuardianCpf?: string;
  legalGuardianCellPhone?: string;
}

export interface ContactDataInput {
  cellPhone: string;
  email: string;
  church: string;
  customChurchName?: string;
  needRide?: 'sim' | 'nao';
  hasAllergy?: 'sim' | 'nao';
  allergy?: string;
  hasAggregate?: 'sim' | 'nao';
  aggregate?: string;
}

export class FormComponent {
  readonly lgpdModal: Locator;
  readonly lgpdCienteButton: Locator;
  readonly homeTitle: Locator;
  readonly advanceButton: Locator;
  readonly backButton: Locator;

  readonly personalDataHeading: Locator;
  readonly cpfInput: Locator;
  readonly birthdayInput: Locator;
  readonly nameInput: Locator;
  readonly rgInput: Locator;
  readonly rgShipperSelect: Locator;
  readonly rgShipperStateSelect: Locator;
  readonly genderSelect: Locator;
  readonly legalGuardianNameInput: Locator;
  readonly legalGuardianCpfInput: Locator;
  readonly legalGuardianCellPhoneInput: Locator;
  readonly ageConfirmationModal: Locator;
  readonly ageConfirmationConfirmButton: Locator;

  readonly contactHeading: Locator;
  readonly cellPhoneInput: Locator;
  readonly emailInput: Locator;
  readonly churchSelect: Locator;
  readonly customChurchInput: Locator;
  readonly needRideSelect: Locator;
  readonly hasAllergySelect: Locator;
  readonly allergyInput: Locator;
  readonly hasAggregateSelect: Locator;
  readonly aggregateInput: Locator;

  readonly packagesHeading: Locator;

  constructor(readonly page: Page) {
    this.lgpdModal = page.getByRole('dialog').filter({ hasText: 'Conformidade com a LGPD' });
    this.lgpdCienteButton = this.lgpdModal.getByRole('button', { name: 'Ciente' });
    this.homeTitle = page.getByRole('heading', { name: /Inscrições até/ });
    this.advanceButton = page.getByRole('button', { name: 'Avançar' });
    this.backButton = page.getByRole('button', { name: 'Voltar', exact: true });

    this.personalDataHeading = page.locator('.card-title').filter({ hasText: 'Informações Pessoais' });
    this.cpfInput = page.locator('#cpf');
    this.birthdayInput = page.locator('#birthday');
    this.nameInput = page.locator('#name');
    this.rgInput = page.locator('#rg');
    this.rgShipperSelect = page.locator('#rgShipper');
    this.rgShipperStateSelect = page.locator('#rgShipperState');
    this.genderSelect = page.locator('#gender');
    this.legalGuardianNameInput = page.locator('#legalGuardianName');
    this.legalGuardianCpfInput = page.locator('#legalGuardianCpf');
    this.legalGuardianCellPhoneInput = page.locator('#legalGuardianCellPhone');
    this.ageConfirmationModal = page.getByRole('dialog').filter({ hasText: 'Confirmação de Idade' });
    this.ageConfirmationConfirmButton = this.ageConfirmationModal.getByRole('button', { name: 'Confirmar' });

    this.contactHeading = page.locator('.card-title').filter({ hasText: 'Informações de Contato' });
    this.cellPhoneInput = page.locator('#cellPhone');
    this.emailInput = page.locator('input[name="email"]');
    this.churchSelect = page.locator('#church');
    this.customChurchInput = page.locator('input[name="church"][type="text"]');
    this.needRideSelect = page.locator('#needRide');
    this.hasAllergySelect = page.locator('#hasAllergy');
    this.allergyInput = page.locator('textarea[name="allergy"], input[name="allergy"]');
    this.hasAggregateSelect = page.locator('#hasAggregate');
    this.aggregateInput = page.locator('textarea[name="aggregate"], input[name="aggregate"]');

    this.packagesHeading = page.getByText('Pacotes', { exact: false }).first();
  }

  async goToForm() {
    await this.page.goto('/', { waitUntil: 'commit' });
  }

  async dismissLgpdModal() {
    await this.lgpdCienteButton.click();
  }

  async advanceToPersonalData() {
    await this.advanceButton.click();
  }

  async fillPersonalData(data: PersonalDataInput) {
    await this.cpfInput.fill(data.cpf);
    await this.birthdayInput.fill(data.birthday);
    await this.birthdayInput.press('Escape');
    await this.nameInput.fill(data.name);

    if (data.rg !== undefined) await this.rgInput.fill(data.rg);
    if (data.rgShipper !== undefined) await this.rgShipperSelect.selectOption(data.rgShipper);
    if (data.rgShipperState !== undefined) await this.rgShipperStateSelect.selectOption(data.rgShipperState);
    if (data.gender) await this.genderSelect.selectOption(data.gender);

    if (data.legalGuardianName !== undefined) {
      await this.legalGuardianNameInput.fill(data.legalGuardianName);
    }
    if (data.legalGuardianCpf !== undefined) {
      await this.legalGuardianCpfInput.fill(data.legalGuardianCpf);
    }
    if (data.legalGuardianCellPhone !== undefined) {
      await this.legalGuardianCellPhoneInput.fill(data.legalGuardianCellPhone);
    }
  }

  async fillContactData(data: ContactDataInput) {
    await this.cellPhoneInput.fill(data.cellPhone);
    await this.emailInput.fill(data.email);

    if (await this.churchSelect.isVisible()) {
      await this.churchSelect.selectOption(data.church);

      if (data.church === 'Outra' && data.customChurchName) {
        await this.customChurchInput.fill(data.customChurchName);
      }
    }

    if (data.needRide && (await this.needRideSelect.isVisible())) {
      await this.needRideSelect.selectOption(data.needRide);
    }
    if (data.hasAllergy && (await this.hasAllergySelect.isVisible())) {
      await this.hasAllergySelect.selectOption(data.hasAllergy);
    }
    if (data.allergy && (await this.allergyInput.isVisible())) {
      await this.allergyInput.fill(data.allergy);
    }
    if (data.hasAggregate && (await this.hasAggregateSelect.isVisible())) {
      await this.hasAggregateSelect.selectOption(data.hasAggregate);
    }
    if (data.aggregate && (await this.aggregateInput.isVisible())) {
      await this.aggregateInput.fill(data.aggregate);
    }
  }
}
