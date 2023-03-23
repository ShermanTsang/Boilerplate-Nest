import 'reflect-metadata'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { User } from '../@generated/user/user.model'
import { PrismaService } from '../prisma/prisma.service'
import { GqlAuthGuard } from '../auth/gql-auth.guard'
import { JwtService } from '@nestjs/jwt'

@Resolver(User)
export class UserResolver {
    constructor(private prismaService: PrismaService, private jwtService: JwtService) {}

    @Mutation((returns) => User, { nullable: true })
    async login(@Args('credential') credential: string, @Args('password') password: string) {
        const matchedUser = await this.prismaService.user.findFirst({
            where: {
                AND: {
                    password,
                    OR: [{ email: credential }, { mobile: credential }]
                }
            }
        })
        if (matchedUser) {
            const payload = { username: matchedUser.name, sub: matchedUser.id }
            return {
                ...matchedUser,
                accessToken: this.jwtService.sign(payload)
            }
        }
    }

    @Query((returns) => User, { nullable: true })
    @UseGuards(GqlAuthGuard)
    user(@Args('id') id: number, @Context() ctx) {
        return this.prismaService.user.findUnique({
            where: { id },
            include: {
                Profile: true
            }
        })
    }

    @Query((returns) => [User], { nullable: true })
    @UseGuards(GqlAuthGuard)
    async allUsers(@Context() ctx) {
        return this.prismaService.user.findMany({
            include: {
                ShippingAddresses: true,
                Profile: true
            },
            orderBy: {
                id: 'asc'
            }
        })
    }
}
