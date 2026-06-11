import { UserResponseDto } from '../../users/dto/user-response.dto';

export type AuthResponse = {
  user: UserResponseDto;
  accessToken: string;
};
