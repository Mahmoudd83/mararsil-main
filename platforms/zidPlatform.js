const axios = require('axios');

class ZidApiService {
    static async getTokensByCode(code) {
        const url = `${process.env.ZID_AUTH_URL}/oauth/token`;
        const requestBody = {
            grant_type: 'authorization_code',
            client_id: process.env.ZID_CLIENT_ID,
            client_secret: process.env.ZID_CLIENT_SECRET,
            redirect_uri: `${process.env.MY_BACKEND_URL}/zid/auth/callback`,
            code: code,
        };

        try {
            const response = await axios.post(url, requestBody);
            return response.data;
        } catch (error) {
            console.error('خطأ في جلب التوكينات من زيد:', error.response?.data || error.message);
            throw error;
        }
    }

    static async getMerchantProfile(managerToken, authToken) {
        const url = `${process.env.ZID_BASE_API_URL}/managers/account/profile`;
        const requestHeaders = {
            Authorization: `Bearer ${authToken}`,
            'X-Manager-Token': managerToken,
            Accept: 'application/json',
        };

        try {
            const response = await axios.get(url, { headers: requestHeaders });
            return response.data;
        } catch (e) {
            console.error('خطأ في جلب بيانات التاجر:', e.response?.data || e.message);
            throw e;
        }
    }
}

module.exports = { ZidApiService };
