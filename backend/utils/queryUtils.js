exports.splitCSV = function (str) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  return str
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

exports.toNumber = function (v) {
  const n = Number(v);
  return Number.isNaN(n) ? NaN : n;
};

exports.toDate = function (v) {
  if (!v) return null;
  // accept ISO or timestamp or common formats; try Date.parse
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d;
};
