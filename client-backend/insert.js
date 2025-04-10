const mongoose = require('mongoose');
const Shopkeeper = require('./models/shopkeeper');

mongoose.connect('mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/printingAutomation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleShopkeepers = [
  {
    name: "John's Print Hub",
    email: "john@example.com",
    phoneNumber: "9876543210",
    address: {
      street: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India"
    },
    printCosts: {
      blackAndWhite: 2,
      color: 5
    },
    discountRules: [
      { discountPercentage: 10, minimumOrderAmount: 100 }
    ],
    shopHours: {
      monday: { open: "09:00", close: "21:00" },
      tuesday: { open: "09:00", close: "21:00" },
      wednesday: { open: "09:00", close: "21:00" },
      thursday: { open: "09:00", close: "21:00" },
      friday: { open: "09:00", close: "21:00" },
      saturday: { open: "10:00", close: "20:00" },
      sunday: { open: "Closed", close: "Closed" }
    },
    active: true
  },
  {
    name: "Print Express",
    email: "printx@example.com",
    phoneNumber: "9123456789",
    address: {
      street: "456 Market St",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      country: "India"
    },
    printCosts: {
      blackAndWhite: 1.5,
      color: 4.5
    },
    discountRules: [
      { discountPercentage: 5, minimumOrderAmount: 50 },
      { discountPercentage: 15, minimumOrderAmount: 200 }
    ],
    shopHours: {
      monday: { open: "08:30", close: "20:00" },
      tuesday: { open: "08:30", close: "20:00" },
      wednesday: { open: "08:30", close: "20:00" },
      thursday: { open: "08:30", close: "20:00" },
      friday: { open: "08:30", close: "20:00" },
      saturday: { open: "09:00", close: "18:00" },
      sunday: { open: "Closed", close: "Closed" }
    },
    active: true
  }
];

const addSampleShopkeepers = async () => {
  try {
    await Shopkeeper.insertMany(sampleShopkeepers);
    console.log('Sample shopkeepers added successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error adding sample shopkeepers:', error);
  }
};

addSampleShopkeepers();
