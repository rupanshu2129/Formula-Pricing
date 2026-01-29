const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const templateData = [
  {
    'Product Code': 'PROD001',
    'Product Name': 'Premium Wheat Flour',
    'Category': 'Grain Products',
    'Base Price': 45.50,
    'Currency': 'USD',
    'Unit': 'MT',
    'Effective Date': '2024-02-01',
    'Expiry Date': '2024-12-31',
    'Region': 'North America',
    'Customer Segment': 'Wholesale',
    'Minimum Order Quantity': 100,
    'Notes': 'Standard pricing for bulk orders'
  },
  {
    'Product Code': 'PROD002',
    'Product Name': 'Organic Corn',
    'Category': 'Grain Products',
    'Base Price': 52.75,
    'Currency': 'USD',
    'Unit': 'MT',
    'Effective Date': '2024-02-01',
    'Expiry Date': '2024-12-31',
    'Region': 'North America',
    'Customer Segment': 'Retail',
    'Minimum Order Quantity': 50,
    'Notes': 'Certified organic'
  },
  {
    'Product Code': 'PROD003',
    'Product Name': 'Soybean Meal',
    'Category': 'Protein Products',
    'Base Price': 38.25,
    'Currency': 'USD',
    'Unit': 'MT',
    'Effective Date': '2024-02-01',
    'Expiry Date': '2024-12-31',
    'Region': 'North America',
    'Customer Segment': 'Wholesale',
    'Minimum Order Quantity': 200,
    'Notes': 'High protein content'
  }
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(templateData);

worksheet['!cols'] = [
  { wch: 15 },
  { wch: 25 },
  { wch: 20 },
  { wch: 12 },
  { wch: 10 },
  { wch: 8 },
  { wch: 15 },
  { wch: 15 },
  { wch: 20 },
  { wch: 20 },
  { wch: 25 },
  { wch: 30 }
];

XLSX.utils.book_append_sheet(workbook, worksheet, 'Pricing Data');

const instructionsData = [
  ['VAP Pricing Import Template - Instructions'],
  [''],
  ['Column Descriptions:'],
  ['Product Code', 'Unique identifier for the product (required)'],
  ['Product Name', 'Full name of the product (required)'],
  ['Category', 'Product category (e.g., Grain Products, Protein Products)'],
  ['Base Price', 'Base price in the specified currency (required, numeric)'],
  ['Currency', 'Currency code (e.g., USD, EUR, CAD)'],
  ['Unit', 'Unit of measurement (e.g., MT, KG, LB)'],
  ['Effective Date', 'Date when pricing becomes effective (YYYY-MM-DD format)'],
  ['Expiry Date', 'Date when pricing expires (YYYY-MM-DD format)'],
  ['Region', 'Geographic region for pricing'],
  ['Customer Segment', 'Target customer segment (e.g., Wholesale, Retail)'],
  ['Minimum Order Quantity', 'Minimum quantity required (numeric)'],
  ['Notes', 'Additional notes or comments'],
  [''],
  ['Important Notes:'],
  ['- All dates must be in YYYY-MM-DD format'],
  ['- Numeric fields (Base Price, Minimum Order Quantity) must contain only numbers'],
  ['- Product Code and Product Name are required fields'],
  ['- Remove this sheet before uploading']
];

const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData);
instructionsWorksheet['!cols'] = [{ wch: 30 }, { wch: 60 }];

XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instructions');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const filePath = path.join(publicDir, 'vap-pricing-template.xlsx');
XLSX.writeFile(workbook, filePath);

console.log(`Template created successfully at: ${filePath}`);
