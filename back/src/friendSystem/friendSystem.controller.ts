import { Controller, Get, Query } from "@nestjs/common";
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

    @Get('addFriend')
    async handleMakeFriend()
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        const newUserRel = new UserFriendEntity();
        newUserRel.id_first_user = await qbu.select().where("u.username = 'John'").getOneOrFail();
        newUserRel.id_second_user = await qbu.select().where("u.username = 'bobby'").getOneOrFail();
        newUserRel.is_user_friend = true;
        // await this.userRepository.update()
        
        return this.userFriendRepository.save([newUserRel]);
        
    }
    
    @Get("debugUserFriendList")
    async debugUserFriendList()
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');
        return await this.userFriendRepository.find({relations: ['id_first_user', 'id_second_user']})
    }

    @Get("debugUser")
    async debugUserList()
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');
        return await this.userRepository.find({relations:{relation_friend_requested: true, relation_friend_accepted: true}})
    }

    @Get("addNew")
    async addNew()
    {
        let user = new UserEntity;
        user.email = "bobby@bobby.com"
        user.password = "passbobby"
        user.username = "bobby";
        return await this.userRepository.save(user);
    }

    @Get("isfriendwith?")
    async isFriendWithByUsername(@Query('first_username') first_username : string,
                                @Query('second_username') second_username : string)
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        first_username = "John";
        second_username = "bobby";
        return await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = '${first_username}' OR friendrequested.username = '${second_username}'`)
        .andWhere(`friendrequester.username = '${second_username}' OR friendrequested.username = '${first_username}'`)
        .andWhere(`u.is_user_friend = true`)
        // .getSql();
        .getMany();
    }

    // Friend Request

    // Accept Friend

    // Delete Friend
}