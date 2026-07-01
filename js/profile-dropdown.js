document.addEventListener("DOMContentLoaded", () => {
  const profileButton = document.querySelector("#profileButton");
  const profileDropdown = document.querySelector("#profileDropdown");

  const editProfileMenu = document.querySelector("#editProfileMenu");
  const editPasswordMenu = document.querySelector("#editPasswordMenu");
  const logoutMenu = document.querySelector("#logoutMenu");

  if (!profileButton || !profileDropdown) {
    return;
  }

  function closeDropdown() {
    profileDropdown.classList.remove("is-open");
  }

  function toggleDropdown() {
    profileDropdown.classList.toggle("is-open");
  }

  profileButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown();
  });

  profileDropdown.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    closeDropdown();
  });

  editProfileMenu?.addEventListener("click", () => {
    window.location.href = "./edit-profile.html";
  });

  editPasswordMenu?.addEventListener("click", () => {
    window.location.href = "./edit-password.html";
  });

  logoutMenu?.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    window.location.href = "../index.html";
  });
});