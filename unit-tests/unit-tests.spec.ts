import { ProductAttributes } from "../pages/mainPage";
import { validateProducts } from "../utils/productHelper";
import { parsePrice } from "../utils/stringHelper";

describe('Валидация продуктов', () => {
    it.each([
        [
            new Map<string, ProductAttributes>([['', { price: 1, countPutProduct: 1 }]]),
            new Map<string, ProductAttributes>([['', { price: 1, countPutProduct: 1 }]])
        ],
        [
            new Map<string, ProductAttributes>([['Продуктовый продукт', { price: 100, countPutProduct: 100 }]]),
            new Map<string, ProductAttributes>()
        ],
        [
            new Map<string, ProductAttributes>([['My product $', { price: 1, countPutProduct: 1 }]]),
            new Map<string, ProductAttributes>()
        ],
        [
            new Map<string, ProductAttributes>([['комикс MARVEL134$', { price: 1, countPutProduct: 1 }]]),
            new Map<string, ProductAttributes>()
        ],
        [
            new Map<string, ProductAttributes>([['112Продуктовый продукт', { price: 100, countPutProduct: 100 }]]),
            new Map<string, ProductAttributes>([['112Продуктовый продукт', { price: 100, countPutProduct: 100 }]])
        ],
        [
            new Map<string, ProductAttributes>([['#Продуктовый продукт', { price: 100, countPutProduct: 100 }]]),
            new Map<string, ProductAttributes>([['#Продуктовый продукт', { price: 100, countPutProduct: 100 }]])
        ],
        [
            new Map<string, ProductAttributes>([['  Продукт', { price: 5, countPutProduct: 5 }]]),
            new Map<string, ProductAttributes>([['  Продукт', { price: 5, countPutProduct: 5 }]])
        ],
        [
            new Map<string, ProductAttributes>([['КОМИКС', { price: 0, countPutProduct: 5 }]]),
            new Map<string, ProductAttributes>([['КОМИКС', { price: 0, countPutProduct: 5 }]])
        ],
        [
            new Map<string, ProductAttributes>([['КОМИКС', { price: -1, countPutProduct: 5 }]]),
            new Map<string, ProductAttributes>([['КОМИКС', { price: -1, countPutProduct: 5 }]])
        ],
        [
            new Map<string, ProductAttributes>([['BOOK', { price: 1000000, countPutProduct: -1 }]]),
            new Map<string, ProductAttributes>([['BOOK', { price: 1000000, countPutProduct: -1 }]])
        ],
        [
            new Map<string, ProductAttributes>([['BOOK', { price: 153255323523, countPutProduct: 0 }]]),
            new Map<string, ProductAttributes>([['BOOK', { price: 153255323523, countPutProduct: 0 }]])
        ]
    ])('Валидация продукта (%o)', (inputData, outputData) => {
        const result = validateProducts(inputData);
        expect(outputData).toEqual(result)
    });
});

describe('Парсинг цен', () => {
    it.each([
        [
            '400р.  500р.',
            [400, 500]
        ],
        [
            '400р  500р  600р',
            [400, 500, 600]
        ],
        [
            '400р. -500р.',
            [400, 0]
        ],
        [
            '0р. 500р.',
            [0, 500]
        ],
        [
            '-400р. 500р.',
            [0, 500]
        ],
        [
            '400$. 500$. 90000р. 1р',
            [90000, 1]
        ],
        [
            'GGG 500р.',
            [500]
        ],
        [
            '500р. РРР',
            [500]
        ],
        [
            '',
            []
        ]
    ])('Парсинг цены (%o)', (inputData, outputData) => {
        const result = parsePrice(inputData)
        expect(outputData).toEqual(result)
    });
})
