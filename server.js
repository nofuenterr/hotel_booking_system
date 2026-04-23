require('dotenv/config');

const app = require('./appSetup.js');
const { PORT } = require('./includes/config/mainConfig.js');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});