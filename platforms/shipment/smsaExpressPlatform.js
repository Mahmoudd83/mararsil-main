const axios = require("axios");
class SmsaExpress {
  constructor(apiKey, baseUrl) {
    // super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  //انشاء شحنة
  async createShipment(shipmentData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/shipment/b2c/new`,
        shipmentData,
        {
          headers: { apikey: this.apiKey, "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create shipmeent in smsa express : ${error.message}`
      );
    }
  }
  //تتبع الشحنة
  async trackShipment(trackingNumber) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/track/${trackingNumber}`,
        { headers: { apikey: this.apiKey } }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to track shipment in smsa express :${error.message}`
      );
    }
  }
  //الغاء شحنة
  async cancelShipment(shipmentId) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/api/shipment/cancel/${shipmentId}`,
        { headers: { apikey: this.apiKey } }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to cancel shipment in SMSA Express :${error.message}`
      );
    }
  }
  //الاستعلام عن شحنة
  async queryShipment(awb) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/shipment/b2c/query/${awb}`,
        { headers: { apikey: this.apiKey, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to query shipment in SMSA Express :${error.message}`
      );
    }
  }
  //الاستعلام عن شحنة رجيع
  async queryReturnShipment(awb) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/shipment/c2b/query/${awb}`,
        { headers: { apikey: this.apiKey, "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to find this shipment :${error.message}`);
    }
  }
  //ارجاع قائمة العملات و البلدان
  async lookupCurrency() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/lookup/currency`, {
        headers: {
          apikey: this.apiKey,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to find currency :${error.message}`);
    }
  }
  //الغاء شحنة رجيع
  async cancelReturnShipment(awb) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/c2b/cancel/${awb}`,
        null,
        {
          headers: {
            apikey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw new Error(`Failed to delete this shipment:${error.message}`);
    }
  }
  //تتبع مجموعة من الشحنات
  async trackBulkShipments(awbs) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/track/bulk`,
        awbs,
        {
          headers: {
            apikey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Filed to find multpla shipment :${error.message}`);
    }
  }
  //الاستعلام عن شحنة معينة
  async trackShipment(awb) {
    try {
      const response = await axios.get(`${this.baseUrl}/track/single/${awb}`, {
        headers: { "Content-Type": "application/json", apiKey: this.apiKey },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Filed to ifnd this shipment :${error.message}`);
    }
  }

  //معالجة طالبات رفع الفواتير
  async pushInvoice(awb, currency, invoiceDate, weightUnit, items) {
    try {
      const invoiceData = {
        AWB: awb,
        Currency: currency,
        WeightUnit: weightUnit,
        InvoiceDate: invoiceDate,
        Items: items,
      };

      const response = await axios.post(
        `${this.baseUrl}/api/invoice`,
        invoiceData,
        {
          headers: {
            apikey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to loged this polesa:${error.message}`);
    }
  }
  //جلب ملف البوليصة
  async getwaybill(awb) {
    try {
      // إرسال الطلب إلى واجهة برمجية (API) لسمسا
      const response = await axios.get(`${BASE_URL}/api/waybill/${awb}`, {
        headers: {
          apikey: API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // لاستقبال الملف كبيانات ثنائية
      });

      // تحويل البيانات الثنائية إلى ملف PDF
      const pdfData = Buffer.from(response.data);
      return pdfData;
    } catch (error) {
      throw new Error(`Failed to find this waybill :${error.message}`);
    }
  }
}
module.exports = SmsaExpress;
