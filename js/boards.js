const writeButton = document.querySelector("#writeButton");

  writeButton.addEventListener("click", () => {
    window.location.href = "./board-create.html";
  });

  loadBoards(); //호이스팅 가능

async function loadBoards() {
  const boardList = document.querySelector("#boardList");
  const loading = document.querySelector("#loading");

  try {
    const response = await fetch("http://localhost:8080/boards");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "게시글 조회 실패");
    }

    renderBoards(data.data);
  } catch (error) {
    console.error(error);
    renderBoards(dummyBoard);
  }
}


const dummyBoard = [{
  boardId: 0,
  title: "더미 게시글",
  likeCount: 0,
  commentCount: 0,
  viewCount: 0,
  nickname: "익명",
  createdAt: new Date().toLocaleDateString()
},
{
  boardId: 1,
  title: "더미 게시글 2",
  likeCount: 5,
  commentCount: 2,
  viewCount: 10,
  nickname: "사용자1",
  createdAt: new Date().toLocaleDateString()
}
];


function renderBoards(boards) { //게시물 목록 렌더링
  const boardList = document.querySelector("#boardList");

  if (!boards || boards.length === 0) {
    boardList.innerHTML = `<p>게시글이 없습니다.</p>`;
    return;
  }

  boardList.innerHTML = boards
    .map(
      (board) => `
        <article class="board-card" data-board-id="${board.boardId}">
          <div class="board-card__body">
            <div class="board-card__top">
              <h2 class="board-card__title">${board.title}</h2>
              <span class="board-card__date">${board.createdAt ?? ""}</span>
            </div>

            <div class="board-card__meta">
              <span>좋아요 ${board.likeCount ?? 0}</span>
              <span>댓글 ${board.commentCount ?? 0}</span>
              <span>조회수 ${board.viewCount ?? 0}</span>
            </div>
          </div>

          <div class="board-card__footer">
            <span class="board-card__author-image"></span>
            <span class="board-card__author-name">${board.nickname ?? "익명"}</span>
          </div>
        </article>
      `
    )
    .join("");

  boardList.addEventListener("click", (event) => {
    const boardCard = event.target.closest(".board-card");

    if (!boardCard) {
      return;
    }

    const boardId = boardCard.dataset.boardId;
    window.location.href = `./board-detail.html?boardId=${boardId}`;
  });
}