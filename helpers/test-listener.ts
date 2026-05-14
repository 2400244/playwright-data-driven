import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

/**
 * Custom Playwright reporter that mimics TestNG TestListener functionality.
 * Logs test execution events and writes results to a JSON file.
 * 
 * To use this reporter, add it to playwright.config.ts:
 * reporter: [['html'], ['./helpers/test-listener.ts']]
 * 
 * Note: Excel writing functionality has been replaced with JSON output.
 * Original TestListener wrote to Excel via ExcelUtils.setCellData().
 */
export default class TestListener implements Reporter {
  private testResults: Array<{
    name: string;
    status: string;
    duration: number;
    error?: string;
  }> = [];

  onBegin(config: any, suite: any) {
    console.log(`I am in onStart method: ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase) {
    console.log(`I am in onTestStart method: ${test.title}: start`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testName = test.title;
    const status = result.status.toUpperCase();
    
    switch (result.status) {
      case 'passed':
        console.log(`I am in onTestSuccess method: ${testName}: succeed`);
        break;
      case 'failed':
        console.log(`I am in onTestFailure method: ${testName} failed`);
        break;
      case 'skipped':
        console.log(`I am in onTestSkipped method: ${testName}: skipped`);
        break;
      case 'timedOut':
        console.log(`I am in onTestFailure method: ${testName} failed (timeout)`);
        break;
    }

    this.testResults.push({
      name: testName,
      status: status,
      duration: result.duration,
      error: result.error?.message
    });
  }

  onEnd(result: FullResult) {
    console.log(`I am in onFinish method: ${result.status}`);
    
    // TODO: migrate — original wrote to Excel file via ExcelUtils.setCellData()
    // Now writing to JSON file instead. To use Excel, install exceljs package.
    const outputPath = path.join(process.cwd(), 'test-results', 'test-results.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(this.testResults, null, 2));
    console.log(`Test results written to: ${outputPath}`);
  }

  onStdOut(chunk: string | Buffer, test?: TestCase, result?: TestResult) {
    // Optional: capture stdout if needed
  }

  onStdErr(chunk: string | Buffer, test?: TestCase, result?: TestResult) {
    // Optional: capture stderr if needed
  }

  onError(error: Error) {
    console.error('Test execution error:', error);
  }
}

/**
 * Alternative approach using test hooks in base fixture.
 * Add this to fixtures/base.ts if you prefer hook-based approach over custom reporter:
 * 
 * export const test = base.extend<BaseFixtures>({
 *   page: async ({ page }, use, testInfo) => {
 *     console.log(`Test started: ${testInfo.title}`);
 *     await page.goto('https://opensource-demo.orangehrmlive.com/');
 *     
 *     await use(page);
 *     
 *     const status = testInfo.status?.toUpperCase() || 'UNKNOWN';
 *     console.log(`Test ${status}: ${testInfo.title}`);
 *     
 *     // Write result to JSON file
 *     // TODO: migrate — replace with Excel writing if needed
 *   }
 * });
 */