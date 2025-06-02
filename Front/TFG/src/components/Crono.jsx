function Crono() {
  const [currentTime, setCurrentTime] = React.useState("--");

  function updateTime() {
   const date = new Date();
   const hours = date.getHours().toString().padStart(2, '0');
   const minutes = date.getMinutes().toString().padStart(2, '0');
   const seconds = date.getSeconds().toString().padStart(2, '0');

   const formattedTime = `${hours}:${minutes}:${seconds}`;
   setCurrentTime(formattedTime);
  }

  React.useEffect(() => {
   setInterval(() => updateTime(), 1000);
  }, []);

  return (
   <div className="current-time">
     <h1>Current time: {currentTime}</h1>
   </div>
  );
}

export default Crono;