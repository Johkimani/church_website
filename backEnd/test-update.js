import fs from 'fs';

async function testUpdate() {
  const fd = new FormData();
  fd.append('name', 'Ruth Updated');
  
  // Create a dummy image
  fs.writeFileSync('dummy.jpg', 'fake image data');
  const buffer = fs.readFileSync('dummy.jpg');
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  fd.append('photo', blob, 'photo.jpg');

  try {
    const res = await fetch('http://127.0.0.1:3001/api/v1/officials/28', {
      method: 'PUT',
      body: fd
    });
    const data = await res.json();
    console.log("Update Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testUpdate();
