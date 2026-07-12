import { validateNicknameForm } from "../util/validation.js";
import { checkNicknameAvailability, getUserProfile, logoutUser, updateUserProfile, withdrawUser } from "./api/user-api.js";

const emailText = document.querySelector("#emailText");

const profileButton = document.querySelector("#profileButton");
const profileDropdown = document.querySelector("#profileDropdown");

const editProfileMenu = document.querySelector("#editProfileMenu");
const editPasswordMenu = document.querySelector("#editPasswordMenu");
const logoutMenu = document.querySelector("#logoutMenu");

const editProfileForm = document.querySelector("#editProfileForm");
const profileImageInput = document.querySelector("#profileImageInput");
const profilePreview = document.querySelector("#profilePreview");

const nicknameInput = document.querySelector("#nickname");
const nicknameHelper = document.querySelector("#nicknameHelper");
const editButton = document.querySelector("#editButton");

const withdrawButton = document.querySelector("#withdrawButton");
const withdrawModal = document.querySelector("#withdrawModal");
const cancelWithdrawButton = document.querySelector("#cancelWithdrawButton");
const confirmWithdrawButton = document.querySelector("#confirmWithdrawButton");

const toastMessage = document.querySelector("#toastMessage");

let selectedProfileImage = null;

function openDropdown() {
  profileDropdown.classList.add("is-open");
}

function closeDropdown() {
  profileDropdown.classList.remove("is-open");
}

function toggleDropdown() {
  profileDropdown.classList.toggle("is-open");
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

async function loadUserProfile() {
  try {
    return await getUserProfile();
  } catch (error) {
    console.error("사용자 정보를 불러오는데 실패했습니다.", error);
  }
}

const userDetail = await loadUserProfile();
const profileData = userDetail?.data ?? userDetail;
if (profileData?.email) emailText.textContent = profileData.email;
if (profileData?.nickname) nicknameInput.value = profileData.nickname;
if (profileData?.profileImage) profilePreview.src = profileData.profileImage;

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

function updateEditButtonState() {
  const nickname = nicknameInput.value.trim();

  if (nickname.length > 0 && nickname.length <= 10) {
    editButton.classList.add("is-active");
    editButton.disabled = false;
  } else {
    editButton.classList.remove("is-active");
    editButton.disabled = true;
  }
}

function showToast() {
  toastMessage.classList.add("is-show");

  setTimeout(() => {
    toastMessage.classList.remove("is-show");
  }, 2000);
}

profileButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleDropdown();
});

document.addEventListener("click", () => {
  closeDropdown();
});

profileDropdown.addEventListener("click", (event) => {
  event.stopPropagation();
});

editProfileMenu.addEventListener("click", () => {
  window.location.href = "./edit-profile.html";
});

editPasswordMenu.addEventListener("click", () => {
  window.location.href = "./edit-password.html";
});

logoutMenu.addEventListener("click", async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.error(error);
  } finally {
    window.location.href = "../index.html";
  }
});

profileImageInput.addEventListener("change", () => {
  const file = profileImageInput.files[0];

  if (!file) {
    selectedProfileImage = null;
    return;
  }

  selectedProfileImage = file;
  profilePreview.src = URL.createObjectURL(file);
});

nicknameInput.addEventListener("input", () => {
  if (nicknameInput.value.length > 10) {
    nicknameInput.value = nicknameInput.value.slice(0, 10);
  }

  updateEditButtonState();
});

nicknameInput.addEventListener("blur", async () => {
  await validateNickname();
  updateEditButtonState();
});

editProfileForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!(await validateNickname())) {
    updateEditButtonState();
    return;
  }

  try {
      editButton.disabled = true;
      await updateUserProfile({
          nickname: nicknameInput.value.trim(),
          profileImage: selectedProfileImage ? selectedProfileImage.name : null
      });

    showToast();
  } catch (error) {
    console.error(error);
    alert("회원정보 수정에 실패했습니다.");
  } finally {
    updateEditButtonState();
  }
});

withdrawButton.addEventListener("click", () => {
  openModal(withdrawModal);
});

cancelWithdrawButton.addEventListener("click", () => {
  closeModal(withdrawModal);
});

confirmWithdrawButton.addEventListener("click", async () => {
  confirmWithdrawButton.disabled = true;
  try {
    await withdrawUser();
    window.location.href = "../index.html";
  } catch (error) {
    console.error(error);
    alert("회원 탈퇴에 실패했습니다.");
    confirmWithdrawButton.disabled = false;
  }
});

withdrawModal.addEventListener("click", (event) => {
  if (event.target === withdrawModal) {
    closeModal(withdrawModal);
  }
});

updateEditButtonState();
