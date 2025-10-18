const axios = require("axios");

class Aramex {
  constructor(
    username,
    password,
    accountNumber,
    pin,
    entity,
    countryCode,
    baseUrl
  ) {
    this.username = username;
    this.password = password;
    this.accountNumber = accountNumber;
    this.pin = pin;
    this.entity = entity;
    this.countryCode = countryCode;
    this.baseUrl = baseUrl;
  }

  // إنشاء شحنة
  async createShipment(shipmentData) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        Shipments: [shipmentData],
      };

      const response = await axios.post(
        `${this.baseUrl}/shipping/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create shipment in Aramex: ${error.message}`);
    }
  }

  // تتبع الشحنة
  async trackShipment(awbNumbers, getLastUpdateOnly = false) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        Shipments: awbNumbers,
        GetLastTrackingUpdateOnly: getLastUpdateOnly,
      };

      const response = await axios.post(
        `${this.baseUrl}/tracking/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to track shipment in Aramex: ${error.message}`);
    }
  }

  // حجز نطاق أرقام الشحنات
  async reserveShipmentNumbers(rangeSize) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        RangeSize: rangeSize,
      };

      const response = await axios.post(
        `${this.baseUrl}/shipping/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to reserve shipment numbers in Aramex: ${error.message}`
      );
    }
  }

  // طباعة ملصق الشحنة
  async printLabel(shipmentNumber) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        ShipmentNumber: shipmentNumber,
      };

      const response = await axios.post(
        `${this.baseUrl}/label/printing/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to print label in Aramex: ${error.message}`);
    }
  }

  // جدولة استلام الشحنة
  async schedulePickup(pickupDetails) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        Pickup: pickupDetails,
      };

      const response = await axios.post(
        `${this.baseUrl}/pickup/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to schedule pickup in Aramex: ${error.message}`);
    }
  }

  // إلغاء طلب الاستلام
  async cancelPickup(pickupGUID) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        PickupGUID: pickupGUID,
      };

      const response = await axios.post(
        `${this.baseUrl}/pickup/cancel/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to cancel pickup in Aramex: ${error.message}`);
    }
  }

  // التحقق من العنوان
  async validateAddress(address) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        Address: address,
      };

      const response = await axios.post(
        `${this.baseUrl}/location/address/validation/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to validate address in Aramex: ${error.message}`);
    }
  }

  // جلب المدن
  async fetchCities(countryCode, cityNamePrefix = "") {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        CountryCode: countryCode,
        CityNamePrefix: cityNamePrefix,
      };

      const response = await axios.post(
        `${this.baseUrl}/location/cities/fetching/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch cities in Aramex: ${error.message}`);
    }
  }

  // جلب المكاتب
  async fetchOffices(countryCode) {
    try {
      const requestData = {
        ClientInfo: {
          UserName: this.username,
          Password: this.password,
          Version: "v1",
          AccountNumber: this.accountNumber,
          AccountPin: this.pin,
          AccountEntity: this.entity,
          AccountCountryCode: this.countryCode,
        },
        CountryCode: countryCode,
      };

      const response = await axios.post(
        `${this.baseUrl}/location/offices/fetching/service_1_0.svc`,
        requestData,
        {
          headers: { "Content-Type": "application/xml" },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch offices in Aramex: ${error.message}`);
    }
  }
}

module.exports = Aramex;
