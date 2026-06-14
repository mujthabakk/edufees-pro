import { Injectable, Logger } from '@nestjs/common';

export interface RenderedDocument {
  buffer: Buffer;
  contentType: string;
  extension: 'pdf' | 'html';
}

/**
 * Renders HTML to PDF using Puppeteer. Chromium is launched lazily and the
 * browser instance is reused. If Chromium is unavailable (e.g. not downloaded
 * in a constrained environment) the service degrades gracefully by returning
 * the raw HTML so the surrounding flow still succeeds.
 */
@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private browser: any | null = null;
  private launchFailed = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getBrowser(): Promise<any | null> {
    if (this.browser) return this.browser;
    if (this.launchFailed) return null;
    try {
      // Imported lazily so the app boots even if puppeteer/Chromium is missing.
      const puppeteer = await import('puppeteer');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      return this.browser;
    } catch (err) {
      this.launchFailed = true;
      this.logger.warn(
        `Puppeteer unavailable, falling back to HTML output: ${
          (err as Error).message
        }`,
      );
      return null;
    }
  }

  async renderHtmlToPdf(html: string): Promise<RenderedDocument> {
    const browser = await this.getBrowser();
    if (!browser) {
      return {
        buffer: Buffer.from(html, 'utf-8'),
        contentType: 'text/html',
        extension: 'html',
      };
    }
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      });
      return {
        buffer: Buffer.from(pdf),
        contentType: 'application/pdf',
        extension: 'pdf',
      };
    } finally {
      await page.close();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
