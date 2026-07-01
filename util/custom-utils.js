export function formatCount(count) {
  if (count >= 100000) {
    return `${Math.floor(count / 1000)}k`;
  }

  if (count >= 10000) {
    return `${Math.floor(count / 1000)}k`;
  }

  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k`;
  }

  return String(count);
}

export function parseJwt(jwtToken) {
  const base64Url = jwtToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

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

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}