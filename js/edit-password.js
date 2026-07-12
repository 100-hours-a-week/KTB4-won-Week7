import { updatePassword } from "./api/user-api.js";

const profileButton = document.querySelector("#profileButton");

const editPasswordForm = document.querySelector("#editPasswordForm");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");

const passwordHelper = document.querySelector("#passwordHelper");
const passwordConfirmHelper = document.querySelector("#passwordConfirmHelper");

const submitButton = document.querySelector("#submitButton");
const toastMessage = document.querySelector("#toastMessage");

// 8자 이상 20자 이하, 대문자, 소문자, 숫자, 특수문자 각각 최소 1개
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{8,20}$/;

function validatePassword() {
  const password = passwordInput.value;

  if (password.length === 0) {
    passwordHelper.textContent = "*비밀번호를 입력해주세요";
    return false;
  }

  if (!PASSWORD_REGEX.test(password)) {
    passwordHelper.textContent =
      "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
    return false;
  }

  passwordHelper.textContent = "";
  return true;
}

function validatePasswordConfirm() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  if (passwordConfirm.length === 0) {
    passwordConfirmHelper.textContent = "*비밀번호를 한번 더 입력해주세요";
    return false;
  }

  if (password !== passwordConfirm) {
    passwordConfirmHelper.textContent = "*비밀번호와 다릅니다.";
    return false;
  }

  passwordConfirmHelper.textContent = "";
  return true;
}

function isFormValidWithoutHelperText() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  return (
    PASSWORD_REGEX.test(password) &&
    passwordConfirm.length > 0 &&
    password === passwordConfirm
  );
}

function updateSubmitButtonState() {
  if (isFormValidWithoutHelperText()) {
    submitButton.disabled = false;
    submitButton.classList.add("is-active");
  } else {
    submitButton.disabled = true;
    submitButton.classList.remove("is-active");
  }
}

function showToast() {
  toastMessage.classList.add("is-show");

  setTimeout(() => {
    toastMessage.classList.remove("is-show");
  }, 2000);
}

passwordInput.addEventListener("blur", () => {
  validatePassword();

  if (passwordConfirmInput.value.length > 0) {
    validatePasswordConfirm();
  }

  updateSubmitButtonState();
});

passwordConfirmInput.addEventListener("blur", () => {
  validatePasswordConfirm();
  updateSubmitButtonState();
});

passwordInput.addEventListener("input", updateSubmitButtonState);
passwordConfirmInput.addEventListener("input", updateSubmitButtonState);

editPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isPasswordValid = validatePassword();
  const isPasswordConfirmValid = validatePasswordConfirm();

  if (!isPasswordValid || !isPasswordConfirmValid) {
    updateSubmitButtonState();
    return;
  }

  try {
      submitButton.disabled = true;
      await updatePassword(passwordInput.value);

    showToast();

    passwordInput.value = "";
    passwordConfirmInput.value = "";
    updateSubmitButtonState();
  } catch (error) {
    console.error(error);
    alert("비밀번호 수정에 실패했습니다.");
  } finally {
    updateSubmitButtonState();
  }
});
