import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import type { Chrome } from "chrome-launcher";
import type { Result as LighthouseLHR } from "lighthouse/types/lhr";

export interface LighthouseResult {
  performance: number;
  accessibility: number;
  seo: number;
}

/**
 * Runs Lighthouse audit on a given URL
 * Returns performance, accessibility, and SEO scores as integers (0-100)
 */
export async function runLighthouse(url: string): Promise<LighthouseResult> {
  let chrome: Chrome | null = null;

  try {
    // Launch Chrome in headless mode
    chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
    });

    // Lighthouse configuration
    // Desktop strategy, headless mode, only performance/accessibility/SEO categories
    const options = {
      logLevel: "info" as const,
      output: "json" as const,
      onlyCategories: ["performance", "accessibility", "seo"],
      port: chrome.port,
      // Explicitly set desktop emulation
      emulatedFormFactor: "desktop" as const,
    };

    // Run Lighthouse audit
    const runnerResult = await lighthouse(url, options);

    if (!runnerResult) {
      throw new Error("Lighthouse audit returned no results");
    }

    const lhr = runnerResult.lhr;

    // Extract category scores
    // Scores are 0-1, multiply by 100 and round to get 0-100 integers
    const performance = Math.round(
      (lhr.categories.performance?.score ?? 0) * 100
    );
    const accessibility = Math.round(
      (lhr.categories.accessibility?.score ?? 0) * 100
    );
    const seo = Math.round((lhr.categories.seo?.score ?? 0) * 100);

    return {
      performance,
      accessibility,
      seo,
    };
  } catch (error) {
    // Throw descriptive error
    const errorMessage =
      error instanceof Error
        ? `Failed to run Lighthouse audit on ${url}: ${error.message}`
        : `Failed to run Lighthouse audit on ${url}: Unknown error occurred`;
    throw new Error(errorMessage);
  } finally {
    // Ensure Chrome is always killed
    if (chrome) {
      try {
        await chrome.kill();
      } catch (killError) {
        // Log but don't throw - we've already handled the main error
        console.error("Failed to kill Chrome instance:", killError);
      }
    }
  }
}
