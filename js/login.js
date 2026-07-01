import { validateEmailForm, validatePasswordForm } from "../util/validation.js";  // validation.js에서 검증 함수 가져오기

// GPT로 생성한 HTML의 태그에 따라 querySelector로 요소를 선택
const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailHelper = document.querySelector("#emailHelper");
const passwordHelper = document.querySelector("#passwordHelper");
const loginButton = document.querySelector("#loginButton");
const signupButton = document.querySelector("#signupButton");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]{8,20}$/;


function validateEmail() {  //이메일 검증 로직
  const email = emailInput.value;
  emailHelper.textContent = "";

  emailHelper.textContent = validateEmailForm(email);

  if (emailHelper.textContent.length === 0) {
    return true;
  }
  return false;
}

function validatePassword() {
  const password = passwordInput.value;
  passwordHelper.textContent = "";
  
  passwordHelper.textContent = validatePasswordForm(password);

  if (passwordHelper.textContent.length === 0) {
    return true;
  }
  return false;
}

function updateLoginButton() {
  const email = emailInput.value
  const password = passwordInput.value;

  const isEmailAvailable = EMAIL_REGEX.test(email);
  const isPasswordAvailable = PASSWORD_REGEX.test(password);

  if (isEmailAvailable && isPasswordAvailable) {
    loginButton.disabled = false;
    loginButton.classList.add("is-active");
  } else {
    loginButton.disabled = true;
    loginButton.classList.remove("is-active");
  }
}

emailInput.addEventListener("blur", () => {
  validateEmail();
  updateLoginButton();
});

passwordInput.addEventListener("blur", () => {
  validatePassword();
  updateLoginButton();
});

emailInput.addEventListener("input", updateLoginButton);
passwordInput.addEventListener("input", updateLoginButton);


const login = async (event) => {
  event.preventDefault();

  const isEmailAvailable = validateEmail();
  const isPasswordAvailable = validatePassword();

  if (!isEmailAvailable || !isPasswordAvailable) {
    updateLoginButton();
    return;
  }

  const email = emailInput.value;       
  const password = passwordInput.value; // 사용자가 입력한 값으로 로그인 요청.
  try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {   //응답이 200번대가 아닌 경우 에러.
        throw new Error("LOGIN_FAILED");
      }

    window.location.href = "./pages/boards.html";
  } catch (error) {
    passwordHelper.textContent = "*아이디 또는 비밀번호를 확인해주세요";
  }
};

loginForm.addEventListener("submit", login);

signupButton.addEventListener("click", () => {
    window.location.href = "./pages/signup.html";
});