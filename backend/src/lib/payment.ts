import QRCode from 'qrcode';

export interface PaymentInitializationResult {
  qrCodeDataUrl: string;
  upiUri: string;
  upiId: string;
  payeeName: string;
  amount: number;
  orderNumber: string;
}

export interface IPaymentProvider {
  type: 'MANUAL_UPI_QR' | 'GATEWAY_RAZORPAY';
  generatePaymentDetails(orderNumber: string, amount: number): Promise<PaymentInitializationResult>;
}

export class ManualUpiPaymentProvider implements IPaymentProvider {
  type: 'MANUAL_UPI_QR' = 'MANUAL_UPI_QR';

  private upiId: string;
  private payeeName: string;

  constructor() {
    this.upiId = process.env.NEXT_PUBLIC_UPI_ID || 'houseoframyaa@upi';
    this.payeeName = process.env.NEXT_PUBLIC_UPI_NAME || 'House of Ramyaa';
  }

  async generatePaymentDetails(orderNumber: string, amount: number): Promise<PaymentInitializationResult> {
    const encodedName = encodeURIComponent(this.payeeName);
    const encodedNote = encodeURIComponent(`Order ${orderNumber} - House of Ramyaa`);
    const upiUri = `upi://pay?pa=${this.upiId}&pn=${encodedName}&am=${amount.toFixed(2)}&tn=${encodedNote}&cu=INR`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1E65B3',
          light: '#FFFFFF',
        },
      });

      return {
        qrCodeDataUrl,
        upiUri,
        upiId: this.upiId,
        payeeName: this.payeeName,
        amount,
        orderNumber,
      };
    } catch (error) {
      console.error('Failed to generate UPI QR code:', error);
      throw new Error('Could not generate UPI QR Code');
    }
  }
}

export const activePaymentProvider: IPaymentProvider = new ManualUpiPaymentProvider();
