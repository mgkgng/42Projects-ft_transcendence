import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/entity/User.entity";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { Repository } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.gateway";

@Injectable()
export class friendSystemService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(UserFriendEntity)
        private userFriendRepository : Repository<UserFriendEntity>,
        @Inject(MainServerService)
        private mainServerService : MainServerService
    ) {}

    // Do a request on this route to ask if 2 user are friend
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

    // Do a request to this route to ask for the friendList of a user, and his status
    async getFriendList(username : string )
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let unparsedQuery = await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = :username OR friendrequested.username = :username`, {username: username})
        .andWhere(`u.is_user_friend = true`)
        .getMany();

        let i : number = 0;
        let parsedList : UserEntity[] = [];
        unparsedQuery.forEach(element => {
            if (element.id_first_user.username == username)
            {
                let newUserEntStatus = {...element.id_second_user, status: this.mainServerService.getUserStatus(element.id_second_user.username)};
                parsedList.push(newUserEntStatus);
            }
            if (element.id_second_user.username == username)
            {
                let newUserEntStatus = {...element.id_first_user, status: this.mainServerService.getUserStatus(element.id_first_user.username)};
                parsedList.push(newUserEntStatus);
            }
            i++;
        });
        return parsedList;
    }
    // Do a request to this route to ask for the friendList of a user, and his status
    async getAskList(username : string )
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let unparsedQuery = await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`friendrequester.username = :username OR friendrequested.username = :username`, {username: username})
        .andWhere(`u.is_user_friend = false AND u.is_user_refused = false`)
        .getMany();

        let i : number = 0;
        let parsedList : UserEntity[] = [];
        unparsedQuery.forEach(element => {
            if (element.id_first_user.username == username)
            {
                let newUserEntStatus = {...element.id_second_user, status: this.mainServerService.getUserStatus(element.id_second_user.username)};
                parsedList.push(newUserEntStatus);
            }
            if (element.id_second_user.username == username)
            {
                let newUserEntStatus = {...element.id_first_user, status: this.mainServerService.getUserStatus(element.id_first_user.username)};
                parsedList.push(newUserEntStatus);
            }
            i++;
        });
        return parsedList;
    }
    // If first_username have already asked second_username no request is send
    // If second_username have already asked first_username the field is_user_friend
    // of the request from second_username become true.
    async askFriend(first_username : string, second_username : string)
    {
        const qbu = this.userRepository.createQueryBuilder('u');
        const qb = this.userFriendRepository.createQueryBuilder('u');
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

    // This function will delete the entry from the userFriendEntity table
    // where the friend appear
    async removeFriend(first_username : string, second_username : string)
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let isFriendEntity = await this.isFriendWithByUsername(first_username, second_username);
        if (isFriendEntity == null)
            return null;
        return await qb.delete().where(`id_g = ${isFriendEntity.id_g}`).execute();
    }

    // If first_username have asked second_username as friend
    // and this function is called by first_username then it unfriend
    // them.
    async unAskFriend(first_username : string, second_username : string)
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
        let isRequestedEntity = await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where("friendrequester.username = :first_username AND friendrequested.username = :second_username", {first_username: first_username, second_username: second_username})
        .getOne();
        if (isRequestedEntity == null)
            return ;
        return await this.removeFriend(first_username, second_username);
    }

	// Function to refuse a friend request if the user is the one who have been asked
	async refuseFriend(first_username : string, second_username : string)
	{
		const qb = this.userFriendRepository.createQueryBuilder('u');
		let isRequestedEntity = await qb
		.leftJoinAndSelect("u.id_first_user", "friendrequester")
		.leftJoinAndSelect("u.id_second_user", "friendrequested")
		.where("friendrequester.username = :first_username AND friendrequested.username = :second_username", {first_username: first_username, second_username: second_username})
		.andWhere("u.is_user_friend = false AND u.is_user_refused = false")
		.getOne();
		if (isRequestedEntity == null)
			return null;
		isRequestedEntity.is_user_refused = true;
		return await this.userFriendRepository.save(isRequestedEntity);
	}

	// async removeFriend(first_username : string, second_username : string)
	// {
	// 	const qb = this.userFriendRepository.createQueryBuilder('u');
	// 	let isFriendEntity = await qb
	// 	.leftJoinAndSelect("u.id_first_user", "friendrequester")
	// 	.leftJoinAndSelect("u.id_second_user", "friendrequested")
	// 	.where("friendrequester.username = :first_username AND friendrequested.username = :second_username", {first_username: first_username, second_username: second_username})
	// 	.andWhere("u.is_user_friend = true AND u.is_user_refused = false")
	// 	.getOne();
	// 	if (isFriendEntity == null)
	// 		return null;
	// 	return await this.unFriend(first_username, second_username);
	// }

    async changeStatus(username : string, status : string)
    {
        if (status != "online" && status != "offline" && status != "in game")
            return ;
        this.mainServerService.userConnectedList.forEach(element => {
            if (element.username === username)
            {
                element.status = status;
                return ;
            }
        });
    }
}