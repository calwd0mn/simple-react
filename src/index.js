import React, { useCallback, useMemo, useState } from "./react";
import ReactDOM from "./react-dom";

const Child = React.memo(function Child({ props, handleClick }) {
  console.log("Child component rendering");
  return <button onClick={handleClick}>Increase Age</button>;
});

function App() {
  console.log("App component rendering");
  const [name, setName] = useState("Simple React");
  const [age, setAge] = useState(18);
  const data = useMemo(() => ({ age }), [age]);
  const handleClick = useCallback(() => {
    setAge(age + 1);
  }, [age]);
  return (
    <div>
      <input value={name} onInput={(e) => setName(e.target.value)} />
      <Child data={data} handleClick={handleClick} />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
