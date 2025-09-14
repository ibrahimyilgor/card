import React, { useEffect, useState } from 'react';

function App() {
  const [result, setResult] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
    const backendUrl = window.location.protocol + '//' + window.location.hostname + ':5000';
    console.log('Backend URL:', backendUrl);
    const res = await fetch(`${backendUrl}/items`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    setResult(data.items || []);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Items</h2>
      {result.map(item => (
        <div key={item.id} style={{ marginTop: 16 }}>
          {item && <b>Item {item.id}: {item.name}</b>}
        </div>
      ))}
    </div>
  );
}

export default App;
