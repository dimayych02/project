import { ProductAttributes } from "../pages/mainPage"

export function validateProducts(productsToBasket: Map<string, ProductAttributes>): Map<string, ProductAttributes> {
    const errProducts = new Map<string, ProductAttributes>
    const priceRexExp = /^[1-9]\d*$/
    const productCountRegExp = /^[1-9]\d*$/
    const productNameRegExp = /^[А-Яа-яA-Za-z].*/

    productsToBasket.forEach((productAttributes, productName) => {
        const isValidPrice = priceRexExp.test(String(productAttributes.price))
        const isValidProductCount = productCountRegExp.test(String(productAttributes.countPutProduct))
        const isValidProductName = productNameRegExp.test(productName)

        if (!(isValidPrice && isValidProductCount && isValidProductName))
            errProducts.set(productName, productAttributes)
    })
    return errProducts
}