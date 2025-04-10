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
  pageCount: number,
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
  let pricePerPage = options.colorMode === 'Color' 
    ? shopkeeper.printCosts.color 
    : shopkeeper.printCosts.blackAndWhite;

  // Add paper type premium
  if (options.paperType === 'Premium') {
    pricePerPage *= 1.2; // 20% premium for premium paper
  } else if (options.paperType === 'Recycled') {
    pricePerPage *= 0.9; // 10% discount for recycled paper
  }

  // Apply double-sided discount if applicable
  if (options.doubleSided) {
    pricePerPage *= 0.8; // 20% discount for double-sided
  }

  // Calculate base total
  let totalPrice = pages * pricePerPage * options.copies;

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