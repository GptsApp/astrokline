const apiKey = 'creem_test_6cQdpe8WFbURVs4mt78CCt';
const baseUrl = 'https://test-api.creem.io/v1';

async function main() {
  const url = `${baseUrl}/products`; // trying to list products
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log('Products:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
