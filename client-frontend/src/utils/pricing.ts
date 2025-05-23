import type { PrintOptions } from '../types/print';

interface Shopkeeper {
  printCosts: {
    blackAndWhite: number;
    color: number;
  };
  priorityRate: number;
  discountRules: Array<{
    discountPercentage: number;
    minimumOrderAmount: number;
  }>;
}

export function calculatePrice(
  _pageCount: number, // Kept for backward compatibility but not used
  options: PrintOptions,
  selectedPages: string,
  shopkeeper: Shopkeeper | null
): number {
  if (!shopkeeper) return 0;
  // Calculate number of pages from selection
  const pages = selectedPages.split(',').reduce((count, range) => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      return count + (end - start + 1);
    }
    return count + 1;
  }, 0);
  // Get base price from shopkeeper's rates
  let pricePerPage = options.colorMode === 'color' 
    ? shopkeeper.printCosts.color 
    : shopkeeper.printCosts.blackAndWhite;
  // Calculate number of physical sheets based on pages per sheet setting
  const pagesPerSheet = parseInt(options.pagesPerSheet, 10);
  const physicalSheets = Math.ceil(pages / pagesPerSheet);
  // Apply double-sided discount if applicable
  if (options.doubleSided) {
    pricePerPage *= 0.8; // 20% discount for double-sided
  }

  // Calculate base total considering pages per sheet
  // When multiple pages are on one sheet, we charge for the physical sheets used
  // Example: 6 pages with 6 pages per sheet = 1 physical sheet, reducing cost
  let totalPrice = physicalSheets * pricePerPage * options.copies;

  // Apply priority rate only if priority is selected
  if (options.isPriority) {
    totalPrice *= shopkeeper.priorityRate;
  }

  // Apply applicable discount
  const sortedDiscounts = [...shopkeeper.discountRules]
    .sort((a, b) => b.minimumOrderAmount - a.minimumOrderAmount);

  const applicableDiscount = sortedDiscounts.find(
    rule => totalPrice >= rule.minimumOrderAmount
  );

  if (applicableDiscount) {
    const discountAmount = (totalPrice * applicableDiscount.discountPercentage) / 100;
    totalPrice -= discountAmount;
  }

  return Number(totalPrice.toFixed(2));
}