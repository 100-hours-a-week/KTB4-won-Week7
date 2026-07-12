export function formatCount(count) {
  const numericCount = Number(count);
  if (!Number.isFinite(numericCount)) return "0";
  if (numericCount >= 1000) {
    const compactCount = Math.floor(numericCount / 100) / 10;
    return `${Number.isInteger(compactCount) ? compactCount.toFixed(0) : compactCount}k`;
  }
  return String(Math.max(0, numericCount));
}

export function parseJwt(jwtToken) {
  if (typeof jwtToken !== "string") return null;
  const parts = jwtToken.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64Url.length / 4) * 4, "=");

    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map((char) => {
                return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );

    return JSON.parse(jsonPayload);
}

export function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
