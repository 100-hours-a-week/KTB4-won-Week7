import { getBoards } from "./api/board-api.js";

const writeButton = document.querySelector("#writeButton");
const boardList = document.querySelector("#boardList");
const boardCount = document.querySelector("#boardCount");
const tabs = document.querySelectorAll(".board-tab");
let allBoards = [];

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

writeButton.addEventListener("click", () => { window.location.href = "./board-create.html"; });

const dummyBoard = [
  { boardId: 1, title: "비보호 좌회전 중 직진 차량과 충돌했습니다", content: "교차로에서 좌회전을 시작한 순간 맞은편 직진 차량과 충돌한 사고입니다.", commentCount: 24, viewCount: 1842, voteCount: 356, nickname: "안전운전", createdAt: "방금 전", isHot: true },
  { boardId: 2, title: "주차장 출차 차량과 접촉, 어느 쪽 과실일까요?", content: "지하주차장 통로를 주행하던 중 주차 구역에서 나오던 차량과 접촉했습니다.", commentCount: 8, viewCount: 531, voteCount: 97, nickname: "초보운전자", createdAt: "1시간 전", isHot: false },
  { boardId: 3, title: "차선 변경 중 후방 차량과 사고가 났습니다", content: "방향지시등을 켠 뒤 차선을 변경했지만 후방 차량이 속도를 줄이지 않았습니다.", commentCount: 31, viewCount: 2204, voteCount: 482, nickname: "블루세단", createdAt: "3시간 전", isHot: true },
  { boardId: 4, title: "골목길 교행 중 사이드미러 접촉 사고", content: "양쪽 모두 서행 중이었고 도로 중앙선이 없는 좁은 골목입니다.", commentCount: 5, viewCount: 284, voteCount: 41, nickname: "도로위질서", createdAt: "어제", isHot: false }
];

function renderBoards(boards) {
  boardCount.textContent = `총 ${boards.length}개의 사례`;
  if (!boards.length) { boardList.innerHTML = '<p class="board-empty">표시할 게시글이 없습니다.</p>'; return; }
  boardList.innerHTML = boards.map(board => `
    <article class="board-card ${board.isHot ? "board-card--hot" : ""}" data-board-id="${board.boardId}">
      <div class="board-card__thumb">${board.isHot ? '<span class="hot-badge">🔥 HOT</span>' : ""}</div>
      <div class="board-card__body">
        <h3 class="board-card__title">${escapeHtml(board.title)}</h3>
        <p class="board-card__summary">${escapeHtml(board.content ?? "사고 상황을 확인하고 과실이 더 크다고 생각하는 차량에 투표해 주세요.")}</p>
        <div class="board-card__meta"><span>🗳 ${board.voteCount ?? 0}</span><span>💬 ${board.commentCount ?? 0}</span><span>조회 ${board.viewCount ?? 0}</span></div>
      </div>
      <div class="board-card__footer"><span class="board-card__author-image"></span><span class="board-card__author-name">${escapeHtml(board.nickname ?? "익명")}</span><time class="board-card__date">${escapeHtml(board.createdAt ?? "")}</time></div>
    </article>`).join("");
}

tabs.forEach(tab => tab.addEventListener("click", () => {
  tabs.forEach(item => item.classList.toggle("is-active", item === tab));
  renderBoards(tab.dataset.filter === "hot" ? allBoards.filter(board => board.isHot) : allBoards);
}));
boardList.addEventListener("click", event => { const card = event.target.closest(".board-card"); if (card) window.location.href = `./board-detail.html?boardId=${card.dataset.boardId}`; });

async function loadBoards() {
  try {
    const data = await getBoards();
    const boards = data.data ?? data;
    if (!Array.isArray(boards)) throw new Error("INVALID_BOARD_LIST");
    allBoards = boards.map(board => ({ ...board, isHot: board.isHot ?? board.hot ?? false }));
  } catch (error) { console.error(error); allBoards = dummyBoard; }
  renderBoards(allBoards);
}
loadBoards();
