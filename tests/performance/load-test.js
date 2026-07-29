/**
 * Performance/Load Tests using k6
 * Run with: k6 run tests/performance/load-test.js
 * 
 * Or install dependencies and run via npm script
 */
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const pageLoadTime = new Trend('page_load_time')
const apiResponseTime = new Trend('api_response_time')

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - light load to verify basic functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
    // Load test - normal expected traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },   // Ramp up
        { duration: '5m', target: 20 },   // Stay at 20
        { duration: '2m', target: 0 },     // Ramp down
      ],
    },
    // Stress test - peak traffic
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 0 },
      ],
    },
    // Spike test - sudden traffic spike
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 0 },
        { duration: '30s', target: 100 }, // Spike
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],      // 95% under 500ms
    http_req_failed: ['rate<0.01'],        // Error rate < 1%
    errors: ['rate<0.05'],                 // Custom error rate < 5%
  },
}

const BASE_URL = __ENV.BASE_URL || 'https://work-2-cbzcqqefmonnnsyh.prod-runtime.all-hands.dev'

// Test data
const testUsers = [
  { email: 'user1@example.com', name: 'Test User 1' },
  { email: 'user2@example.com', name: 'Test User 2' },
]

export function setup() {
  // Setup any test data
  return { baseUrl: BASE_URL }
}

export default function(data) {
  const baseUrl = data.baseUrl

  // Test 1: Homepage Load
  const homeResponse = http.get(baseUrl + '/')
  pageLoadTime.add(homeResponse.timings.duration)
  
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads under 2s': (r) => r.timings.duration < 2000,
    'homepage has content': (r) => r.body.length > 1000,
  })
  
  if (homeResponse.status !== 200) {
    errorRate.add(1)
  }

  sleep(1)

  // Test 2: Events Page
  const eventsResponse = http.get(baseUrl + '/events')
  check(eventsResponse, {
    'events page loads': (r) => r.status === 200,
    'events page loads under 3s': (r) => r.timings.duration < 3000,
  })

  sleep(1)

  // Test 3: Sevas Page
  const sevasResponse = http.get(baseUrl + '/sevas')
  check(sevasResponse, {
    'sevas page loads': (r) => r.status === 200,
  })

  sleep(1)

  // Test 4: Gallery Page
  const galleryResponse = http.get(baseUrl + '/gallery')
  check(galleryResponse, {
    'gallery page loads': (r) => r.status === 200,
  })

  sleep(1)

  // Test 5: API Endpoint - Events
  const eventsApiResponse = http.get(baseUrl + '/api/events')
  apiResponseTime.add(eventsApiResponse.timings.duration)
  
  check(eventsApiResponse, {
    'events API returns 200': (r) => r.status === 200,
    'events API responds quickly': (r) => r.timings.duration < 500,
  })

  sleep(1)

  // Test 6: API Endpoint - Sevas
  const sevasApiResponse = http.get(baseUrl + '/api/sevas')
  check(sevasApiResponse, {
    'sevas API returns 200': (r) => r.status === 200,
  })

  sleep(1)

  // Test 7: Donate Page
  const donateResponse = http.get(baseUrl + '/donate')
  check(donateResponse, {
    'donate page loads': (r) => r.status === 200,
  })

  sleep(1)

  // Test 8: Contact Page
  const contactResponse = http.get(baseUrl + '/contact')
  check(contactResponse, {
    'contact page loads': (r) => r.status === 200,
  })

  sleep(1)

  // Test 9: About Page
  const aboutResponse = http.get(baseUrl + '/about')
  check(aboutResponse, {
    'about page loads': (r) => r.status === 200,
  })

  sleep(1)

  // Test 10: Search API
  const searchResponse = http.get(baseUrl + '/api/search?q=temple')
  check(searchResponse, {
    'search API works': (r) => r.status === 200,
  })

  sleep(1)
}

// Simulate user journeys
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'reports/load-test-results.json': JSON.stringify(data, null, 2),
  }
}

function textSummary(data, options) {
  const { metrics } = data
  const duration = data.state.testRunDuration || 'N/A'
  
  let summary = '\n'
  summary += '='.repeat(60) + '\n'
  summary += 'PERFORMANCE TEST SUMMARY\n'
  summary += '='.repeat(60) + '\n\n'
  
  summary += `Duration: ${duration}\n`
  summary += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`
  summary += `Failed Requests: ${metrics.http_req_failed?.values?.passes || 0}\n\n`
  
  summary += 'Response Times:\n'
  summary += `  Average: ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 'N/A'}ms\n`
  summary += `  P95: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms\n`
  summary += `  P99: ${metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms\n`
  summary += `  Max: ${metrics.http_req_duration?.values?.max?.toFixed(2) || 'N/A'}ms\n\n`
  
  summary += 'Page Load Times:\n'
  summary += `  Average: ${metrics.page_load_time?.values?.avg?.toFixed(2) || 'N/A'}ms\n`
  summary += `  P95: ${metrics.page_load_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms\n\n`
  
  summary += 'API Response Times:\n'
  summary += `  Average: ${metrics.api_response_time?.values?.avg?.toFixed(2) || 'N/A'}ms\n`
  summary += `  P95: ${metrics.api_response_time?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms\n\n`
  
  summary += 'Error Rate:\n'
  summary += `  ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n`
  summary += '='.repeat(60) + '\n'
  
  return summary
}

// Check thresholds
export function checkThresholds() {
  const checks = [
    { name: 'HTTP Duration P95', value: metrics.http_req_duration?.values?.['p(95)'] || 0, threshold: 500 },
    { name: 'Error Rate', value: (metrics.http_req_failed?.values?.rate || 0) * 100, threshold: 1 },
  ]
  
  console.log('\nThreshold Checks:')
  checks.forEach(check => {
    const status = check.value <= check.threshold ? '✓ PASS' : '✗ FAIL'
    console.log(`  ${check.name}: ${check.value.toFixed(2)}ms (threshold: ${check.threshold}ms) - ${status}`)
  })
}
