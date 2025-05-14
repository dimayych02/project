import { expect, Page } from "@playwright/test";
import * as allure from "allure-js-commons";

export default abstract class BasePage {

    protected page: Page
    protected url: string

    constructor(page: Page, url: string) {
        this.page = page
        this.url = url
    }

    public async openPage(): Promise<void> {
        await allure.step(`Открытие страницы ${this.url}`, async () => {
            await this.page.goto(this.url)
            await this.expectPageLoaded()
        })
    }

    public async expectPageLoaded(): Promise<void> {
        await allure.step(`Проверяем загрузку страницы по URL: ${this.url}`, async () => {
            await this.page
                .waitForLoadState('load', { timeout: 5000 })
                .catch((error: Error) => {
                    expect(error, `Возникла ошибка при загрузке страницы: ${error}`).toBeNull()
                })
                .then(async () => {
                    await expect(this.page, `Проверяем переход на страницу ${this.url}`).toHaveURL(this.url)
                })
        })
    }
}