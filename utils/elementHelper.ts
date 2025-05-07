import { Locator, expect } from "@playwright/test";
import * as allure from "allure-js-commons";

export interface WaitOptions {
    timeout: number;
    state?: 'attached' | 'detached' | 'hidden' | 'visible';
    force?: boolean
    ignoreCase?: boolean
}

/**
 * @param locator - локатор элемента
 * @param options - конфигурации, по которым ждем элемент
 */
export async function waitForElementState(
    locator: Locator,
    options: WaitOptions = { timeout: 5000, state: 'visible' }): Promise<void> {
    await allure.step(`Ждем у элемента ${locator} состояние ${options?.state}`, async () => {
        await locator.
            waitFor(options).
            catch((error: Error) => {
                expect(error, `При ожидании элемента ${locator} вернулась ошибка: ${error}`).toBeNull()
            })
    })
}
/**
 * @param locator - локатор элемента
 * @param setupClick - предшаг перед тем как кликнуть по элементу
 * @param options - конфигурации, по которым кликаем по элементу
 */
export async function clickElement(
    locator: Locator,
    setupClick?: () => Promise<void>,
    options: WaitOptions = { timeout: 5000, force: true }): Promise<void> {
    await allure.step(`Кликаем по элементу ${locator}`, async () => {
        if (setupClick) {
            await setupClick().catch((error: Error) => {
                expect(error, `Возникла ошибка при подготовке клика: ${error}`).toBeNull()
            })
        }
        await locator
            .click(options)
            .catch((error: Error) => {
                expect(error, `При клике по элементу ${locator} вернулась ошибка: ${error}`).toBeNull()
            })
    })

}
/**
 * @param locator - локатор элемента
 * @param text - текст, которым заполняем поле
 * @param options - конфигурации, по которым заполняем элемент
 */
export async function setValue(
    locator: Locator,
    text: string,
    options: WaitOptions = { timeout: 5000, force: true }): Promise<void> {
    await allure.step(`Заполняем элемент ${locator} текстом ${text}`, async () => {
        await locator
            .fill(text, options)
            .catch((error: Error) => {
                expect(error, `Возникла ошибка ${error} при заполнении элемента ${locator}`).toBeNull()
            })
            .then(async () => {
                await expect(locator, 'Проверяем заполнение элемента').toHaveValue(text, { timeout: options.timeout })
            })
    })

}

/**
 * @param locator - локатор элемента
 * @param text - текст, который ожидаем
 * @param options - конфигурации, по которым дожидаемся появление текста
 */
export async function waitForElementText(
    locator: Locator,
    text: string,
    options: WaitOptions = { timeout: 5000 }
): Promise<void> {
    await expect(locator, `Проверяем, что элемент ${locator} содержит текст ${text}`).toHaveText(text, options)
}

/**
 * @param locator - локатор элемента
 * @param text - текст, который не ожидаем
 * @param options - конфигурации, по которым не дожидаемся появление текста
 */
export async function waitForElementNotContainText(
    locator: Locator,
    text: string,
    options: WaitOptions = { timeout: 1000 }
): Promise<void> {
    await expect(locator, `Проверяем, что элемент ${locator} не содержит текст ${text}`).not.toContainText(text, options)
}

/**
 * Получаем текст элемента
 * @param locator - локатор элемента
 * @param options - конфигурации, по которым получаем текст элемента
 */
export async function getText(locator: Locator, options: WaitOptions = { timeout: 5000 }): Promise<string> {
    return await locator
        .textContent(options)
        .catch((error: Error) => {
            expect(error, `Возникла ошибка ${error} при получении текста у элемента ${locator}`).toBeNull()
        })
        .then((txt) => { return txt as string })
}