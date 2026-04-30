// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';

// import { UserRole } from '../../../modules/user/domain/enums/user-role.enum';

// @Injectable()
// export class TokenService {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly jwtService: JwtService,
//   ) {}

//   generate(userId: string, role: UserRole): string {
//     const accessTokenSecret = this.configService.getOrThrow(
//       'ACCESS_TOKEN_SECRET',
//     );
//     const accessTokenTime = parseInt(
//       this.configService.getOrThrow('ACCESS_TOKEN_TIME'),
//       10,
//     );

//     const payload = { id: userId, role };

//     return this.jwtService.sign(payload, {
//       secret: accessTokenSecret,
//       expiresIn: accessTokenTime,
//     });
//   }
// }
