/// <reference types="node" />
import { chromium, Browser, Page } from "playwright";
import { mkdir } from "fs/promises";
import { join } from "path";

// Type declarations for browser context evaluation
declare const window: Window & typeof globalThis;

export interface ScrapeResult {
  metadata: {
    title: string | null;
    description: string | null;
  };
  headings: {
    tag: "H1" | "H2" | "H3";
    text: string;
  }[];
  ctas: {
    text: string;
    isAboveTheFold: boolean;
  }[];
  forms: {
    inputCount: number;
  }[];
  navigation: {
    linkCount: number;
  };
  screenshotPath: string;
}

/**
 * Scrapes a website using Playwright and extracts structured UX signals
 */
export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser in headless mode
    browser = await chromium.launch({
      headless: true,
    });

    // Create page with desktop viewport
    page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });

    // Navigate to URL and wait for networkidle
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Get viewport height for "above the fold" detection
    const viewportHeight = page.viewportSize()?.height || 800;

    // Extract metadata
    const metadata = {
      title: await page.title().catch(() => null),
      description:
        (await page
          .$eval('meta[name="description"]', (el: Element) => (el as HTMLMetaElement).getAttribute("content"))
          .catch(() => null)) || null,
    };

    // Extract headings (H1, H2, H3) - only visible ones
    const headings = await page.$$eval(
      "h1, h2, h3",
      (elements: Element[]) => {
        return elements
          .filter((el: Element) => {
            // Check if element is visible
            const style = window.getComputedStyle(el);
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0"
            );
          })
          .map((el: Element) => {
            const text = el.textContent?.trim() || "";
            return {
              tag: el.tagName as "H1" | "H2" | "H3",
              text,
            };
          })
          .filter((h: { tag: "H1" | "H2" | "H3"; text: string }) => h.text.length > 0); // Ignore empty strings
      }
    );

    // Extract CTAs (links and buttons) - only visible ones
    const ctas = await page.$$eval(
      "a, button",
      (elements: Element[], vpHeight: number) => {
        return elements
          .filter((el: Element) => {
            // Check if element is visible
            const style = window.getComputedStyle(el);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              style.opacity === "0"
            ) {
              return false;
            }

            // Get bounding box to check if in viewport
            const rect = el.getBoundingClientRect();
            return (
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= window.innerHeight &&
              rect.right <= window.innerWidth
            );
          })
          .map((el: Element) => {
            const text = el.textContent?.trim() || "";
            const rect = el.getBoundingClientRect();
            return {
              text,
              isAboveTheFold: rect.y < vpHeight,
            };
          })
          .filter((cta: { text: string; isAboveTheFold: boolean }) => cta.text.length > 2); // Text length > 2
      },
      viewportHeight
    );

    // Extract forms (count inputs per form)
    const forms = await page.$$eval("form", (formElements: Element[]) => {
      return formElements.map((form: Element) => {
        const inputs = form.querySelectorAll("input, select, textarea");
        return {
          inputCount: inputs.length,
        };
      });
    }).catch(() => {
      // If no forms exist, return empty array
      return [];
    });

    // Extract navigation (count links inside nav)
    const navigation = await page.$eval("nav", (navElement: Element): { linkCount: number } => {
      const links = navElement.querySelectorAll("a");
      return {
        linkCount: links.length,
      };
    }).catch(() => {
      // If no nav element exists, return 0
      return { linkCount: 0 };
    });

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = join(process.cwd(), "screenshots");
    try {
      await mkdir(screenshotsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Take screenshot
    const screenshotFilename = `screenshot-${Date.now()}.png`;
    const screenshotPath = join(screenshotsDir, screenshotFilename);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false, // Only viewport
    });

    return {
      metadata,
      headings,
      ctas,
      forms,
      navigation,
      screenshotPath,
    };
  } catch (error) {
    // Throw descriptive error
    const errorMessage =
      error instanceof Error
        ? `Failed to scrape website ${url}: ${error.message}`
        : `Failed to scrape website ${url}: Unknown error occurred`;
    throw new Error(errorMessage);
  } finally {
    // Ensure browser is closed even on error
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }
}
