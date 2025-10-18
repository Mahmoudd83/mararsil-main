require('dotenv').config();

const ZID_CONFIG = {
  clientId: process.env.ZID_CLIENT_ID,
  clientSecret: process.env.ZID_CLIENT_SECRET,
  redirectUri: process.env.ZID_REDIRECT_URI,
  authUrl: 'https://oauth.zid.sa/oauth/authorize',
  tokenUrl: 'https://oauth.zid.sa/oauth/token',
  apiBaseUrl: 'https://api.zid.sa/v1',
};

module.exports = ZID_CONFIG;