# Pi Network JS SDK – Community Developer Guide

This package provides a fully-typed, modern ES module interface to the
Pi Network protocol for browser or web-app integrations. It is
intended for developers building applications that use the Pi browser
extension or the `window.Pi` global API, and wish to use TypeScript or
class-based control.
It is part of the "Ten Minutes to Transactions" effort described in this
[video](https://www.youtube.com/watch?v=cIFqf1Z5pRM&t=35s).

**This package only contains the front end interface for initiating and
completing Pi transations. It does not include back end support and
will not operate without it.** Use one of the back end packages such as
[pi-sdk-nextjs](https://github.com/pi-apps/pi-sdk-nextjs) or
[pi-sdk-rails](https://github.com/pi-apps/pi-sdk-rails).

---

## 🚀 Quick Start

1. **Install with yarn or npm**
   ```sh
   yarn add pi-sdk-js
   # or
   npm install pi-sdk-js
   ```
2. **Ensure the global Pi SDK (`window.Pi`) is available in your HTML**
   ```html
   <script src="https://sdk.minepi.com/pi-sdk.js"></script>
   ```
3. **Import and use the SDK in your project:**

   ```ts
   import { PiSdkBase, PiUser, PaymentData } from 'pi-sdk-js';

   const pi = new PiSdkBase();
   await pi.connect();
   // Now PiSdkBase.user is available (or listen for onConnection)
   pi.createPayment({ amount: 1, memo: "Demo", metadata: { productId: 42 } });
   ```

3. **Provide back end transaction support in your app:**
   as described in the [Official Pi SDK Docs](https://developer.minepi.com/).

---

## 📦 API Overview

### Classes and Types

#### **`PiSdkBase` (Class)**
Core interface to Pi Network via the browser SDK. Example usage:
- **`connect()`** – Initiates authentication and session handshake. Should be called on user intent (or mount).
- **`createPayment(paymentData)`** – Begins a payment operation. All server callbacks are handled automatically via Pi's callback protocol.
- **Static helpers**:
  - `PiSdkBase.user: PiUser | null` – Current user after `.connect()`
  - `PiSdkBase.connected: boolean` – Is SDK authenticated/connected?
  - `PiSdkBase.accessToken: string | null` – Latest session or payment JWT

#### **`PiUser` (Type)**
Represents an authenticated Pi user, at minimum `{ name: string, ... }`.

#### **`PaymentData` (Type)**
```ts
interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}
```
---

## 🔑 Key Details
- **ESM Only**: Use `import { ... } from 'pi-sdk-js'`; no CommonJS support.
- **Depends on the global `window.Pi`**: The SDK does NOT bundle or polyfill the Pi Network global; you must include the Pi SDK `<script>` yourself.
- **Callbacks & Events**: Payment lifecycle events (approve, complete, cancel, error, incomplete) are managed via static methods—override or listen as needed.
- **No React dependency.**

---

## ❓ FAQ

### How do I mock `window.Pi` for testing/development?
Assign a stub to `window.Pi` with mock methods (see your test runner for examples). No real payments or network calls will be made.

### What is required to run in Node.js?
This package is **intended for browsers**; headless use requires you to polyfill `window` and `window.Pi`.

### Where are user roles or advanced Pi features?
See the complete API in source. Most advanced features are mapped, but basics are exposed as above for typical dApps.

---

## 📚 Further Resources
- [Official Pi SDK Docs](https://developer.minepi.com/)
- [Pi SDK JavaScript API Reference](https://developer.minepi.com/sdk/reference)

For advanced integration patterns, see the
[pi-sdk-react](https://github.com/pi-apps/pi-sdk-react) package or
your framework's best practices.
