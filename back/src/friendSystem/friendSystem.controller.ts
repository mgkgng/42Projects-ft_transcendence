import { Controller, Get, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { parse } from "path";
import { first } from "rxjs";
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
        user.id_g = 1;
        user.username = "john"
        return await this.userRepository.save(user);
    }

    // Do a request on this route to ask if 2 user are friend
    @Get("isfriendwith?")
    async isFriendWithByUsername(@Query() query : {first_username : string, second_username : string})
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let first_username = query.first_username;
        let second_username = query.second_username;
        return await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = :first_username OR friendrequested.username = :second_username`, {first_username : first_username, second_username: second_username})
        .andWhere(`friendrequester.username = :second_username OR friendrequested.username = :first_username`, {first_username : first_username, second_username: second_username})
        .andWhere(`u.is_user_friend = true`)
        .getOne();
    }

    // Do a request to this route to ask for the friendList of a user
    @Get("getFriendList?")
    async getFriendList(@Query() query : {username : string })
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let username = query.username;
        let unparsedQuery = await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = :username OR friendrequested.username = :username`, {username: username})
        .andWhere(`u.is_user_friend = true`)
        .getMany();

        let i : number = 0;
        let parsedList = [];
        unparsedQuery.forEach(element => {
            if (element.id_first_user.username == username)
                parsedList.push(element.id_second_user);
            if (element.id_second_user.username == username)
                parsedList.push(element.id_first_user);
            i++;
        });
        return parsedList;
    }

    // If first_username have already asked second_username no request is send
    // If second_username have already asked first_username the field is_user_friend
    // of the request from second_username become true.
    @Get("askfriend?")
    async askFriend(@Query() query : {first_username : string, second_username : string})
    {
        const qbu = this.userRepository.createQueryBuilder('u');
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let first_username = query.first_username;
        let second_username = query.second_username;
        let firstHaveAlreadyBeenRequestEntity = await qb.leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = :second_username AND friendrequested.username = :first_username`, {first_username : first_username, second_username: second_username})
        .getOne();
        let firstHaveAlreadyRequestedEntity = await qb
        .where(`friendrequester.username = :first_username AND friendrequested.username = :second_username`, {first_username : first_username, second_username: second_username})
        .getOne();
        if (firstHaveAlreadyBeenRequestEntity)
        {
            firstHaveAlreadyBeenRequestEntity.is_user_friend = true;
            return await this.userFriendRepository.save(firstHaveAlreadyBeenRequestEntity);   
        }
        else if (firstHaveAlreadyRequestedEntity == null)
        {
            const newUserRel = new UserFriendEntity();
            newUserRel.id_first_user = await qbu.select().where(`u.username = :first_username`, {first_username : first_username}).getOneOrFail();
            newUserRel.id_second_user = await qbu.select().where(`u.username = :second_username`, {second_username : second_username}).getOneOrFail();
            newUserRel.is_user_friend = false;
            return await this.userFriendRepository.save(newUserRel);
        }
        return firstHaveAlreadyRequestedEntity;
    }

    // Delete Friend
}