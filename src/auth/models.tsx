/**
 * Response to valid login request.
 */
interface LogInResponse {
    userId: number;
    userTitle: string;
    jwt: string;
    userRole: number;
};
class SuccessfulLoginResponseDto {
    accessToken: string = "";
}
/**
 * Entity for creating and updating.
 */
class RegisterDto {
    UserName: string = "";
    Password: string = "";
    Email: string = "";
}
class LoginDto {
    UserName: string = "";
    Password: string = "";
}

interface UserDto {
    Id: string;
    UserName: string;
    Email: string;
};


//
export type {
    LogInResponse
}
export {
    SuccessfulLoginResponseDto
}
export {
    RegisterDto
}
export type {
    UserDto
}
export {
    LoginDto
}