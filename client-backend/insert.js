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
    priorityRate: 1.1, // Standard rate
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
    priorityRate: 1.5, // Premium rate
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
  },
  {
    name: "Quick Prints",
    email: "quick@example.com",
    phoneNumber: "9898989898",
    address: {
      street: "789 Tech Park",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    },
    printCosts: {
      blackAndWhite: 3,
      color: 6
    },
    priorityRate: 2.0, // Premium express rate
    discountRules: [
      { discountPercentage: 20, minimumOrderAmount: 300 }
    ],
    shopHours: {
      monday: { open: "00:00", close: "23:59" },
      tuesday: { open: "00:00", close: "23:59" },
      wednesday: { open: "00:00", close: "23:59" },
      thursday: { open: "00:00", close: "23:59" },
      friday: { open: "00:00", close: "23:59" },
      saturday: { open: "00:00", close: "23:59" },
      sunday: { open: "00:00", close: "23:59" }
    },
    active: true
  }
];

const resetAndAddSampleShopkeepers = async () => {
  try {
    // First, delete all existing shopkeepers
    await Shopkeeper.deleteMany({});
    console.log('Existing shopkeepers deleted');

    // Then, insert new sample data
    await Shopkeeper.insertMany(sampleShopkeepers);
    console.log('New sample shopkeepers added successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting and adding sample shopkeepers:', error);
    mongoose.connection.close();
  }
};

resetAndAddSampleShopkeepers();