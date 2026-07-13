import { request } from "./api-client.js";

export const getBoards = ({ page = 0, size = 8, hot = false } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (hot) params.set("hot", "true");
  return request(`/boards?${params.toString()}`, { auth: true });
};
export const getBoard = (boardId) => request(`/boards/${encodeURIComponent(boardId)}`, { auth: true });
export const getBoardComments = (boardId) => request(`/boards/${encodeURIComponent(boardId)}/comments`, { auth: true });
export const createBoard = (boardData) => request("/api/boards", { method: "POST", body: boardData, auth: true });
export const updateBoard = (boardId, boardData) => request(`/api/boards/${encodeURIComponent(boardId)}`, { method: "PATCH", body: boardData, auth: true });
export const deleteBoard = (boardId) => request(`/boards/${encodeURIComponent(boardId)}`, { method: "DELETE", auth: true });
