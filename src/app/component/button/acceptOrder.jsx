import { useEffect, useState } from "react";

const AcceptOrder = ({ createdAt, handleAccept }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const createdTime = new Date(createdAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = 60000 - (now - createdTime); // 60 detik

      if (diff <= 0) {
        setSecondsLeft(0);
        setIsEnabled(true); // enable button
        clearInterval(interval); // hentikan interval
      } else {
        setSecondsLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <button
      disabled={!isEnabled}
      onClick={handleAccept}
      className={`${
        isEnabled
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gray-400 cursor-not-allowed"
      } flex gap-4 justify-center text-white text-sm rounded-lg py-2 w-full transition-colors duration-300 mt-2`}
    >
      {isEnabled ? "Accept" : `Accept (${secondsLeft}s)`}
    </button>
  );
};

export default AcceptOrder;
