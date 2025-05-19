import { useEffect, useRef, useState } from "react";

const AcceptOrder = ({ createdAt, status, handleAccept }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const hasAcceptedRef = useRef(false); // agar handleAccept hanya dipanggil sekali

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = 60000 - (Date.now() - new Date(createdAt).getTime());
      const seconds = Math.max(Math.floor(diff / 1000), 0);
      setSecondsLeft(seconds);

      if (seconds === 0 && !hasAcceptedRef.current) {
        hasAcceptedRef.current = true;
        handleAccept(); // Auto-accept saat waktu habis
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup saat komponen unmount
  }, [createdAt, handleAccept]);

  // const isCancelable =
  //   Date.now() - new Date(createdAt).getTime() < 60000 && status !== "failed";
  const disabled = Date.now() - new Date(createdAt).getTime() > 10000;

  // if (!isCancelable) return null;

  return (
    <button
      disabled={!disabled}
      onClick={handleAccept}
      className={`${
        disabled
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gray-400 cursor-not-allowed"
      } flex gap-4 justify-center text-white text-sm rounded-lg py-2 w-full transition-colors duration-300 mt-2`}
    >
      Accept ({secondsLeft}s)
    </button>
  );
};

export default AcceptOrder;
