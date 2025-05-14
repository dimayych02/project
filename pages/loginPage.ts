import { Locator, Page } from "@playwright/test"
import BasePage from "./BasePage"
import * as allure from "allure-js-commons";
import { clickElement, setValue } from "../utils/elementHelper";

export default class LoginPage extends BasePage {

    constructor(page: Page, url: string) {
        super(page, url)
    }

    public username: string = process.env.LOGIN_USER as string
    public password: string = process.env.LOGIN_PASS as string

    public get inputUserName(): Locator {
        return this.page.locator('input#loginform-username')
    }

    public get inputPassword(): Locator {
        return this.page.locator('input#loginform-password')
    }

    public get buttonEnter(): Locator {
        return this.page.locator('button[name=login-button]')
    }

    public async loginUser(): Promise<void> {
        await allure.step('Авторизация пользователя', async () => {
            await setValue(this.inputUserName, this.username)
            await setValue(this.inputPassword, this.password)

            await clickElement(this.buttonEnter, async () => {
                // Без нажатия на Enter не происходит валидации - верный ли пароль ввели и кнопка Вход неактивная
                await this.inputPassword.press('Enter')
            })
        })
    }
}


