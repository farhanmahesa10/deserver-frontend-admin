export const HighlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi"); // Cari query (case-insensitive)
  const parts = text.split(regex); // Pisah teks berdasarkan query

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-green-500">
        {part}
      </span>
    ) : (
      part
    )
  );
};
