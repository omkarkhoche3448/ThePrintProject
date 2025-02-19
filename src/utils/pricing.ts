import type { PrintOptions } from '../types/print';

// Base price per page
const BASE_PRICE = 0.10;

// Multipliers and additional costs for different options
const PRICE_MULTIPLIERS = {
  colorMode: {
    BlackAndWhite: 1,
    Color: 2.5,
  },
  paperSize: {
    A4: 1,
    A3: 1.5,
    Letter: 1,
    Legal: 1.2,
    Executive: 1.1,
  },
  paperType: {
    Standard: 1,
    Glossy: 1.8,
    Recycled: 1.1,
    Cardstock: 1.5,
  },
  binding: {
    None: 0,
    Staple: 1,
    Punch: 1.5,
    Spiral: 5,
  },
  priority: 1.5, // 50% markup for priority printing
  doubleSided: 0.85, // 15% discount for double-sided printing
};

// Calculate the number of pages from a page range string (e.g., "1-5,7,9-12")
export const countPagesFromRange = (pageRange: string, totalPages: number): number => {
  if (!pageRange || pageRange === '') return 0;
  if (pageRange === `1-${totalPages}`) return totalPages;

  let count = 0;
  const ranges = pageRange.split(',');

  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      count += end - start + 1;
    } else {
      count += 1;
    }
  }

  return count;
};

export interface PriceBreakdown {
  basePrice: number;
  colorMultiplier: number;
  paperSizeMultiplier: number;
  paperTypeMultiplier: number;
  bindingCost: number;
  doubleSidedDiscount: number;
  priorityMultiplier: number;
  copiesCount: number;
  selectedPageCount: number;
  subtotal: number;
  totalPrice: number;
}

// Calculate price based on options and selected pages with detailed breakdown
export const calculatePriceWithBreakdown = (
  totalPages: number,
  options: PrintOptions,
  selectedPages: string
): PriceBreakdown => {
  const selectedPageCount = countPagesFromRange(selectedPages, totalPages);
  
  // Base price calculation
  const basePrice = BASE_PRICE * selectedPageCount;
  
  // Get multipliers
  const colorMultiplier = PRICE_MULTIPLIERS.colorMode[options.colorMode];
  const paperSizeMultiplier = PRICE_MULTIPLIERS.paperSize[options.paperSize];
  const paperTypeMultiplier = PRICE_MULTIPLIERS.paperType[options.paperType];
  
  // Calculate binding cost
  const bindingCost = options.binding && options.binding.type !== 'None' 
    ? PRICE_MULTIPLIERS.binding[options.binding.type]
    : 0;
  
  // Calculate double-sided discount
  const doubleSidedDiscount = options.doubleSided 
    ? PRICE_MULTIPLIERS.doubleSided 
    : 1;
  
  // Calculate priority multiplier
  const priorityMultiplier = options.priority 
    ? PRICE_MULTIPLIERS.priority 
    : 1;
  
  // Calculate subtotal before copies
  let subtotal = basePrice * colorMultiplier * paperSizeMultiplier * paperTypeMultiplier * doubleSidedDiscount * priorityMultiplier;
  
  // Add binding cost
  subtotal += bindingCost;
  
  // Multiply by number of copies
  const totalPrice = subtotal * options.copies;
  
  return {
    basePrice,
    colorMultiplier,
    paperSizeMultiplier,
    paperTypeMultiplier,
    bindingCost,
    doubleSidedDiscount,
    priorityMultiplier,
    copiesCount: options.copies,
    selectedPageCount,
    subtotal,
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
};

// Calculate price based on options and selected pages (simplified version)
export const calculatePrice = (
  totalPages: number,
  options: PrintOptions,
  selectedPages: string
): number => {
  const breakdown = calculatePriceWithBreakdown(totalPages, options, selectedPages);
  return breakdown.totalPrice;
};

// Get pricing rules for offline calculation
export const getPricingRules = () => {
  return {
    basePrice: BASE_PRICE,
    multipliers: PRICE_MULTIPLIERS
  };
};

// Save pricing rules to localStorage for offline use
export const savePricingRulesLocally = () => {
  try {
    localStorage.setItem('printPricingRules', JSON.stringify({
      basePrice: BASE_PRICE,
      multipliers: PRICE_MULTIPLIERS,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error('Failed to save pricing rules locally:', error);
    return false;
  }
};

// Load pricing rules from localStorage
export const loadPricingRulesLocally = () => {
  try {
    const rules = localStorage.getItem('printPricingRules');
    return rules ? JSON.parse(rules) : null;
  } catch (error) {
    console.error('Failed to load pricing rules from localStorage:', error);
    return null;
  }
};

// Calculate price offline using stored rules
export const calculatePriceOffline = (
  totalPages: number,
  options: PrintOptions,
  selectedPages: string
): number | null => {
  const rules = loadPricingRulesLocally();
  if (!rules) return null;
  
  const selectedPageCount = countPagesFromRange(selectedPages, totalPages);
  
  // Base price calculation
  let price = rules.basePrice * selectedPageCount;
  
  // Apply multipliers
  price *= rules.multipliers.colorMode[options.colorMode];
  price *= rules.multipliers.paperSize[options.paperSize];
  price *= rules.multipliers.paperType[options.paperType];
  
  // Apply double-sided discount if applicable
  if (options.doubleSided) {
    price *= rules.multipliers.doubleSided;
  }
  
  // Apply binding cost if applicable
  if (options.binding && options.binding.type !== 'None') {
    price += rules.multipliers.binding[options.binding.type];
  }
  
  // Apply priority markup if selected
  if (options.priority) {
    price *= rules.multipliers.priority;
  }
  
  // Multiply by number of copies
  price *= options.copies;
  
  return parseFloat(price.toFixed(2));
};