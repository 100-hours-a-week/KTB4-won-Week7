const backButton = document.querySelector("#backButton");
const profileButton = document.querySelector("#profileButton");

const boardCreateForm = document.querySelector("#boardCreateForm");
const titleInput = document.querySelector("#title");
const contentTextarea = document.querySelector("#content");
const imageInput = document.querySelector("#imageInput");
const fileName = document.querySelector("#fileName");
const formHelper = document.querySelector("#formHelper");
const submitButton = document.querySelector("#submitButton");

let selectedImage = null;

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

  const formData = new FormData();
  formData.append("title", titleInput.value.trim());
  formData.append("content", contentTextarea.value.trim());

  if (selectedImage) {
    formData.append("image", selectedImage);
  }

  try {
    /*
      백엔드 API 연동 시 예시

      const response = await fetch("http://localhost:8080/api/boards", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("BOARD_CREATE_FAILED");
      }
    */

    alert("게시글이 등록되었습니다.");
    window.location.href = "./boards.html";
  } catch (error) {
    alert("게시글 등록에 실패했습니다.");
  }
});

backButton.addEventListener("click", () => {
  window.location.href = "./boards.html";
});

profileButton.addEventListener("click", () => {
  window.location.href = "./profile.html";
});