import { updateBoard } from "./api/board-api.js";

const backButton = document.querySelector("#backButton");
const profileButton = document.querySelector("#profileButton");

const boardEditForm = document.querySelector("#boardEditForm");
const titleInput = document.querySelector("#title");
const contentTextarea = document.querySelector("#content");
const imageInput = document.querySelector("#imageInput");
const fileName = document.querySelector("#fileName");
const formHelper = document.querySelector("#formHelper");
const submitButton = document.querySelector("#submitButton");

let selectedImage = null;

function getBoardIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("boardId") ?? params.get("id");
}

function isFormFilled() {
  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();

  return title.length > 0 && content.length > 0;
}

function updateSubmitButtonState() {
  if (isFormFilled()) {
    submitButton.disabled = false;
    submitButton.classList.add("is-active");
    formHelper.textContent = "";
  } else {
    submitButton.disabled = true;
    submitButton.classList.remove("is-active");
  }
}

function validateForm() {
  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();

  if (title.length === 0 || content.length === 0) {
    formHelper.textContent = "*제목, 내용을 모두 작성해주세요";
    return false;
  }

  formHelper.textContent = "";
  return true;
}

titleInput.addEventListener("input", () => {
  if (titleInput.value.length > 26) {
    titleInput.value = titleInput.value.slice(0, 26);
  }

  updateSubmitButtonState();
});

contentTextarea.addEventListener("input", updateSubmitButtonState);

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (!file) {
    selectedImage = null;
    fileName.textContent = "기존 파일 명";
    return;
  }

  selectedImage = file;
  fileName.textContent = file.name;
});

boardEditForm.addEventListener("submit", async (event) => {
  event.preventDefault(); //폼 제출 시 페이지 새로고침 방지

  if (!validateForm()) {
    updateSubmitButtonState();
    return;
  }

  const boardId = getBoardIdFromUrl();

  if (!boardId) {
    formHelper.textContent = "*수정할 게시글 ID가 없습니다.";
    return;
  }

  try {
      submitButton.disabled = true;
      await updateBoard(boardId, {
          title: titleInput.value.trim(),
          content: contentTextarea.value.trim(),
          image: selectedImage ? selectedImage.name : null
      });

    alert("게시글이 수정되었습니다.");

    if (boardId) {
      window.location.href = `./board-detail.html?boardId=${boardId}`;
    } else {
      window.location.href = "./board-detail.html";
    }
  } catch (error) {
    console.error(error);
    alert("게시글 수정에 실패했습니다.");
    updateSubmitButtonState();
  }
});

backButton.addEventListener("click", () => {
  const boardId = getBoardIdFromUrl();

  if (boardId) {
    window.location.href = `./board-detail.html?boardId=${boardId}`;
  } else {
    window.location.href = "./board-detail.html";
  }
});

profileButton?.addEventListener("click", () => { window.location.href = "./edit-profile.html"; });

updateSubmitButtonState();
