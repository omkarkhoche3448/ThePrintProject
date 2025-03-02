import type { PrintOptions } from '../types/print';

const BASE_PRICES = {
  BlackAndWhite: 0.10,
  Color: 0.50,
  Premium: 0.15,
  Recycled: 0.05,
  DoubleSided: -0.02,
};

export function calculatePrice(
  _pageCount: number,
  options: PrintOptions,
  selectedPages: string
): number {
  // Calculate number of pages from selection
  const pages = selectedPages.split(',').reduce((count, range) => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      return count + (end - start + 1);
    }
    return count + 1;
  }, 0);

  let pricePerPage = BASE_PRICES[options.colorMode];

  // Add paper type premium
  if (options.paperType === 'Premium') {
    pricePerPage += BASE_PRICES.Premium;
  } else if (options.paperType === 'Recycled') {
    pricePerPage += BASE_PRICES.Recycled;
  }

  // Apply double-sided discount
  if (options.doubleSided) {
    pricePerPage += BASE_PRICES.DoubleSided;
  }

  return pages * pricePerPage * options.copies;
}