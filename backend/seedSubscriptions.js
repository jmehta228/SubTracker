require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

const sampleSubscriptions = [
  {
    name: 'Netflix',
    amount: 15.99,
    frequency: 'monthly',
    dueDate: new Date('2026-02-01')
  },
  {
    name: 'Spotify',
    amount: 9.99,
    frequency: 'monthly',
    dueDate: new Date('2026-01-15')
  },
  {
    name: 'GitHub Pro',
    amount: 4.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-18')
  },
  {
    name: 'Adobe Creative Cloud',
    amount: 54.99,
    frequency: 'monthly',
    dueDate: new Date('2026-01-25')
  },
  {
    name: 'AWS',
    amount: 150.00,
    frequency: 'monthly',
    dueDate: new Date('2026-02-05')
  },
  {
    name: 'ChatGPT Plus',
    amount: 20.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-22')
  },
  {
    name: 'Claude Pro',
    amount: 20.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-28')
  },
  {
    name: 'Notion',
    amount: 10.00,
    frequency: 'monthly',
    dueDate: new Date('2026-02-10')
  },
  {
    name: 'Figma',
    amount: 15.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-30')
  },
  {
    name: 'JetBrains All Products',
    amount: 289.00,
    frequency: 'yearly',
    dueDate: new Date('2026-06-15')
  },
  {
    name: 'Vercel Pro',
    amount: 20.00,
    frequency: 'monthly',
    dueDate: new Date('2026-02-03')
  },
  {
    name: 'MongoDB Atlas',
    amount: 57.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-20')
  },
  {
    name: 'Slack Pro',
    amount: 8.75,
    frequency: 'monthly',
    dueDate: new Date('2026-02-08')
  },
  {
    name: 'Google Workspace',
    amount: 12.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-25')
  },
  {
    name: 'Microsoft 365',
    amount: 99.99,
    frequency: 'yearly',
    dueDate: new Date('2026-08-01')
  },
  {
    name: 'Dropbox Plus',
    amount: 11.99,
    frequency: 'monthly',
    dueDate: new Date('2026-02-12')
  },
  {
    name: '1Password',
    amount: 35.88,
    frequency: 'yearly',
    dueDate: new Date('2026-04-20')
  },
  {
    name: 'Linear',
    amount: 10.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-19')
  },
  {
    name: 'Postman Pro',
    amount: 14.00,
    frequency: 'monthly',
    dueDate: new Date('2026-02-15')
  },
  {
    name: 'Cloudflare Pro',
    amount: 20.00,
    frequency: 'monthly',
    dueDate: new Date('2026-01-27')
  }
];

async function seedSubscriptions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find all users
    const users = await User.find();

    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} user(s)`);

    // Clear existing subscriptions
    await Subscription.deleteMany({});
    console.log('Cleared existing subscriptions');

    // Add subscriptions for each user
    for (const user of users) {
      // Add all subscriptions for each user
      const subscriptionsToCreate = sampleSubscriptions.map(sub => ({
        userId: user._id,
        name: sub.name,
        amount: sub.amount,
        frequency: sub.frequency,
        dueDate: sub.dueDate
      }));

      await Subscription.insertMany(subscriptionsToCreate);
      console.log(`Added ${sampleSubscriptions.length} subscriptions for user: ${user.email}`);
    }

    console.log('Sample subscriptions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subscriptions:', error);
    process.exit(1);
  }
}

seedSubscriptions();
