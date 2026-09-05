import User from '../models/User.model.js';

export const seedDemoUsers = async () => {
  try {
    const demoAccounts = [
      {
        fullName: 'Alice Johnson',
        username: 'alice',
        email: 'alice@cipher.app',
        password: 'password123',
        about: 'Available for secure conversations 🔐',
      },
      {
        fullName: 'Bob Smith',
        username: 'bob',
        email: 'bob@cipher.app',
        password: 'password123',
        about: 'CipherChat security tester 🛡️',
      },
    ];

    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
        console.log(`👤 Seeded demo user: ${acc.fullName} (${acc.email})`);
      }
    }
  } catch (error) {
    console.warn('Demo user seed notice:', error.message);
  }
};
