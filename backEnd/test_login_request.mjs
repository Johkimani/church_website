(async () => {
  try {
    const res = await fetch('http://localhost:3001/api/v1/authentication/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userReg: 'PAUL_ONSONGO', password: 'Admin@123' }),
    });
    const data = await res.text();
    console.log('status', res.status);
    console.log('body', data);
  } catch (err) {
    console.error(err);
  }
})();
