import { Global, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from '../prisma/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { GqlAuthGuard } from './gql-auth.guard'
import { JwtStrategy } from './jwt.strategy'

@Global()
@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get<string>('AUTH_JWT_SECRET'),
                    signOptions: { expiresIn: '1d' }
                }
            },
            inject: [ConfigService]
        })
    ],
    providers: [PrismaService, JwtModule, GqlAuthGuard, JwtStrategy],
    exports: [JwtModule]
})
export class AuthModule {}
