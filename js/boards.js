import { getBoards } from "./api/board-api.js";

const PAGE_SIZE = 8;

const writeButton = document.querySelector("#writeButton");
const boardList = document.querySelector("#boardList");
const boardCount = document.querySelector("#boardCount");
const loading = document.querySelector("#loading");
const tabs = document.querySelectorAll(".board-tab");

let currentPage = 0;
let currentFilter = "all";
let loadedCount = 0;
let hasNextPage = true;
let isFetching = false;
let requestVersion = 0; //비동기 요청 결과가 섞이지 않게 하기 위한 변수

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

const accidentTitles = [
  "비보호 좌회전 중 직진 차량과 충돌했습니다",
  "주차장 출차 차량과 접촉, 어느 쪽 과실일까요?",
  "차선 변경 중 후방 차량과 사고가 났습니다",
  "골목길 교행 중 사이드미러 접촉 사고",
  "교차로 꼬리물기 차량과 충돌했습니다",
  "우회전 중 횡단보도 앞 급정거 사고",
  "회전교차로 진입 차량과 접촉했습니다",
  "고속도로 합류 구간에서 발생한 사고",
];

const dummyBoards = Array.from({ length: 20 }, (_, index) => ({
  boardId: index + 1,
  title: accidentTitles[index % accidentTitles.length],
  content: "사고 당시 도로 상황과 양쪽 차량의 진행 방향을 확인하고 과실이 더 크다고 생각하는 쪽에 투표해 주세요.",
  commentCount: 3 + index * 2,
  viewCount: 180 + index * 137,
  voteCount: 25 + index * 31,
  nickname: ["안전운전", "초보운전자", "블루세단", "도로위질서"][index % 4],
  createdAt: index < 2 ? "방금 전" : `${index}시간 전`,
  isHot: index % 3 === 0,
}));

function normalizePage(response) {
  const data = response?.data ?? response ?? {};
  const boards = Array.isArray(data)
    ? data
    : data.content ?? data.boards ?? data.items ?? [];

  if (!Array.isArray(boards)) throw new Error("INVALID_BOARD_PAGE");

  const totalElements = data.totalElements ?? data.totalCount ?? data.total ?? null;
  const hasNext = typeof data.hasNext === "boolean"
    ? data.hasNext
    : typeof data.last === "boolean"
      ? !data.last
      : boards.length === PAGE_SIZE;

  return { boards, totalElements, hasNext };
}

function getDummyPage(page, hotOnly) {
  const filteredBoards = hotOnly ? dummyBoards.filter((board) => board.isHot) : dummyBoards;
  const start = page * PAGE_SIZE;
  const boards = filteredBoards.slice(start, start + PAGE_SIZE);
  return {
    boards,
    totalElements: filteredBoards.length,
    hasNext: start + PAGE_SIZE < filteredBoards.length,
  };
}

function createBoardMarkup(board) {
  const boardId = encodeURIComponent(String(board.boardId ?? ""));
  const isHot = board.isHot ?? board.hot ?? false;
  return `
    <article class="board-card ${isHot ? "board-card--hot" : ""}" data-board-id="${boardId}">
      <div class="board-card__thumb">${isHot ? '<span class="hot-badge">🔥 HOT</span>' : ""}</div>
      <div class="board-card__body">
        <h3 class="board-card__title">${escapeHtml(board.title)}</h3>
        <p class="board-card__summary">${escapeHtml(board.content ?? "사고 상황을 확인하고 과실이 더 크다고 생각하는 차량에 투표해 주세요.")}</p>
        <div class="board-card__meta">
          <span>🗳 ${Number(board.voteCount) || 0}</span>
          <span>💬 ${Number(board.commentCount) || 0}</span>
          <span>조회 ${Number(board.viewCount) || 0}</span>
        </div>
      </div>
      <div class="board-card__footer">
        <span class="board-card__author-image"></span>
        <span class="board-card__author-name">${escapeHtml(board.nickname ?? "익명")}</span>
        <time class="board-card__date">${escapeHtml(board.createdAt ?? "")}</time>
      </div>
    </article>`;
}

function appendBoards(boards) {
  boardList.querySelector(".board-empty")?.remove();
  boardList.insertAdjacentHTML("beforeend", boards.map(createBoardMarkup).join(""));
  loadedCount += boards.length;
}

function updateLoadingState() {
  loading.classList.toggle("is-active", isFetching);
  if (isFetching) {
    loading.textContent = "게시글을 불러오는 중...";
  } else if (!hasNextPage && loadedCount > 0) {
    loading.classList.add("is-complete");
    loading.textContent = "모든 게시글을 확인했습니다.";
  } else {
    loading.classList.remove("is-complete");
  }
}

async function fetchNextPage() {
  if (isFetching || !hasNextPage) return;

  isFetching = true;
  updateLoadingState();
  const versionAtRequest = requestVersion;
  const pageAtRequest = currentPage;
  const hotOnly = currentFilter === "hot";

  try {
    let pageData;
    try {
      const response = await getBoards({ page: pageAtRequest, size: PAGE_SIZE, hot: hotOnly });
      pageData = normalizePage(response);
    } catch (error) {
      console.error(error);
      pageData = getDummyPage(pageAtRequest, hotOnly);
    }

    if (versionAtRequest !== requestVersion) return;

    appendBoards(pageData.boards);
    currentPage += 1;
    hasNextPage = pageData.hasNext;
    boardCount.textContent = pageData.totalElements == null
      ? `${loadedCount}개의 사례를 불러왔습니다`
      : `총 ${pageData.totalElements}개의 사례`;

    if (loadedCount === 0) {
      boardList.innerHTML = '<p class="board-empty">표시할 게시글이 없습니다.</p>';
    }
  } finally {
    if (versionAtRequest === requestVersion) {
      isFetching = false;
      updateLoadingState();
    }
  }
}

function resetBoards(filter) {
  requestVersion += 1;
  currentFilter = filter;
  currentPage = 0;
  loadedCount = 0;
  hasNextPage = true;
  isFetching = false;
  boardList.innerHTML = "";
  boardCount.textContent = "";
  loading.classList.remove("is-complete");
  fetchNextPage();
}

const loadingObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) fetchNextPage();
}, { rootMargin: "300px 0px" });

loadingObserver.observe(loading);

tabs.forEach((tab) => tab.addEventListener("click", () => {
  tabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });
  resetBoards(tab.dataset.filter);
}));

boardList.addEventListener("click", (event) => {
  const card = event.target.closest(".board-card");
  if (card) window.location.href = `./board-detail.html?boardId=${card.dataset.boardId}`;
});

writeButton.addEventListener("click", () => {
  window.location.href = "./board-create.html";
});

fetchNextPage();
