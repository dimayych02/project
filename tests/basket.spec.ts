import { expect, test } from '@playwright/test';
import LoginPage from '../pages/loginPage';
import { clickElement, waitForElementNotContainText, waitForElementText } from '../utils/elementHelper';
import MainPage, { ProductAttributes } from '../pages/mainPage';
import BasketPage from '../pages/basketPage';
import * as allure from "allure-js-commons";
import closeBrowser from '../utils/browserHelper';
import { OWNER, POSITIVE_TESTS, SMOKE_TAG, PRODUCT_SUITE } from '../constants/allure';
import { NINE_PRODUCTS, ONE_PRODUCT, ZERO_PRODUCTS } from '../constants/products';

test.describe('Тест-Кейсы 1-3, 5', () => {

  test.beforeEach('Очищаем корзину', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page, `${baseURL}/login`)
    await loginPage.openPage()
    await loginPage.loginUser()

    const mainPage = new MainPage(page, `${baseURL}`)
    await mainPage.expectPageLoaded()
    await mainPage.clearProductBasket()
    await waitForElementText(mainPage.basketCountProductsElement, ZERO_PRODUCTS)
  })

  test('Тест-кейс 1', async ({ page, baseURL }) => {
    await allure.description('Переход в пустую корзину')
    await allure.owner(OWNER)
    await allure.tag(SMOKE_TAG)
    await allure.parentSuite(PRODUCT_SUITE)
    await allure.suite(POSITIVE_TESTS)

    const mainPage = new MainPage(page, `${baseURL}`)
    await clickElement(mainPage.dropdownBasket)
    await expect(mainPage.menuBasket, 'Проверяем, что не открылось меню Корзины').toBeHidden()
  })

  test('Тест-кейс 2', async ({ page, baseURL }) => {
    await allure.description('Переход в корзину с 1 неакционным товаром')
    await allure.owner(OWNER)
    await allure.tag(SMOKE_TAG)
    await allure.parentSuite(PRODUCT_SUITE)
    await allure.suite(POSITIVE_TESTS)

    const mainPage = new MainPage(page, `${baseURL}`)

    await mainPage.putProductsIntoBasket(
      {
        withoutDiscountProduct: true,
        productCopy: 1,
        productsIntoBasket: 1
      })

    await waitForElementText(mainPage.basketCountProductsElement, ONE_PRODUCT)

    const products = new Map<string, ProductAttributes>
    mainPage.updateProductsList(products)
    expect(products.size, 'Проверяем ожидаемое количество товаров в корзине').toEqual(Number(ONE_PRODUCT))
    await mainPage.validateProductsInBasket(products)

    await clickElement(mainPage.dropdownBasket)
    await waitForElementText(mainPage.basketPrice, String(await mainPage.calculateTotalPrice(products)))
    await clickElement(mainPage.buttonGoToBasket)

    const basketPage = new BasketPage(page, `${baseURL}/basket`)
    await basketPage.expectPageLoaded()
    await waitForElementNotContainText(basketPage.headerElement, basketPage.errorText)
  })

  test('Тест-кейс 3', async ({ page, baseURL }) => {
    await allure.description('Переход в корзину с 1 акционным товаром')
    await allure.owner(OWNER)
    await allure.tag(SMOKE_TAG)
    await allure.parentSuite(PRODUCT_SUITE)
    await allure.suite(POSITIVE_TESTS)

    const mainPage = new MainPage(page, `${baseURL}`)
    await mainPage.putProductsIntoBasket(
      {
        withDiscountProduct: true,
        productCopy: 1,
        productsIntoBasket: 1
      })

    await waitForElementText(mainPage.basketCountProductsElement, ONE_PRODUCT)

    const products = new Map<string, ProductAttributes>
    mainPage.updateProductsList(products)
    expect(products.size, 'Проверяем ожидаемое количество товаров в корзине').toEqual(Number(ONE_PRODUCT))
    await mainPage.validateProductsInBasket(products)

    await clickElement(mainPage.dropdownBasket)
    await waitForElementText(mainPage.basketPrice, String(await mainPage.calculateTotalPrice(products)))
    await clickElement(mainPage.buttonGoToBasket)

    const basketPage = new BasketPage(page, `${baseURL}/basket`)
    await basketPage.expectPageLoaded()
    await waitForElementNotContainText(basketPage.headerElement, basketPage.errorText)
  })

  test('Тест-Кейс 5', async ({ page, baseURL }) => {
    await allure.description('Переход в корзину с 9 акционными товарами одного наименования')
    await allure.owner(OWNER)
    await allure.tag(SMOKE_TAG)
    await allure.parentSuite(PRODUCT_SUITE)
    await allure.suite(POSITIVE_TESTS)

    const mainPage = new MainPage(page, `${baseURL}`)

    await mainPage.putProductsIntoBasket(
      {
        withDiscountProduct: true,
        productCopy: 9,
        productsIntoBasket: 1
      })


    await waitForElementText(mainPage.basketCountProductsElement, NINE_PRODUCTS)
    const products = new Map<string, ProductAttributes>
    mainPage.updateProductsList(products)
    expect(products.size, 'Проверяем ожидаемое количество товаров в корзине').toEqual(Number(ONE_PRODUCT))
    await mainPage.validateProductsInBasket(products)

    await clickElement(mainPage.dropdownBasket)
    await waitForElementText(mainPage.basketPrice, String(await mainPage.calculateTotalPrice(products)))
    await clickElement(mainPage.buttonGoToBasket)

    const basketPage = new BasketPage(page, `${baseURL}/basket`)
    await basketPage.expectPageLoaded()
    await waitForElementNotContainText(basketPage.headerElement, basketPage.errorText)
  })
})


test.describe('Тест-кейс 4', () => {

  const products = new Map<string, ProductAttributes>

  test.beforeEach('Добавляем в корзину 1 акционный товар', async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page, `${baseURL}/login`)
    await loginPage.openPage()
    await loginPage.loginUser()

    const mainPage = new MainPage(page, `${baseURL}`)
    await mainPage.expectPageLoaded()

    await mainPage.clearProductBasket()
    await waitForElementText(mainPage.basketCountProductsElement, ZERO_PRODUCTS)

    await mainPage.putProductsIntoBasket(
      {
        withDiscountProduct: true,
        productCopy: 1,
        productsIntoBasket: 1
      })

    await waitForElementText(mainPage.basketCountProductsElement, ONE_PRODUCT)
    mainPage.updateProductsList(products)
  })

  test('Тест-кейс 4', async ({ page, baseURL }) => {
    await allure.description('Переход в корзину с 9 разными товарами')
    await allure.owner(OWNER)
    await allure.tag(SMOKE_TAG)
    await allure.parentSuite(PRODUCT_SUITE)
    await allure.suite(POSITIVE_TESTS)

    const mainPage = new MainPage(page, `${baseURL}`)
    await mainPage.putProductsIntoBasket(
      {
        withDiscountProduct: true,
        withoutDiscountProduct: true,
        productCopy: 1,
        productsIntoBasket: 8
      })

    await waitForElementText(mainPage.basketCountProductsElement, NINE_PRODUCTS)
    mainPage.updateProductsList(products)
    expect(products.size, 'Проверяем ожидаемое количество товаров в корзине').toEqual(Number(NINE_PRODUCTS))
    await mainPage.validateProductsInBasket(products)

    await clickElement(mainPage.dropdownBasket)
    await waitForElementText(mainPage.basketPrice, String(await mainPage.calculateTotalPrice(products)))
    await clickElement(mainPage.buttonGoToBasket)

    const basketPage = new BasketPage(page, `${baseURL}/basket`)
    await basketPage.expectPageLoaded()
    await waitForElementNotContainText(basketPage.headerElement, basketPage.errorText)
  })
})

test.afterAll('Завершение тестов', async ({ browser }) => {
  await closeBrowser(browser)
})



