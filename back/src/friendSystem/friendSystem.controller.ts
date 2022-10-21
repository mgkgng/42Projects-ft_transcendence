import { Controller, Get, Inject, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { parse } from "path";
import { first } from "rxjs";
import { UserEntity } from "src/entity/User.entity";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { Repository } from "typeorm";
import { friendSystemService } from "./friendSystem.service";

@Controller()
export class friendSystemController {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(UserFriendEntity)
        private userFriendRepository : Repository<UserFriendEntity>,
        @Inject(friendSystemService)
        private friendSystemService : friendSystemService
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
        user.id_g = 1;
        user.username = "john"
        return await this.userRepository.save(user);
    }

    @Get("isfriendwith?")
    async isFriendWithByUsername(@Query() query : {first_username : string, second_username : string})
    {
        return this.friendSystemService.isFriendWithByUsername(query.first_username, query.second_username);
    }

    @Get("getFriendList?")
    async getFriendList(@Query() query : {username : string })
    {
        return this.friendSystemService.getFriendList(query.username);
    }

    @Get("askfriend?")
    async askFriend(@Query() query : {first_username : string, second_username : string})
    {
        return this.friendSystemService.askFriend(query.first_username, query.second_username);
    }

    @Get('unaskfriend?')
    async unaskFriend(@Query() query : {first_username : string, second_username : string})
    {
        return this.friendSystemService.unAskFriend(query.first_username, query.second_username);
    }

    @Get('unfriend?')
    async unfriend(@Query() query : {first_username : string, second_username : string})
    {
        return this.friendSystemService.unFriend(query.first_username, query.second_username);
    }
}