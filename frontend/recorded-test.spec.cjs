const { chromium, expect } = require('playwright/test');

(async () => {
  let browser, context, page;
  
  try {
    console.log('🚀 Starting browser...');
    browser = await chromium.launch({
      headless: false
    });
    context = await browser.newContext();
    page = await context.newPage();
    
    console.log('🌐 Navigating to app...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    console.log('✅ Page loaded successfully');
    
    // Your recorded actions:
    await page.getByRole('button', { name: '⌨️ Keyboard' }).click();
  await page.getByText('Click to select notes and').click();
  await page.locator('.relative.group').first().click();
  await page.locator('.relative.group').first().click();
  await page.getByRole('button', { name: 'Accept cookies' }).click();
  await page.locator('.relative.group').first().click();
  await page.getByRole('button', { name: 'C', exact: true }).click();
  await page.getByRole('button', { name: 'maj', exact: true }).click();
  await page.locator('.relative.group.cursor-pointer.select-none.flex.items-center.justify-center.min-w-\\[2\\.5rem\\].h-8.rounded-md.border.border-dashed.transition-all.duration-200.border-gray-300').first().click();
  // Debug: Show exactly where 'C' appeared
  console.log('🔍 Checking for unwanted "C" text...');
  
  // Check the chord slot that was just clicked (line 18 element)
  const chordSlot = page.locator('.relative.group.cursor-pointer.select-none.flex.items-center.justify-center.min-w-\\[2\\.5rem\\].h-8.rounded-md.border.border-dashed.transition-all.duration-200.border-gray-300').first();
  const chordSlotText = await chordSlot.textContent();
  console.log('📍 Chord slot content:', chordSlotText);
  
  // Assert that this slot should NOT contain 'C' (if it's auto-filling incorrectly)
  if (chordSlotText && chordSlotText.trim() !== '') {
    console.log('❌ BUG FOUND: Chord slot auto-filled with:', chordSlotText);
    console.log('🔍 This suggests the modal auto-closed and filled the slot unexpectedly');
  } else {
    console.log('✅ Chord slot is empty as expected');
  }
  
  // More specific check: Look for the progression display area
  const progressionDisplay = page.locator('[data-testid="chord-progression"], .chord-progression-preview, .progression-display');
  const progressionText = await progressionDisplay.textContent().catch(() => '');
  console.log('📊 Progression display:', progressionText);
  
  // Check if "C|" or "C " appears in progression (the real bug indicator)
  if (progressionText.includes('C|') || progressionText.includes('Progression:C')) {
    console.log('❌ BUG CONFIRMED: "C" auto-filled in progression display');
  }
  await page.close();

    // ---------------------
    await context.storageState({ path: 'storage.json' });
    await context.close();
    await browser.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Clean up if browser is still open
    if (page) await page.close().catch(() => {});
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
})();