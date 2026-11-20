// Central, easy-to-edit configuration for the Fruivilla demo.

export const BRAND = {
  name: 'Fruitvilla',
  tagline: 'Fresh Fruits, Fresh Life.',
  phone: '+91 8080146069',
  email: 'pavankale884@gmail.com',
  address: 'wakad chowk banglore,high-way pune',
};

// Delivery charges (in INR).
export const DELIVERY = {
  charge: 40,
  freeAbove: 500, 
};

// DEMO serviceable PIN codes. Edit this list to change where delivery is "available".
export const SERVICEABLE_PINCODES = [
  '411001', '411002', '411003', '411004', '411005', '411006', '411007', '411008',
  '411009', '411011', '411014', '411016', '411021', '411027', '411028', '411030',
  '411033', '411038', '411040', '411045', '411052', '411057',
  '400001', '400050', '400069', '560001', '110001',
];

export const ADMIN_DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const UNITS = ['kg', 'dozen', 'piece', 'box'];

export const CATEGORIES = ['Orchard', 'Tropical', 'Citrus', 'Vine & Berries', 'Melons', 'Exotic'];

export const ORDER_STATUSES = ['New', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Pay on Delivery'];

export const PAYMENT_METHODS = {
  COD: 'Cash on Delivery',
  ONLINE: 'Online Payment (Demo)',
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];
