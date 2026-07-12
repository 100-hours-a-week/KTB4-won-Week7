import { request } from "./api-client.js";

export const getBoards = () => request("/boards", { auth: true });
export const getBoard = (boardId) => request(`/boards/${encodeURIComponent(boardId)}`, { auth: true });
export const getBoardComments = (boardId) => request(`/boards/${encodeURIComponent(boardId)}/comments`, { auth: true });
export const createBoard = (boardData) => request("/api/boards", { method: "POST", body: boardData, auth: true });
export const updateBoard = (boardId, boardData) => request(`/api/boards/${encodeURIComponent(boardId)}`, { method: "PATCH", body: boardData, auth: true });
export const deleteBoard = (boardId) => request(`/boards/${encodeURIComponent(boardId)}`, { method: "DELETE", auth: true });
