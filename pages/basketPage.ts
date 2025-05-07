import { Locator, Page } from "@playwright/test"
import BasePage from "./BasePage"

export default class BasketPage extends BasePage {

    constructor(page: Page, url: string) {
        super(page, url)
    }

    public errorText: string = 'Error'

    public get headerElement(): Locator {
        const selector = 'h1'
        return this.page.locator(selector)
    }
}