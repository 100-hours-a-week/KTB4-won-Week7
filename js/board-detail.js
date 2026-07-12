import {formatCount, parseJwt, formatDateTime} from "../util/custom-utils.js";
import { deleteBoard, getBoard, getBoardComments } from "./api/board-api.js";
import { getAccessToken } from "./api/auth-session.js";

//각 HTML요소 맵핑
const boardTitle = document.querySelector("#boardTitle");
const boardAuthor = document.querySelector("#boardAuthor");
const boardDate = document.querySelector("#boardDate");
const boardContent = document.querySelector("#boardContent");
const viewCount = document.querySelector("#viewCount");

const backButton = document.querySelector("#backButton");
const profileButton = document.querySelector("#profileButton");

const editBoardButton = document.querySelector("#editBoardButton");
const deleteBoardButton = document.querySelector("#deleteBoardButton");

const boardDeleteModal = document.querySelector("#boardDeleteModal");
const cancelBoardDeleteButton = document.querySelector("#cancelBoardDeleteButton");
const confirmBoardDeleteButton = document.querySelector("#confirmBoardDeleteButton");

const likeButton = document.querySelector("#likeButton");
const likeCount = document.querySelector("#likeCount");

const commentTextarea = document.querySelector("#commentTextarea");
const commentSubmitButton = document.querySelector("#commentSubmitButton");
const commentList = document.querySelector("#commentList");
const commentCount = document.querySelector("#commentCount");

const commentDeleteModal = document.querySelector("#commentDeleteModal");
const cancelCommentDeleteButton = document.querySelector("#cancelCommentDeleteButton");
const confirmCommentDeleteButton = document.querySelector("#confirmCommentDeleteButton");

const params = new URLSearchParams(window.location.search);

let loginedUserId = null;

const boardId = params.get("boardId");

async function getBoardDetail(boardId){ //게시글 정보 가져오는 함수
  try {
    return await getBoard(boardId);
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

async function getComments(boardId){ //댓글 정보 가져오는 함수
  try {
    return await getBoardComments(boardId);
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

//더미 데이터 사용으로 인해 실제 데이터 가져오는 로직 주석처리.
//const boardDetail = await getBoardDetail(boardId);
//const comments = await getComments(boardId);

let boardDetail = null;
let comments = [];

let isLiked = false;
let likeValue = 0;

let editingCommentId = null;
let deletingCommentId = null;

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value ?? "");
  return element.innerHTML;
}

const voteButtons = document.querySelectorAll(".vote-option");
const voteGuide = document.querySelector("#voteGuide");
const voteTotal = document.querySelector("#voteTotal");
let hasVoted = false;
let voteA = 242;
let voteB = 114;

function renderVote() {
  const total = voteA + voteB;
  document.querySelector("#voteAPercent").textContent = `${Math.round(voteA / total * 100)}%`;
  document.querySelector("#voteBPercent").textContent = `${Math.round(voteB / total * 100)}%`;
  voteTotal.textContent = `총 ${total}명 참여`;
}

voteButtons.forEach(button => button.addEventListener("click", () => {
  if (hasVoted) return;
  hasVoted = true;
  if (button.dataset.vote === "A") voteA += 1; else voteB += 1;
  voteButtons.forEach(item => { item.classList.toggle("is-selected", item === button); item.classList.toggle("is-disabled", item !== button); item.disabled = true; });
  voteGuide.textContent = `${button.dataset.vote} 차량에 투표했습니다.`;
  renderVote();
}));

function renderBoardDetail(boardDetail) {
  boardTitle.textContent = boardDetail.title;
  boardAuthor.textContent = boardDetail.nickname ?? boardDetail.author ?? "익명";
  boardDate.textContent = boardDetail.createdAt;
  boardContent.textContent = boardDetail.content;

  likeValue = boardDetail.likeCount ?? 0;
  isLiked = boardDetail.isLiked ?? false;

  likeCount.textContent = formatCount(likeValue);
  viewCount.textContent = formatCount(boardDetail.viewCount ?? 0);
  commentCount.textContent = formatCount(comments.length);

  if (isLiked) {
    likeButton.classList.add("is-liked");
  } else {
    likeButton.classList.remove("is-liked");
  }

  const isBoardAuthor = Number(boardDetail.authorId) === loginedUserId;

  editBoardButton.hidden = !isBoardAuthor;
  deleteBoardButton.hidden = !isBoardAuthor;

}

function openModal(modal) { //HTML요소 조작으로 팝업창 열기/닫기 구현
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function updateCommentSubmitButton() {
  const hasText = commentTextarea.value.length > 0;

  if (hasText) {
    commentSubmitButton.disabled = false;
    commentSubmitButton.classList.add("is-active");
  } else {
    commentSubmitButton.disabled = true;
    commentSubmitButton.classList.remove("is-active");
  }
}

function renderComments() {
  commentList.innerHTML = "";

  comments.forEach((commentData) => {
    const commentItem = document.createElement("article");
    commentItem.className = "comment-item";
    commentItem.dataset.commentId = commentData.id;

    commentItem.innerHTML = `
      <div class="comment-item__image"></div>

      <div class="comment-item__body">
        <div class="comment-item__header">
          <strong class="comment-item__author">${escapeHtml(commentData.author ?? "익명")}</strong>
          <time class="comment-item__date">${escapeHtml(commentData.createdAt)}</time>
        </div>

        <p class="comment-item__content">${escapeHtml(commentData.content)}</p>
      </div>

      <div class="comment-item__actions">
        <button type="button" class="small-button comment-edit-button">수정</button>
        <button type="button" class="small-button comment-delete-button">삭제</button>
      </div>
    `;

    const editButton = commentItem.querySelector(".comment-edit-button");
    const deleteButton = commentItem.querySelector(".comment-delete-button");
    if(Number(commentData.authorId) === loginedUserId) {
      editButton.addEventListener("click", () => {
        editingCommentId = commentData.id;
        commentTextarea.value = commentData.content;
        commentSubmitButton.textContent = "댓글 수정";
        updateCommentSubmitButton();
        commentTextarea.focus();
      });

      deleteButton.addEventListener("click", () => {
        deletingCommentId = commentData.id;
        openModal(commentDeleteModal);
      });
    } else{
      editButton.style.display = "none";
      deleteButton.style.display = "none";
    }

    commentList.appendChild(commentItem);
  });
  commentCount.textContent = formatCount(comments.length);
}

likeButton.addEventListener("click", () => {
  isLiked = !isLiked;

  if (isLiked) {
    likeValue += 1;
    likeButton.classList.add("is-liked");
  } else {
    likeValue = Math.max(0, likeValue - 1);
    likeButton.classList.remove("is-liked");
  }

  likeCount.textContent = formatCount(likeValue);
});

commentTextarea.addEventListener("input", updateCommentSubmitButton);

commentSubmitButton.addEventListener("click", () => {
  const content = commentTextarea.value.trim();
  if (!content) return;

  if (editingCommentId) {
    comments = comments.map((comment) => {
      if (comment.id !== editingCommentId) return comment;

      return {
        ...comment,
        content,
      };
    });

    editingCommentId = null;
    commentSubmitButton.textContent = "댓글 등록";
  } else {
    const newComment = {
      id: Date.now(),
      authorId: loginedUserId, 
      author: "로그인한 사용자",
      createdAt: formatDateTime(Date.now()),
      content,
    };

    comments.unshift(newComment);
  }

  commentTextarea.value = "";
  updateCommentSubmitButton();
  renderComments();
});

backButton?.addEventListener("click", () => {
  window.location.href = "./boards.html";
});

editBoardButton.addEventListener("click", () => {
  window.location.href = `./board-edit.html?boardId=${encodeURIComponent(boardId ?? "")}`;
});

deleteBoardButton.addEventListener("click", () => {
  openModal(boardDeleteModal);
});

cancelBoardDeleteButton.addEventListener("click", () => {
  closeModal(boardDeleteModal);
});

confirmBoardDeleteButton.addEventListener("click", async () => {

    try{
      await deleteBoard(boardId);
    } catch (error) {
      console.error(error);
      alert("게시글 삭제에 실패했습니다.");
      return;
    }
 
  closeModal(boardDeleteModal);
  alert("게시글이 삭제되었습니다.");
  window.location.href = "./boards.html";
});

cancelCommentDeleteButton.addEventListener("click", () => {
  deletingCommentId = null;
  closeModal(commentDeleteModal);
});

confirmCommentDeleteButton.addEventListener("click", () => {
  comments = comments.filter((comment) => comment.id !== deletingCommentId);
  deletingCommentId = null;

  closeModal(commentDeleteModal);
  renderComments();
});

async function init() {
  if (!boardId) {
    renderVote();
    updateCommentSubmitButton();
    return;
  }

  const boardResponse = await getBoardDetail(boardId);
  const commentsResponse = await getComments(boardId);

  if (!boardResponse) {
    boardDetail = { title:"비보호 좌회전 중 직진 차량과 충돌했습니다", nickname:"안전운전", createdAt:"2026-07-11 14:20", content:"교차로에서 비보호 좌회전을 시작한 순간 맞은편에서 오던 직진 차량과 충돌했습니다.\n신호는 양쪽 모두 녹색이었고, 직진 차량이 제한속도보다 빠르게 주행한 것으로 보입니다. 사진과 상황을 확인한 뒤 어느 차량의 과실이 더 크다고 생각하는지 투표해 주세요.", likeCount:18, viewCount:1842, authorId:1 };
    comments = [{id:1,authorId:2,author:"도로전문가",createdAt:"2026-07-11 15:02",content:"기본적으로 직진 차량에 우선권이 있지만 속도와 진입 시점을 함께 봐야 할 것 같습니다."}];
    renderBoardDetail(boardDetail); renderComments(); updateCommentSubmitButton(); renderVote(); return;
  }

  boardDetail = boardResponse.data ?? boardResponse;
  comments = commentsResponse?.data ?? commentsResponse ?? [];
  const tokenPayload = parseJwt(getAccessToken());
  loginedUserId = Number(tokenPayload?.sub) || null;

  renderBoardDetail(boardDetail);
  renderComments();
  updateCommentSubmitButton();
  renderVote();
}

init();
