import { Browser, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

export default async function closeBrowser(browser: Browser): Promise<void> {
    await allure.step('Закрываем браузер', async () => {
        await browser
            .close()
            .catch((error: Error) => {
                expect(error, `Возникла ошибка ${error} при закрытии браузера`).toBeNull()
            })
    })
}
