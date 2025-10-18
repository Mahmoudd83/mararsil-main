const { ZidApiService } = require("../platforms/zidPlatform");
const Store = require("../models/Store");

const zidAuthRedirect = (req, res, next) => {
  const queries = new URLSearchParams({
    client_id: process.env.ZID_CLIENT_ID,
    redirect_uri: `${process.env.MY_BACKEND_URL}/api/zid/zid/callback`,
    response_type: "code",
  });

  return res.redirect(`${process.env.ZID_AUTH_URL}/oauth/authorize?${queries}`);
};

const zidAuthCallback = async (req, res) => {
  const zidCode = req.query.code;
  console.log("its work .....");
  try {
    const merchantTokens = await ZidApiService.getTokensByCode(zidCode);

    const authToken = merchantTokens.access_token;
    const managerToken = merchantTokens.manager_token;
    const refreshToken = merchantTokens.refresh_token;

    const zidMerchantDetails = await ZidApiService.getMerchantProfile(
      managerToken,
      authToken
    );

    const store = new Store({
      name: zidMerchantDetails.data.name,
      platform: "zid",
      storeName: zidMerchantDetails.data.name,
      accessToken: authToken,
      refreshToken,
      tokenExpiresAt: new Date(Date.now() + merchantTokens.expires_in * 1000),
      storeId: zidMerchantDetails.data.id,
      storeInfo: zidMerchantDetails.data,
    });

    await store.save();

    return res.redirect("/dashboard");
  } catch (err) {
    console.error("خطأ في مصادقة زيد:", err.response?.data || err.message);
    return res.status(500).send("فشل تسجيل الدخول عبر زيد");
  }
};

module.exports = {
  zidAuthRedirect,
  zidAuthCallback,
};
