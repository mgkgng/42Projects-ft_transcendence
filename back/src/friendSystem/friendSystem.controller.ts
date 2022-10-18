import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/entity/User.entity";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { Repository } from "typeorm";

@Controller()
export class friendSystemController {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(UserFriendEntity)
        private userFriendRepository : Repository<UserFriendEntity>
    ) {}

    @Get('/getFriendForHadufer')
    async handleGetFriendForHadufer()
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');
        let username = "hadufer";
        return await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = '${username}' OR friendrequested.username = '${username}'`)
        // .getSql();
        .getMany();
    }

    @Get('addFriend/:username')
    async handleMakeFriend()
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        const newUserRel = new UserFriendEntity();
        newUserRel.id_first_user = await qbu.select().where("u.id_g = 1").getOneOrFail();
        newUserRel.id_second_user = await qbu.select().where("u.id_g = 2").getOneOrFail();
        // await this.userRepository.update()
        return this.userFriendRepository.save([newUserRel]);
        
    }
    
    @Get("debugUserFriendList")
    async debugUserList()
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');
        return await this.userFriendRepository.find({relations: ['id_first_user', 'id_second_user']})
    }

    // IsFriendWith
    // async isFriendWith(first_id_g : number, second_id_g : number)
    // {
    //     const qb = this.userFriendRepository.createQueryBuilder('u');
    //     const qbFriendRequest = qb.select("u.")
    // }

    // Friend Request

    // Accept Friend

    // Delete Friend
}