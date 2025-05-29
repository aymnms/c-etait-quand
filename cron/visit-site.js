// visit-site.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://cetaitquand.fr');
  await page.getByRole('button', { name: 'CRÉER' }).click();

  const creerButton = page.getByRole('button', { name: 'CRÉER' });

  while (await creerButton.isVisible()) {
    console.log('Le bouton "CRÉER" est visible, je clique dessus.');
    await page.getByRole('textbox').fill('aymnms');
    await creerButton.click();
    await page.waitForTimeout(2000);
  }

  await page.getByRole('button', { name: 'JOUER' }).click();
  await page.waitForTimeout(5000);

  await browser.close();
})();