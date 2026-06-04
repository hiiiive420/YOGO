const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`YOGO API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start YOGO API:', error.message);
    process.exit(1);
  });
