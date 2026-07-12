import { validateEmailForm, validateNicknameForm, validatePasswordForm, validatePasswordConfirmForm } from "../util/validation.js";
import { checkEmailAvailability, checkNicknameAvailability, signupUser } from "./api/user-api.js";

const backButton = document.querySelector("#backButton");
const signupForm = document.querySelector("#signupForm");

const profileImageInput = document.querySelector("#profileImageInput");
const profileUploader = document.querySelector("#profileUploader");
const profilePreview = document.querySelector("#profilePreview");
const profileHelper = document.querySelector("#profileHelper");

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");
const nicknameInput = document.querySelector("#nickname");

const emailHelper = document.querySelector("#emailHelper");
const passwordHelper = document.querySelector("#passwordHelper");
const passwordConfirmHelper = document.querySelector("#passwordConfirmHelper");
const nicknameHelper = document.querySelector("#nicknameHelper");

const signupButton = document.querySelector("#signupButton");
const loginLinkButton = document.querySelector("#loginLinkButton");

let selectedProfileImage = null;  //프로필 이미지 재설정이 가능
let profilePreviewUrl = null;

function validateProfile() {
  if (!selectedProfileImage) {
    profileHelper.textContent = "*프로필 사진을 추가해주세요.";
    return false;
  }

  profileHelper.textContent = "";
  return true;
}

async function validateEmail() {
  const email = emailInput.value;
  emailHelper.textContent = "";
  emailHelper.textContent = validateEmailForm(email);
  if(emailHelper.textContent.length === 0){ //불필요한 서버 요청을 줄이기 위해 이메일 형식이 올바른 경우에만 서버 요청
    try{
    //백엔드 연결 후 중복 이메일 검사
    const data = await checkEmailAvailability(email);
    
    emailHelper.textContent = data.available === true ? "" : `*중복된 이메일입니다.`;
    
    } catch(error){
      console.error(error);
      emailHelper.textContent = "*이메일 중복 확인에 실패했습니다.";
    }
  }
  if(emailHelper.textContent.length === 0){
    return true;
  }

  return false;
}

function validatePassword() {
  const password = passwordInput.value;
  passwordHelper.textContent = "";
  passwordHelper.textContent = validatePasswordForm(password);

  if(passwordHelper.textContent.length === 0){
    return true;
  }
  return false;
}

function validatePasswordConfirm() {
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  passwordConfirmHelper.textContent = "";
  passwordConfirmHelper.textContent = validatePasswordConfirmForm(password, passwordConfirm);

  if(passwordConfirmHelper.textContent.length === 0){
    return true;
  }
  return false;
}

async function validateNickname() {
  const nickname = nicknameInput.value;

  nicknameHelper.textContent = validateNicknameForm(nickname);

  if(nicknameHelper.textContent.length === 0){  //불필요한 서버 요청을 줄이기 위해 닉네임 형식이 올바른 경우에만 서버 요청
      try{
      //백엔드 연결 후 중복 닉네임 검사
      const data = await checkNicknameAvailability(nickname);
      
      nicknameHelper.textContent = data.available === true ? "" : `*중복된 닉네임입니다.`;
      
    
    } catch(error){
      console.error(error);
      nicknameHelper.textContent = "*닉네임 중복 확인에 실패했습니다.";
    }
  }
  if(nicknameHelper.textContent.length === 0){
    return true;
  }
  return false;
}

function isFormAvailable() {
  const email = emailInput.value;
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;
  const nickname = nicknameInput.value;

  //ESM으로 import한 validation.js의 함수들을 사용하여 유효성 검사
  const isProfileAvailable = selectedProfileImage !== null;
  const isEmailAvailable = validateEmailForm(email).length === 0;
  const isPasswordAvailable = validatePasswordForm(password).length === 0;
  const isPasswordConfirmAvailable = validatePasswordConfirmForm(password, passwordConfirm).length === 0;
  const isNicknameAvailable = validateNicknameForm(nickname).length === 0;

  return (
    isProfileAvailable &&
    isEmailAvailable &&
    isPasswordAvailable &&
    isPasswordConfirmAvailable &&
    isNicknameAvailable
  );
}
//회원가입 버튼 활성화/비활성화 함수
function updateSignupButtonState() {
  if (isFormAvailable()) {
    signupButton.disabled = false;
    signupButton.classList.add("is-active");
  } else {
    signupButton.disabled = true;
    signupButton.classList.remove("is-active");
  }
}

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];
  if (profilePreviewUrl) {
    URL.revokeObjectURL(profilePreviewUrl);
    profilePreviewUrl = null;
  }
  
  if (!file) {
    selectedProfileImage = null;
    profilePreview.removeAttribute("src");
    profileUploader.classList.remove("has-image");
    updateSignupButtonState();
    return;
  }
  
  selectedProfileImage = file;

  profilePreviewUrl = URL.createObjectURL(file);
  profilePreview.src = profilePreviewUrl;
  profileUploader.classList.add("has-image");

  validateProfile();
  updateSignupButtonState();
});

emailInput.addEventListener("blur", async () => {
  await validateEmail();
  updateSignupButtonState();
});

passwordInput.addEventListener("blur", () => {
  validatePassword();

  if (passwordConfirmInput.value.length > 0) {
    validatePasswordConfirm();
  }

  updateSignupButtonState();
});

passwordConfirmInput.addEventListener("blur", () => {
  validatePasswordConfirm();
  updateSignupButtonState();
});

nicknameInput.addEventListener("blur", async () => {
  await validateNickname();
  updateSignupButtonState();
});

emailInput.addEventListener("input", updateSignupButtonState);
passwordInput.addEventListener("input", updateSignupButtonState);
passwordConfirmInput.addEventListener("input", updateSignupButtonState);
nicknameInput.addEventListener("input", updateSignupButtonState);

const signup = async (event) => {
  event.preventDefault();

  const isProfileAvailable = validateProfile();
  const isEmailAvailable = await validateEmail();
  const isPasswordAvailable = validatePassword();
  const isPasswordConfirmAvailable = validatePasswordConfirm();
  const isNicknameAvailable = await validateNickname();

  if (
    !isProfileAvailable ||
    !isEmailAvailable ||
    !isPasswordAvailable ||
    !isPasswordConfirmAvailable ||
    !isNicknameAvailable
  ) {
    updateSignupButtonState();
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;
  const nickname = nicknameInput.value;
  const profileImage = selectedProfileImage?.name ?? null;

  try {
    await signupUser({ email, password, nickname, profileImage });

    alert("회원가입이 완료되었습니다.");
    window.location.href = "../index.html";   //로그인 화면으로 리다이렉션
  } catch (error) {
    console.error(error);
    alert("회원가입에 실패했습니다.");
  }
}


signupForm.addEventListener("submit", signup);

backButton.addEventListener("click", () => {
  window.location.href = "../index.html";
});

loginLinkButton.addEventListener("click", () => {
  window.location.href = "../index.html";
});
