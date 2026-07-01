const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 8자 이상 20자 이하, 대문자, 소문자, 숫자, 특수문자 각각 최소 1개
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]{8,20}$/;

export function validatePasswordForm(password){
    if(password.length === 0){
        return "*비밀번호를 입력해주세요."
    }
    if(!PASSWORD_REGEX.test(password)){
        return "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
    }

    return "";
}

export function validatePasswordConfirmForm(password, passwordConfirm){
    if(passwordConfirm.length === 0){
        return "*비밀번호를 한번 더 입력해주세요";
    }

    if(password !== passwordConfirm){
        return "*비밀번호가 다릅니다.";
    }

    return "";
}

export function validateEmailForm(email){
    if(email.length === 0){
        return "*이메일을 입력해주세요.";
    }
    if(!EMAIL_REGEX.test(email)){
        return "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)"
    }
    return "";
}

export function validateNicknameForm(nickname){
    if(nickname.length === 0){
        return "*닉네임을 입력해주세요.";
    }
    if(nickname.length !== nickname.trim().length){
        return "*띄어쓰기를 없애주세요.";
    }
    if(nickname.length > 10) {
        return "*닉네임은 최대 10자 까지 작성 가능합니다.";
    }
    return "";
}