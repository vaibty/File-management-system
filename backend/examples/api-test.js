/**
 * API Test Script for File Management System
 *
 * This script demonstrates how to test the API endpoints
 * and can be used for manual testing or as a reference.
 */

const http = require('http');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const API_BASE = `${BACKEND_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
let testsPassed = 0;
let testsFailed = 0;

/**
 * Make HTTP request and return promise
 */
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url.replace(BACKEND_URL, ''),
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Print test result
 */
function printTestResult(testName, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? colors.green : colors.red;

  console.log(`${color}${status}${colors.reset}: ${testName} - ${message}`);

  if (passed) {
    testsPassed++;
  } else {
    testsFailed++;
  }
}

/**
 * Test health endpoint
 */
async function testHealth() {
  try {
    const response = await makeRequest(`${API_BASE}/health`);

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      printTestResult('Health Check', true, `Status: ${data.status}, Uptime: ${data.uptime}s`);
    } else {
      printTestResult('Health Check', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('Health Check', false, `Error: ${error.message}`);
  }
}

/**
 * Test system endpoint
 */
async function testSystem() {
  try {
    const response = await makeRequest(`${API_BASE}/system`);

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      printTestResult('System Info', true, `Platform: ${data.system.platform}, Node: ${data.system.nodeVersion}`);
    } else {
      printTestResult('System Info', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('System Info', false, `Error: ${error.message}`);
  }
}

/**
 * Test list directory endpoint
 */
async function testListDirectory() {
  try {
    const response = await makeRequest(`${API_BASE}/list`);

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      const hasStaticFiles = data.some(item => item.name === 'static-files');

      if (hasStaticFiles) {
        printTestResult('List Directory', true, `Found ${data.length} items, including static-files`);
      } else {
        printTestResult('List Directory', false, 'static-files directory not found');
      }
    } else {
      printTestResult('List Directory', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('List Directory', false, `Error: ${error.message}`);
  }
}

/**
 * Test list subdirectory endpoint
 */
async function testListSubdirectory() {
  try {
    const response = await makeRequest(`${API_BASE}/list?path=/static-files`);

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      printTestResult('List Subdirectory', true, `Found ${data.length} items in static-files`);
    } else {
      printTestResult('List Subdirectory', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('List Subdirectory', false, `Error: ${error.message}`);
  }
}

/**
 * Test file content endpoint
 */
async function testFileContent() {
  try {
    const response = await makeRequest(`${API_BASE}/file?path=/static-files/data/metrics.csv`);

    if (response.statusCode === 200) {
      const contentLength = response.data.length;
      printTestResult('File Content', true, `Retrieved ${contentLength} characters`);
    } else {
      printTestResult('File Content', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('File Content', false, `Error: ${error.message}`);
  }
}

/**
 * Test download endpoint
 */
async function testDownload() {
  try {
    const response = await makeRequest(`${API_BASE}/download?path=/static-files/data/metrics.csv`);

    if (response.statusCode === 200) {
      const contentLength = response.data.length;
      printTestResult('File Download', true, `Downloaded ${contentLength} bytes`);
    } else {
      printTestResult('File Download', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('File Download', false, `Error: ${error.message}`);
  }
}

/**
 * Test directory download endpoint
 */
async function testDirectoryDownload() {
  try {
    const response = await makeRequest(`${API_BASE}/download?path=/static-files`);

    if (response.statusCode === 200) {
      const contentLength = response.data.length;
      const isZip = response.headers['content-type'] === 'application/zip';

      if (isZip && contentLength > 0) {
        printTestResult('Directory Download', true, `Downloaded ZIP file (${contentLength} bytes)`);
      } else {
        printTestResult('Directory Download', false, 'Not a valid ZIP file or empty');
      }
    } else {
      printTestResult('Directory Download', false, `Expected 200, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('Directory Download', false, `Error: ${error.message}`);
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  try {
    const response = await makeRequest(`${API_BASE}/list?path=/nonexistent`);

    if (response.statusCode === 500) {
      printTestResult('Error Handling', true, 'Correctly returned 500 for invalid path');
    } else {
      printTestResult('Error Handling', false, `Expected 500, got ${response.statusCode}`);
    }
  } catch (error) {
    printTestResult('Error Handling', false, `Error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.cyan}${colors.bright}🚀 File Management System API Tests${colors.reset}`);
  console.log(`${colors.cyan}=====================================${colors.reset}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`API Base: ${API_BASE}`);
  console.log('');

  // Run all tests
  await testHealth();
  await testSystem();
  await testListDirectory();
  await testListSubdirectory();
  await testFileContent();
  await testDownload();
  await testDirectoryDownload();
  await testErrorHandling();

  // Print results
  console.log('');
  console.log(`${colors.cyan}📊 Test Results Summary${colors.reset}`);
  console.log(`${colors.cyan}========================${colors.reset}`);
  console.log(`${colors.green}✅ Tests Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Tests Failed: ${testsFailed}${colors.reset}`);
  console.log('');

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All tests passed! The API is working correctly.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed. Please check the output above for details.${colors.reset}`);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error(`${colors.red}❌ Test runner error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  makeRequest,
  printTestResult
};
