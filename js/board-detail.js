import {formatCount, parseJwt, formatDateTime} from "../util/custom-utils.js";

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

//accessToken에서 userId 추출
const accessToken = localStorage.getItem("accessToken");
const payLoad = parseJwt(accessToken);
const loginedUserId = Number(payLoad.sub);

const boardId = params.get("boardId");

async function getBoardDetail(boardId){ //게시글 정보 가져오는 함수
  try {
    const response = await fetch(`http://localhost:8080/boards/${boardId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "게시글 조회 실패");
    }
    return data;
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

async function getComments(boardId){ //댓글 정보 가져오는 함수
  try {
    const response = await fetch(`http://localhost:8080/boards/${boardId}/comments`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "댓글 조회 실패");
    }
    return data;
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

//더미 데이터 사용으로 인해 실제 데이터 가져오는 로직 주석처리.
//const boardDetail = await getBoardDetail(boardId);
//const comments = await getComments(boardId);

/* id가 1인 더미 jwt 토큰. 수정/삭제 등 작성자만 가능한지 확인 위함
localStorage.setItem(
    "accessToken",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6IlVTRVIiLCJpYXQiOjAsImV4cCI6NDEwMjQ0NDgwMH0.dummy-signature"
);
*/

let boardDetail = null;
let comments = [];

let isLiked = false;
let likeValue = 0;

let editingCommentId = null;
let deletingCommentId = null;

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
          <strong class="comment-item__author">${commentData.author}</strong>
          <time class="comment-item__date">${commentData.createdAt}</time>
        </div>

        <p class="comment-item__content">${commentData.content}</p>
      </div>

      <div class="comment-item__actions">
        <button type="button" class="small-button comment-edit-button">수정</button>
        <button type="button" class="small-button comment-delete-button">삭제</button>
      </div>
    `;

    const editButton = commentItem.querySelector(".comment-edit-button");
    const deleteButton = commentItem.querySelector(".comment-delete-button");
    if(commentData.authorId === loginedUserId) {
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

}

likeButton.addEventListener("click", () => {
  isLiked = !isLiked;

  if (isLiked) {
    likeValue += 1;
    likeButton.classList.add("is-liked");
  } else {
    likeValue -= 1;
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
  window.location.href = "./board-edit.html";
});

deleteBoardButton.addEventListener("click", () => {
  openModal(boardDeleteModal);
});

cancelBoardDeleteButton.addEventListener("click", () => {
  closeModal(boardDeleteModal);
});

confirmBoardDeleteButton.addEventListener("click", async () => {

    try{
      await fetch(`http://localhost:8080/boards/${boardId}`, {
      method: "DELETE",
      credentials: "include",
      });
    } catch (error) {
      console.error(error);
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
    alert("게시글 ID가 없습니다.");
    window.location.href = "./boards.html";
    return;
  }

  const boardResponse = await getBoardDetail(boardId);
  const commentsResponse = await getComments(boardId);

  if (!boardResponse) {
    // alert("게시글을 불러오지 못했습니다.");
    // window.location.href = "./boards.html";
    return;
  }

  boardDetail = boardResponse.data ?? boardResponse;
  comments = commentsResponse?.data ?? commentsResponse ?? [];

  renderBoardDetail(boardDetail);
  renderComments();
  updateCommentSubmitButton();
}

init();