/**
 * ============================================================================
 * KKKhane Hardware Print Service (QZ Tray Bridge)
 * ============================================================================
 * Requirements: Install qz-tray client-side library -> npm install qz-tray
 * Documentation: https://qz.io/wiki/api
 * 
 * ESC/POS Byte Reference:
 * - Initialize Printer: \x1B\x40
 * - Center Align:       \x1B\x61\x01
 * - Left Align:         \x1B\x61\x00
 * - Bold ON:            \x1B\x45\x01
 * - Bold OFF:           \x1B\x45\x00
 * - Full Paper Cut:     \x1D\x56\x00 or \x1D\x56\x41\x03 (Feed & Cut)
 * ============================================================================
 */

import qz from 'qz-tray';

class QZPrintService {
  constructor() {
    this.isConnected = false;
    this.initSecurity();
  }

  /**
   * 1. SILENT PRINT SECURITY SETUP
   * To prevent QZ Tray from showing a pop-up on every single order, you must
   * sign requests using your digital certificate. For local dev, we suppress/stub it.
   */
  initSecurity() {
    qz.security.setCertificatePromise((resolve, reject) => {
      // IN PRODUCTION: Fetch your public certificate (digital-certificate.txt) from your backend
      // fetch('/api/hardware/qz-cert').then(res => res.text()).then(resolve).catch(reject);
      resolve("-----BEGIN CERTIFICATE-----\nDEMO_CERT_FOR_LOCAL_DEVELOPMENT\n-----END CERTIFICATE-----");
    });

    qz.security.setSignaturePromise((toSign) => {
      return (resolve, reject) => {
        // IN PRODUCTION: Send `toSign` string to your backend (FastAPI/Node), sign it with your private key using RSA-SHA512, and return the signature.
        // fetch('/api/hardware/qz-sign', { method: 'POST', body: toSign }).then(res => res.text()).then(resolve).catch(reject);
        resolve(); // Pass-through for local testing without silent print
      };
    });
  }

  /**
   * 2. WEBSOCKET CONNECTION MANAGER
   */
  async connect() {
    if (qz.websocket.isActive()) {
      this.isConnected = true;
      return;
    }
    try {
      console.log(" Connecting to physical hardware via QZ Tray WebSocket...");
      await qz.websocket.connect({ retries: 3, delay: 1 });
      this.isConnected = true;
      console.log(" QZ Tray connected successfully.");
    } catch (error) {
      this.isConnected = false;
      console.error(" Hardware Connection Failed. Is QZ Tray running in the system tray?", error);
      throw new Error("Could not connect to POS printer daemon.");
    }
  }

  async disconnect() {
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
      this.isConnected = false;
      console.log(" QZ Tray disconnected.");
    }
  }

  /**
   * 3. FIND PHYSICAL PRINTER BY NAME
   * @param {string} query - Partial name of the printer (e.g., "ZKT" or "ZyWell")
   */
  async getPrinter(query) {
    await this.connect();
    try {
      const printerName = await qz.printers.find(query);
      console.log(` Targeted physical printer: ${printerName}`);
      return printerName;
    } catch (error) {
      console.error(` Printer matching "${query}" not found online.`);
      throw new Error(`Printer "${query}" offline or unavailable.`);
    }
  }

  /**
   * 4. KITCHEN ORDER TICKET (KOT) - ZKT THERMAL PRINTER
   * Sends raw ESC/POS byte commands for instant, formatted receipt printing.
   */
  async printKOT({ printerName = "ZKT", kotNumber, tableNo, items, timestamp }) {
    const printer = await this.getPrinter(printerName);
    const config = qz.configs.create(printer, { encoding: 'ISO-8859-1' });

    // Build the raw ESC/POS payload
    const printData = [
      '\x1B\x40',           // 1. Reset/Initialize printer
      '\x1B\x61\x01',       // 2. Center align
      '\x1B\x45\x01',       // 3. Bold ON
      '*** KITCHEN ORDER TICKET ***\n',
      '\x1B\x45\x00',       // 4. Bold OFF
      `KOT No: ${kotNumber}  |  Table: ${tableNo}\n`,
      `Time: ${timestamp}\n`,
      '--------------------------------\n',
      '\x1B\x61\x00',       // 5. Left align
      '\x1B\x45\x01',       // Bold ON for headers
      'QTY   ITEM DESCRIPTION\n',
      '\x1B\x45\x00',       // Bold OFF
      '--------------------------------\n'
    ];

    // Append items dynamically
    items.forEach(item => {
      const qtyStr = String(item.qty).padEnd(5, ' ');
      printData.push(`${qtyStr}${item.name}\n`);
      if (item.notes) {
        printData.push(`      * ${item.notes}\n`);
      }
    });

    printData.push(
      '--------------------------------\n',
      '\n\n',               // Bottom spacing
      '\x1D\x56\x41\x03'    // 6. ESC/POS Command: Feed 3 lines and EXECUTE PAPER CUT
    );

    try {
      console.log(` Streaming raw ESC/POS bytes to ${printer}...`);
      await qz.print(config, printData);
      console.log(" KOT printed and cut successfully.");
    } catch (error) {
      console.error(" POS Print Execution Failed:", error);
      throw error;
    }
  }

  /**
   * 5. BARCODE / STICKER PRINTING - ZYWELL PRINTER
   * Sends raw TSPL or ZPL commands directly to the barcode printer.
   * (Example below uses standard TSPL sticker formatting).
   */
  async printBarcodeLabel({ printerName = "ZyWell", sku, itemName, price }) {
    const printer = await this.getPrinter(printerName);
    const config = qz.configs.create(printer);

    // Raw TSPL command array for a standard 40mm x 30mm barcode sticker
    const tsplData = [
      'SIZE 40 mm, 30 mm\n',     // Sticker dimensions
      'GAP 2 mm, 0 mm\n',        // Gap between stickers
      'CLS\n',                   // Clear image buffer
      `TEXT 20,20,"0",0,1,1,"KKKhane POS"\n`,
      `TEXT 20,50,"0",0,1,1,"${itemName.slice(0, 20)}"\n`,
      `TEXT 20,80,"0",0,1,1,"NPR ${price}"\n`,
      `BARCODE 20,120,"128",50,1,0,2,2,"${sku}"\n`, // Code 128 Barcode
      'PRINT 1,1\n'              // Print 1 copy
    ];

    try {
      console.log(` Streaming raw TSPL barcode data to ${printer}...`);
      await qz.print(config, tsplData);
      console.log(" Barcode label generated.");
    } catch (error) {
      console.error(" Barcode Print Failed:", error);
      throw error;
    }
  }
}

// Export as a singleton instance so connection state persists across the app
export const hardwarePrinter = new QZPrintService();