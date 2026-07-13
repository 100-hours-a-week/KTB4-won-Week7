import { createBoard } from "./api/board-api.js";

const backButton = document.querySelector("#backButton");
const profileButton = document.querySelector("#profileButton");

const boardCreateForm = document.querySelector("#boardCreateForm");
const titleInput = document.querySelector("#title");
const contentTextarea = document.querySelector("#content");
const imageInput = document.querySelector("#imageInput");
const fileName = document.querySelector("#fileName");
const formHelper = document.querySelector("#formHelper");
const submitButton = document.querySelector("#submitButton");
const voteEnabledInput = document.querySelector("#voteEnabled");
const voteFields = document.querySelector("#voteFields");
const voteQuestionInput = document.querySelector("#voteQuestion");
const voteOptionAInput = document.querySelector("#voteOptionA");
const voteOptionBInput = document.querySelector("#voteOptionB");
const voteHelper = document.querySelector("#voteHelper");

let selectedImage = null;

function isFormFilled() {
  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();
  const isVoteFilled = !voteEnabledInput.checked || (
    voteQuestionInput.value.trim().length > 0 &&
    voteOptionAInput.value.trim().length > 0 &&
    voteOptionBInput.value.trim().length > 0
  );

  return title.length > 0 && content.length > 0 && isVoteFilled;
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

  if (voteEnabledInput.checked && (
    !voteQuestionInput.value.trim() ||
    !voteOptionAInput.value.trim() ||
    !voteOptionBInput.value.trim()
  )) {
    voteHelper.textContent = "*투표 질문과 두 선택지를 모두 작성해주세요.";
    return false;
  }

  formHelper.textContent = "";
  voteHelper.textContent = "";
  return true;
}

titleInput.addEventListener("input", () => {
  if (titleInput.value.length > 26) {
    titleInput.value = titleInput.value.slice(0, 26);
  }

  updateSubmitButtonState();
});

contentTextarea.addEventListener("input", updateSubmitButtonState);

voteEnabledInput.addEventListener("change", () => {
  const isEnabled = voteEnabledInput.checked;
  voteFields.hidden = !isEnabled;
  [voteQuestionInput, voteOptionAInput, voteOptionBInput].forEach((input) => {
    input.disabled = !isEnabled;
  });
  voteHelper.textContent = "";
  updateSubmitButtonState();
  if (isEnabled) voteQuestionInput.focus();
});

[voteQuestionInput, voteOptionAInput, voteOptionBInput].forEach((input) => {
  input.addEventListener("input", updateSubmitButtonState);
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (!file) {
    selectedImage = null;
    fileName.textContent = "파일을 선택해주세요.";
    return;
  }

  selectedImage = file;
  fileName.textContent = file.name;
});

boardCreateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    updateSubmitButtonState();
    return;
  }

  try {
      submitButton.disabled = true;
      await createBoard({
          title: titleInput.value.trim(),
          content: contentTextarea.value.trim(),
          image: selectedImage ? selectedImage.name : null,
          voteEnabled: voteEnabledInput.checked,
          voteQuestion: voteEnabledInput.checked ? voteQuestionInput.value.trim() : null,
          voteOptionA: voteEnabledInput.checked ? voteOptionAInput.value.trim() : null,
          voteOptionB: voteEnabledInput.checked ? voteOptionBInput.value.trim() : null
      });

    alert("게시글이 등록되었습니다.");
    window.location.href = "./boards.html";
  } catch (error) {
    console.error(error);
    alert("게시글 등록에 실패했습니다.");
    updateSubmitButtonState();
  }
});

backButton.addEventListener("click", () => {
  window.location.href = "./boards.html";
});

profileButton?.addEventListener("click", () => { window.location.href = "./edit-profile.html"; });
