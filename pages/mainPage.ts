import { expect, Locator, Page } from "@playwright/test";
import BasePage from "./BasePage";
import { clickElement, waitForElementText, waitForElementState, setValue, getText } from "../utils/elementHelper";
import { parsePrice } from "../utils/stringHelper";
import * as allure from "allure-js-commons";
import { validateProducts } from "../utils/productHelper";
import { ATTRIBUTE_CLASS, HAS_DISCOUNT } from "../constants/attributes";

export interface ProductOptions {
    productsIntoBasket: number
    productCopy: number
    withDiscountProduct?: boolean
    withoutDiscountProduct?: boolean
}

export interface ProductAttributes {
    price: number
    countPutProduct: number
}

export default class MainPage extends BasePage {

    private productsToBasket: Map<string, ProductAttributes>

    constructor(page: Page, url: string) {
        super(page, url)
        this.productsToBasket = new Map<string, ProductAttributes>
    }

    public buttonBuy(idx: number = 1): Locator {
        const selector = `(//button[starts-with(@class, 'actionBuyProduct')])[${idx}]`
        return this.page.locator(selector)
    }

    public textBoxProductEnterCount(idx: number): Locator {
        const selector = `(//input[@name='product-enter-count'])[${idx}]`
        return this.page.locator(selector)
    }

    public productPrice(idx: number): Locator {
        const selector = `(//span[starts-with(@class, 'product_price')])[${idx}]`
        return this.page.locator(selector)
    }

    public productName(idx: number): Locator {
        const selector = `(//div[starts-with(@class, 'product_name')])[${idx}]`
        return this.page.locator(selector)
    }

    public get dropdownBasket(): Locator {
        const selector = '#dropdownBasket'
        return this.page.locator(selector)
    }

    public get dropdownUser(): Locator {
        const selector = '#dropdownUser'
        return this.page.locator(selector)
    }

    public get menuBasket(): Locator {
        const selector = 'div[aria-labelledby=dropdownBasket]'
        return this.page.locator(selector)
    }

    public get basketPrice(): Locator {
        const selector = 'span[class=basket_price]'
        return this.page.locator(selector)
    }

    public get buttonGoToBasket(): Locator {
        const text = 'Перейти в корзину'
        return this.page.getByText(text)
    }

    public get buttonClearBasket(): Locator {
        const text = 'Очистить корзину'
        return this.page.getByText(text)
    }

    public pageNumber(idx: number): Locator {
        const selector = `a[data-page-number='${idx}']`
        return this.page.locator(selector)
    }

    public get basketCountProductsElement(): Locator {
        const selector = '//span[starts-with(@class, "basket-count-items")]'
        return this.page.locator(selector)
    }

    private get listProductInBasket(): Locator {
        const selector = "//li[starts-with(@class, 'basket-item list-group-item')]"
        return this.page.locator(selector)
    }

    private get pages(): Locator {
        const allPagesSelector = "//li[starts-with(@class, 'page-item')]"
        return this.page.locator(allPagesSelector)
    }

    public async switchToPage(pageNum: number): Promise<void> {
        await allure.step(`Переключаемся на вкладку товаров с номером [${pageNum}]`, async () => {
            const allPages = await this.pages.all()
            expect(allPages.length, 'Проверяем, что передали верный номер вкладки товаров').toBeGreaterThanOrEqual(pageNum)

            const activePageNum = await this.getActivePage()
            if (activePageNum != 0 && activePageNum != pageNum) {
                await clickElement(allPages[pageNum - 1])
            }
        })
    }

    private async getActivePage(): Promise<number> {
        const allPages = await this.pages.all()
        for (let i = 0; i < allPages.length; i++) {
            const activePage = (await allPages[i].getAttribute(ATTRIBUTE_CLASS))?.includes('active')
            if (activePage) {
                return i + 1
            }
        }
        return 0
    }

    private async getProductAttributesInBasket(): Promise<Map<string, ProductAttributes>> {
        const productsToBasket = new Map<string, ProductAttributes>
        const allProducts = await this.listProductInBasket.all()

        for (var i = 0; i < allProducts.length; i++) {
            const productName = await getText(allProducts[i]
                .locator(`(//span[starts-with(@class, 'basket-item-title')])[${i + 1}]`))

            const productPrice = this.calculateProductPrice(await getText(allProducts[i]
                .locator(`(//span[starts-with(@class, 'basket-item-price')])[${i + 1}]`)),
                1)

            const productCount = Number(await getText(allProducts[i]
                .locator(`(//span[starts-with(@class, 'basket-item-count')])[${i + 1}]`)))

            productsToBasket.set(productName,
                {
                    price: productPrice,
                    countPutProduct: productCount
                })
        }
        return productsToBasket
    }

    public async clearProductBasket() {
        await allure.step('Очистка корзины', async () => {
            if (await this.listProductInBasket.count() > 0) {
                await clickElement(this.dropdownBasket)
                await clickElement(this.buttonClearBasket)
            }
        })
    }

    private async waitProductsCardsLoaded(items: number = 4): Promise<void> {
        var idx: number = 1
        while (idx <= items) {
            const itemCardsSelector = `(//div[starts-with(@class, 'note-item card')])[${idx}]`
            const itemCardsLocator = this.page.locator(itemCardsSelector)
            await waitForElementState(itemCardsLocator)
            idx++
        }
    }

    public async expectPageLoaded(): Promise<void> {
        await super.expectPageLoaded()
        const userName = process.env.LOGIN_USER as string
        await waitForElementText(this.dropdownUser, userName, { timeout: 5000, ignoreCase: true })
        await this.waitProductsCardsLoaded()
    }

    private calculateProductPrice(price: string, productAmount: number): number {
        if (parsePrice(price) && parsePrice(price).length > 0) {
            return parsePrice(price)[0] * productAmount
        }
        return 0
    }

    public async calculateTotalPrice(addedProducts: Map<string, ProductAttributes>): Promise<number> {
        var sum: number = 0
        addedProducts.forEach((product) => {
            sum += product.price
        })
        return sum
    }

    /**
     * Добавляем товары в корзину
     * @param productsToBasket 
     * @param productOptions 
     */
    private async putProducts(
        productOptions: ProductOptions): Promise<void> {

        await allure.step('Добавляем товары в корзину', async () => {
            const itemsSelector = "//div[starts-with(@class, 'note-item card') and @data-product != '']"
            const allProducts = await this.page.locator(itemsSelector).all()

            for (var i = 0; i < allProducts.length; i++) {
                const productName = await getText(this.productName(i + 1))

                if (this.productsToBasket.size == productOptions.productsIntoBasket) {
                    break
                }
                // Товар уже был добавлен в корзину
                if ((await this.getProductAttributesInBasket()).get(productName)) {
                    continue
                }

                const itemClass = await allProducts[i].getAttribute(ATTRIBUTE_CLASS)
                const isDiscount = itemClass?.includes(HAS_DISCOUNT)

                if (
                    (productOptions.withDiscountProduct && isDiscount) ||
                    (productOptions.withoutDiscountProduct && !isDiscount)
                ) {
                    if (Number(productOptions.productCopy) > 1) {
                        await setValue(this.textBoxProductEnterCount(i + 1), String(productOptions.productCopy))
                    }

                    await clickElement(this.buttonBuy(i + 1))
                    const productPrice = this.calculateProductPrice(
                        await getText(this.productPrice(i + 1)),
                        productOptions.productCopy
                    )
                    const productToPut = Number(await this.textBoxProductEnterCount(i + 1).inputValue())

                    this.productsToBasket.set(productName,
                        {
                            price: productPrice,
                            countPutProduct: productToPut
                        })
                }
            }
        })
    }

    public async putProductsIntoBasket(productOptions: ProductOptions): Promise<void> {
        var activePage = await this.getActivePage()
        const maxRetries: number = 3

        await this.putProducts(productOptions)
        while (this.productsToBasket.size < productOptions.productsIntoBasket && activePage < maxRetries) {
            activePage++
            await this.switchToPage(activePage)
            await this.putProducts(productOptions)
        }
    }

    public async validateProductsInBasket(expectedProducts: Map<string, ProductAttributes>): Promise<void> {
        await allure.step('Проверяем, что в корзину правильно добавились товары', async () => {
            expect(validateProducts(expectedProducts).size, 'Проверяем, что нет товаров в корзине с невалидными характеристиками').toEqual(0)
            const actualProducts = await this.getProductAttributesInBasket()
            expect(expectedProducts.size, 'Проверяем, что совпали по длине ожидаемый и актуальный список товаров').toEqual(actualProducts.size)

            expectedProducts.forEach((productAttributes, productName) => {
                const actualAttributes = actualProducts.get(productName)
                expect(productAttributes.price, `Проверяем цену у товара ${productName}`).toEqual(actualAttributes?.price)
                expect(productAttributes.countPutProduct, `Проверяем количество экземпляров у товара ${productName}`)?.toEqual(actualAttributes?.countPutProduct)
            })
        })
    }
    public updateProductsList(products: Map<string, ProductAttributes>) {
        expect(products, 'Проверяем, что передан непустой список товаров').not.toBeUndefined()
        this.productsToBasket.forEach((pAttributes, pName) => {
            products.set(pName,
                {
                    price: pAttributes.price,
                    countPutProduct: pAttributes.countPutProduct
                })
        })
    }
}
