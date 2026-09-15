import { Locator, Page, expect } from '@playwright/test';

export type PersonData = {
  name: string;
  cpf: string;
  birthday: string;
  rg?: string;
  gender: 'Criança (até 10 anos)' | 'Adulto Masculino' | 'Adulto Feminimo';
  guardianName?: string;
  guardianCpf?: string;
  guardianPhone?: string;
};

export type ContactData = {
  phone: string;
  email: string;
};

export class FormComponent {
  readonly advanceButton: Locator;

  constructor(readonly page: Page) {
    this.advanceButton = page.getByRole('button', { name: 'Avançar' });
  }

  async clearModal() {
    for (let i = 0; i < 3; i++) {
      const modal = this.page.locator('.modal.show');
      if (await modal.count()) {
        await modal.getByRole('button', { name: /Confirmar|Ciente|Sim/i }).first().click().catch(() => {});
        await this.page.waitForTimeout(400);
      } else {
        return;
      }
    }
  }

  async open() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
    await this.page.waitForTimeout(800);
    await this.clearModal();
  }

  private async removeStuckBackdrop() {
    await this.page
      .evaluate(() => {
        document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      })
      .catch(() => {});
  }

  async advance() {
    await this.clearModal();
    await this.removeStuckBackdrop();
    try {
      await this.advanceButton.click({ timeout: 12000 });
    } catch {
      await this.removeStuckBackdrop();
      await this.advanceButton.click({ force: true });
    }
    await this.page.waitForTimeout(600);
    await this.clearModal();
  }

  async fillPersonalData(person: PersonData) {
    await this.page.locator('#name').fill(person.name);
    await this.page.locator('#cpf').click();
    await this.page.locator('#cpf').pressSequentially(person.cpf, { delay: 12 });
    await this.page.locator('#rg').fill(person.rg ?? '1234567');
    await this.page.locator('#birthday').fill(person.birthday);
    await this.page.locator('#birthday').press('Enter');
    await this.page.waitForTimeout(600);
    await this.clearModal();
    await this.page.selectOption('#rgShipper', { index: 1 });
    await this.page.selectOption('#rgShipperState', { index: 1 });
    await this.page.selectOption('#gender', { label: person.gender });
    if (person.gender === 'Criança (até 10 anos)') {
      const gName = this.page.locator('#legalGuardianName');
      await gName.waitFor({ state: 'visible', timeout: 8000 });
      await gName.fill(person.guardianName ?? 'Responsável Teste');
      const gCpf = this.page.locator('#legalGuardianCpf');
      await gCpf.waitFor({ state: 'visible', timeout: 8000 });
      await gCpf.click();
      await gCpf.pressSequentially(person.guardianCpf ?? '11144477735', { delay: 15 });
      const gPhone = this.page.locator('#legalGuardianCellPhone');
      await gPhone.click();
      await gPhone.pressSequentially(person.guardianPhone ?? '81988887777', { delay: 15 });
      await this.page.waitForTimeout(200);
    }
  }

  async fillContact(contact: ContactData) {
    await this.clearModal();
    await this.removeStuckBackdrop();
    await this.page.locator('#cellPhone').click();
    await this.page.locator('#cellPhone').pressSequentially(contact.phone, { delay: 12 });
    await this.page.locator('input[type="email"]').first().fill(contact.email);
    await this.page.locator('#church').selectOption({ index: 1 });
    await this.page.locator('select:not([id])').first().selectOption({ label: 'Não' });
    await this.page.locator('#car').selectOption({ label: 'Não' });
    await this.page.waitForTimeout(300);
    await this.page.locator('#needRide').selectOption({ label: 'Não' });
    await this.page.locator('#hasAllergy').selectOption({ label: 'Não' });
    await this.page.locator('#hasAggregate').selectOption({ label: 'Não' });
  }

  private categoryCard(title: string): Locator {
    return this.page.locator('.card').filter({ has: this.page.locator('.card-title', { hasText: title }) });
  }

  private async selectFirstProduct(title: string) {
    const card = this.categoryCard(title);
    await card.first().waitFor({ state: 'visible', timeout: 20000 });
    const button = card.locator('button.product-button').first();
    await button.waitFor({ state: 'visible', timeout: 20000 });
    await button.scrollIntoViewIfNeeded();
    await button.click({ timeout: 12000 });
    await this.page.waitForTimeout(400);
  }

  async selectPackages() {
    await this.selectFirstProduct('Hospedagem');
    await this.selectFirstProduct('Transporte');
  }

  async confirmReview() {
    const boxes = this.page.locator('input[type="checkbox"]');
    const total = await boxes.count();
    for (let i = 0; i < total; i++) {
      await boxes.nth(i).check({ timeout: 4000 }).catch(() => {});
    }
    await this.page.waitForTimeout(200);
  }

  async fillWholeFlow(person: PersonData, contact: ContactData) {
    await this.advance();
    await this.fillPersonalData(person);
    await this.advance();
    await this.fillContact(contact);
    await this.advance();
    await this.selectPackages();
    await this.advance();
    await this.confirmReview();
    await this.advance();
  }

  async expectStepTitle(title: RegExp | string) {
    await expect(this.page.locator('.card-title', { hasText: title }).first()).toBeVisible();
  }
}
