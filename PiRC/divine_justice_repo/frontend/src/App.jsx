import { useState } from "react";

export default function App() {
  const [result, setResult] = useState(null);

  const calculate = async () => {
    try {
      const res = await fetch("http://localhost:3000/inheritance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          religion: "islam",
          estate: 1000,
          heirs: [
            { type: "wife" },
            { type: "son" },
            { type: "daughter" }
          ]
        })
      });
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateZakat = async () => {
    try {
      const res = await fetch("http://localhost:3000/zakat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cash: 1000, gold: 500, investments: 300, debts: 100 })
      });
      const data = await res.json();
      alert("Zakat: " + data.zakat);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Divine Justice Dashboard</h1>
      <button onClick={calculate} style={{marginRight: 10}}>Calculate Inheritance</button>
      <button onClick={calculateZakat}>Calculate Zakat</button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}\n