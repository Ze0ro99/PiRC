import { Mutex } from 'async-mutex';
export interface PiUser {
    name: string;
    [key: string]: any;
}
export interface PaymentData {
    amount: number;
    memo: string;
    metadata: Record<string, unknown>;
}
declare global {
    interface Window {
        Pi: any;
        RAILS_ENV?: string;
        __NEXT_DATA__: any;
        next: any;
    }
    var Pi: any;
}
export declare class PiSdkBase {
    onConnection?: () => void;
    static user: PiUser | null;
    static connected: boolean;
    static paymentBasePath: string;
    static logPrefix: string;
    static version: string;
    static connectMutex: Mutex;
    static accessToken: string | null;
    constructor();
    static get_connected(): boolean;
    static get_user(): PiUser | null;
    static log(...args: unknown[]): void;
    static error(...args: unknown[]): void;
    static checkPaymentBasePath(): void;
    initializePiSdkBase(): void;
    connect(): Promise<void>;
    static postToServer(path: string, body: object): Promise<any>;
    static onReadyForServerApproval(paymentId: string, accessToken: string): Promise<void>;
    static onReadyForServerCompletion(paymentId: string, transactionId: string): Promise<void>;
    static onCancel(paymentId: string): Promise<void>;
    static onError(error: string, paymentDTO: any): Promise<void>;
    static onIncompletePaymentFound(paymentDTO: any): Promise<void>;
    /**
     * Create a new payment request.
     * @param {object} paymentData - Payment details.
     * @param {number} paymentData.amount - Amount in Pi.
     * @param {string} paymentData.memo - Payment memo.
     * @param {object} paymentData.metadata - Optional metadata.
     */
    createPayment(paymentData: PaymentData): void;
}
