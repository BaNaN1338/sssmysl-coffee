const { expect, test } = require("@playwright/test");

async function openSite(page) {
  await page.route("**/rest/v1/**", (route) => route.abort());
  await page.route("**/auth/v1/**", (route) => route.abort());
  await page.route("**/functions/v1/**", (route) => route.abort());
  await page.goto("/");
}

test("главная страница, меню и корзина работают", async ({ page }) => {
  await openSite(page);

  await expect(page).toHaveTitle(/Смысл/);
  await expect(page.locator("#menuSectionsWrapper")).toBeVisible();
  await expect(page.locator('#menuSectionsWrapper [onclick^="openDrinkCustomizer"]')).toHaveCount(27);

  await page.evaluate(() => {
    cart = [];
    openDrinkCustomizer("c3");
  });
  await expect(page.locator("#drinkModal")).toBeVisible();

  await page.evaluate(() => confirmAddToCart());
  await expect(page.locator("#floatingCartBar")).toBeVisible();
  await expect(page.locator("#orderTypeInBtn")).toBeAttached();
  await expect(page.locator("#orderCommentInput")).toBeAttached();
  await expect(page.locator("#personalDataConsent")).toBeAttached();
  await expect(page.locator("#orderPushBtn")).toBeAttached();
});

test("service worker и manifest доступны", async ({ page, request }) => {
  await openSite(page);
  expect((await request.get("/sw.js")).ok()).toBe(true);
  expect((await request.get("/manifest.json")).ok()).toBe(true);
});

test("после 20:00 МСК онлайн-заказ закрыт", async ({ page }) => {
  await openSite(page);

  const openAt2000 = await page.evaluate(() => {
    const realNow = Date.now;
    const d = new Date();
    Date.now = () => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 17, 0, 0);
    const result = isOrderingOpenNow();
    Date.now = realNow;
    return result;
  });

  expect(openAt2000).toBe(false);
});
