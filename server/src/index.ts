import app from './app.js';
import config from './config/default.js';

const PORT = config.port;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

