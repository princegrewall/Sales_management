export interface SalesRecord {
  transactionId: string;
  date: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  customerRegion: string;
  customerType: string;
  productId: string;
  productName: string;
  brand: string;
  productCategory: string;
  tags: string[];
  quantity: number;
  pricePerUnit: number;
  discountPercentage: number;
  totalAmount: number;
  finalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  deliveryType: string;
  storeId: string;
  storeLocation: string;
  salespersonId: string;
  employeeName: string;
}

const customerNames = ['Neha Yadav', 'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Anjali Gupta', 'Vikram Patel', 'Sunita Verma', 'Rajesh Joshi', 'Kavita Reddy', 'Deepak Nair'];
const regions = ['North', 'South', 'East', 'West', 'Central'];
const categories = ['Clothing', 'Electronics', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys'];
const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'];
const brands = ['Nike', 'Samsung', 'Apple', 'Sony', 'LG', 'Adidas', 'Puma', 'HP', 'Dell', 'Lenovo'];
const tagsList = ['New Arrival', 'Best Seller', 'On Sale', 'Premium', 'Limited Edition', 'Trending'];

function generateTransactionId(): string {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

function generateCustomerId(): string {
  return `CUST${Math.floor(10000 + Math.random() * 90000)}`;
}

function generateDate(): string {
  const start = new Date('2023-01-01');
  const end = new Date('2024-12-31');
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generatePhoneNumber(): string {
  return `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomTags(): string[] {
  const numTags = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...tagsList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}

export function generateMockData(count: number = 150): SalesRecord[] {
  const records: SalesRecord[] = [];

  for (let i = 0; i < count; i++) {
    const quantity = Math.floor(Math.random() * 10) + 1;
    const pricePerUnit = Math.floor(Math.random() * 5000) + 100;
    const discountPercentage = Math.floor(Math.random() * 30);
    const totalAmount = quantity * pricePerUnit;
    const finalAmount = totalAmount - (totalAmount * discountPercentage / 100);

    records.push({
      transactionId: generateTransactionId(),
      date: generateDate(),
      customerId: generateCustomerId(),
      customerName: getRandomElement(customerNames),
      phoneNumber: generatePhoneNumber(),
      gender: getRandomElement(['Male', 'Female', 'Other'] as const),
      age: Math.floor(Math.random() * 50) + 18,
      customerRegion: getRandomElement(regions),
      customerType: getRandomElement(['Regular', 'Premium', 'New']),
      productId: `PROD${Math.floor(1000 + Math.random() * 9000)}`,
      productName: `Product ${i + 1}`,
      brand: getRandomElement(brands),
      productCategory: getRandomElement(categories),
      tags: getRandomTags(),
      quantity,
      pricePerUnit,
      discountPercentage,
      totalAmount,
      finalAmount,
      paymentMethod: getRandomElement(paymentMethods),
      orderStatus: getRandomElement(['Delivered', 'Pending', 'Shipped', 'Cancelled']),
      deliveryType: getRandomElement(['Standard', 'Express', 'Same Day']),
      storeId: `STR${Math.floor(100 + Math.random() * 900)}`,
      storeLocation: getRandomElement(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']),
      salespersonId: `EMP${Math.floor(100 + Math.random() * 900)}`,
      employeeName: getRandomElement(['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown']),
    });
  }

  return records;
}

export const mockData = generateMockData(150);

export const filterOptions = {
  regions,
  genders: ['Male', 'Female', 'Other'],
  ageRanges: ['18-25', '26-35', '36-45', '46-55', '55+'],
  categories,
  tags: tagsList,
  paymentMethods,
};
