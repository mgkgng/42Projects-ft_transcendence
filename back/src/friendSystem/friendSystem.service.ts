import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/entity/User.entity";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { Repository } from "typeorm";

@Injectable()
export class friendSystemService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(UserFriendEntity)
        private userFriendRepository : Repository<UserFriendEntity>
    ) {}

    async isFriendWithByUsername(first_username : string, second_username : string)
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        return await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = :first_username AND friendrequested.username = :second_username`, {first_username : first_username, second_username: second_username})
        .orWhere(`friendrequester.username = :second_username AND friendrequested.username = :first_username`, {first_username : first_username, second_username: second_username})
        .andWhere(`u.is_user_friend = true`)
        .getOne();
    }
}