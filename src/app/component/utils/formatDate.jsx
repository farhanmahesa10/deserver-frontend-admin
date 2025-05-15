export const FormatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "-";

  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(parsedDate);

  const getPart = (type) => parts.find((p) => p.type === type)?.value || "";

  const weekday = getPart("weekday");
  const month = getPart("month");
  const day = getPart("day");
  const year = getPart("year");

  return `${weekday}, ${month} ${day} ${year}`;
};

export const FormatDateAndTime = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "-";

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  };

  // Dapatkan komponen secara manual
  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(
    parsedDate
  );
  const getPart = (type) => parts.find((p) => p.type === type)?.value || "";

  const weekday = getPart("weekday");
  const month = getPart("month");
  const day = getPart("day");
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");

  return `${weekday}, ${month} ${day} ${year}, ${hour}:${minute}`;
};
