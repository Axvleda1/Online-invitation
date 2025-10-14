import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const setupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ 
      email: process.env.ADMIN_EMAIL 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`📧 Email: ${existingAdmin.email}`);
      process.exit(0);
    }
    
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'salome@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
};

setupDatabase();