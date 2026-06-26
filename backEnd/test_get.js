import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/jumuiya-members?jumuiya_id=727990e6-6bb2-44b6-9a9d-4acee5fe3d7e');
    console.log('Success:', res.data.success);
    console.log('Members Count:', res.data.data.length);
    console.log('Sample member:', res.data.data[0]);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}
test();
