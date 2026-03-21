const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/astrology/natal-chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: 1990,
        month: 1,
        day: 1,
        timeSlot: '12:00-13:00',
        timezone: -8,
        latitude: 34.05,
        longitude: -118.24,
      }),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
}
test();
