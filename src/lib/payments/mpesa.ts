// src/lib/payments/mpesa.ts
// M-Pesa Daraja API integration - STK Push for Kenya

interface MpesaToken {
  access_token: string;
  expires_in: string;
}

interface STKPushPayload {
  phone: string;      // 254XXXXXXXXX format
  amount: number;
  orderId: string;
  orderNumber: string;
  callbackUrl: string;
}

interface STKPushResult {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  customerMessage?: string;
  error?: string;
}

interface STKQueryResult {
  success: boolean;
  resultCode?: number;
  resultDesc?: string;
  receiptNumber?: string;
}

class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortCode: string;
  private passKey: string;
  private baseUrl: string;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.shortCode = process.env.MPESA_SHORTCODE!;
    this.passKey = process.env.MPESA_PASSKEY!;
    // Sandbox: https://sandbox.safaricom.co.ke
    // Production: https://api.safaricom.co.ke
    this.baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
  }

  /**
   * Get OAuth token from Safaricom
   */
  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get M-Pesa access token");
    }

    const data: MpesaToken = await response.json();
    return data.access_token;
  }

  /**
   * Generate password for STK Push
   * Format: Base64(ShortCode + PassKey + Timestamp)
   */
  private generatePassword(timestamp: string): string {
    const str = `${this.shortCode}${this.passKey}${timestamp}`;
    return Buffer.from(str).toString("base64");
  }

  /**
   * Get current timestamp in YYYYMMDDHHMMSS format
   */
  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      `${now.getFullYear()}` +
      `${pad(now.getMonth() + 1)}` +
      `${pad(now.getDate())}` +
      `${pad(now.getHours())}` +
      `${pad(now.getMinutes())}` +
      `${pad(now.getSeconds())}`
    );
  }

  /**
   * Format phone number to 254XXXXXXXXX
   */
  formatPhone(phone: string): string {
    // Remove spaces and special chars
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      return `254${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith("254")) {
      return cleaned;
    }
    if (cleaned.startsWith("+254")) {
      return cleaned.slice(1);
    }
    return cleaned;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(payload: STKPushPayload): Promise<STKPushResult> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhone(payload.phone);

      const requestBody = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(payload.amount), // M-Pesa requires integer
        PartyA: formattedPhone,
        PartyB: this.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: payload.callbackUrl,
        AccountReference: payload.orderNumber,
        TransactionDesc: `Payment for order ${payload.orderNumber}`,
      };

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data.ResponseCode === "0") {
        return {
          success: true,
          checkoutRequestId: data.CheckoutRequestID,
          merchantRequestId: data.MerchantRequestID,
          customerMessage: data.CustomerMessage,
        };
      } else {
        return {
          success: false,
          error: data.errorMessage || "STK Push failed",
        };
      }
    } catch (error) {
      console.error("M-Pesa STK Push error:", error);
      return {
        success: false,
        error: "Payment initiation failed. Please try again.",
      };
    }
  }

  /**
   * Query STK Push status
   */
  async querySTKStatus(checkoutRequestId: string): Promise<STKQueryResult> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: this.shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
          }),
        }
      );

      const data = await response.json();

      if (data.ResultCode === 0) {
        // Find receipt number from metadata
        const receiptItem = data.CallbackMetadata?.Item?.find(
          (item: any) => item.Name === "MpesaReceiptNumber"
        );

        return {
          success: true,
          resultCode: data.ResultCode,
          resultDesc: data.ResultDesc,
          receiptNumber: receiptItem?.Value,
        };
      } else {
        return {
          success: false,
          resultCode: data.ResultCode,
          resultDesc: data.ResultDesc,
        };
      }
    } catch (error) {
      return { success: false, resultDesc: "Query failed" };
    }
  }
}

export const mpesaService = new MpesaService();
