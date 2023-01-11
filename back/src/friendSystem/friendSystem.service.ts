import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/entity/User.entity";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { Repository } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.service";
import { UserBlockEntity } from "src/entity/UserBlock.entity";

@Injectable()
export class friendSystemService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(UserBlockEntity)
		private userBlockRepository: Repository<UserBlockEntity>,
		@InjectRepository(UserFriendEntity)
		private userFriendRepository: Repository<UserFriendEntity>,
		@Inject(MainServerService)
		private mainServerService: MainServerService
	  ) {}

    // Do a request on this route to ask if 2 user are friend
    async isFriendWithByUsernameGetEnt(first_username : string, second_username : string)
    {
		const qb = this.userFriendRepository.createQueryBuilder('u');
        return await qb
        .leftJoinAndSelect("u.id_first_user", "friendrequester")
        .leftJoinAndSelect("u.id_second_user", "friendrequested")
        .where(`((friendrequester.username = :first_username AND friendrequested.username = :second_username) OR (friendrequester.username = :second_username AND friendrequested.username = :first_username)) AND u.is_user_friend = true`, {first_username: first_username, second_username: second_username})
        .getOne();
    }

    // Do a request to this route to ask for the friendList of a user, and his status
    async getFriendList(username : string )
    {
        const qb = this.userFriendRepository.createQueryBuilder('u');
		// Make a query to get all the friend of a user
		let unparsedQuery = await qb
		.leftJoinAndSelect("u.id_first_user", "friendrequester")
		.leftJoinAndSelect("u.id_second_user", "friendrequested")
		.where(`(friendrequester.username = :username OR friendrequested.username = :username)`, {username: username})
		.andWhere(`u.is_user_friend = true`)
		.getMany();

        let i : number = 0;
        let parsedList : UserEntity[] = [];
        unparsedQuery.forEach(element => {
            if (element.id_first_user.username == username && element.is_user_friend == true)
            {
                let newUserEntStatus = {...element.id_second_user, status: this.mainServerService.getUserStatus(element.id_second_user.username)};
                parsedList.push(newUserEntStatus);
            }
            if (element.id_second_user.username == username && element.is_user_friend == true)
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
        .where(`(friendrequester.username = :username OR friendrequested.username = :username)`, {username: username})
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
        let isFriendEntity = await this.isFriendWithByUsernameGetEnt(first_username, second_username);
        if (isFriendEntity == null)
            return null;
		return await this.userFriendRepository.remove(isFriendEntity);
    }

	// Get a list of all the person username have asked to be friend
	async getAskListWhereUserIsAsker(username : string)
	{
		const qb = this.userFriendRepository.createQueryBuilder('u');
		let isRequesterEntityList = await qb
		.leftJoinAndSelect("u.id_first_user", "friendrequester")
		.leftJoinAndSelect("u.id_second_user", "friendrequested")
		.where(`friendrequester.username = :username`, {username: username})
		// .andWhere(`u.is_user_friend = false AND u.is_user_refused = false`)
		.getMany();

		if (isRequesterEntityList.length == 0) // need to changed to empty array
			return null;
		let parsedList : UserEntity[] = [];
		isRequesterEntityList.forEach(element => {
			let newUserEntStatus = {...element.id_second_user, status: this.mainServerService.getUserStatus(element.id_second_user.username)};
			parsedList.push(newUserEntStatus);
		});
		return parsedList;
	}

	// Get a list of all the person username have been asked to be friend
	// and where the person have not refused the request
	// and where the person have not accepted the request
	async getAskListWhereUserIsAsked(username : string)
	{
		const qb = this.userFriendRepository.createQueryBuilder('u');
		let isRequestedEntityList = await qb
		.leftJoinAndSelect("u.id_first_user", "friendrequester")
		.leftJoinAndSelect("u.id_second_user", "friendrequested")
		.where(`(friendrequested.username = :username)`, {username: username})
		.andWhere(`u.is_user_friend = false AND u.is_user_refused = false`)
		.getMany();

		if (isRequestedEntityList.length == 0)
			return null;
		let parsedList : UserEntity[] = [];
		isRequestedEntityList.forEach(element => {
			let newUserEntStatus = {...element.id_first_user, status: this.mainServerService.getUserStatus(element.id_first_user.username)};
			parsedList.push(newUserEntStatus);
		});
		return parsedList;
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
		const ret = await this.userFriendRepository.remove(isRequestedEntity);
        return ret;
    }

	// Function to refuse a friend request if the user is the one who have been asked
	async refuseFriend(first_username : string, second_username : string)
	{
		const qb = this.userFriendRepository.createQueryBuilder('u');
		let isRequestedEntity = await qb
		.leftJoinAndSelect("u.id_first_user", "friendrequester")
		.leftJoinAndSelect("u.id_second_user", "friendrequested")
		.where("(friendrequester.username = :first_username AND friendrequested.username = :second_username)", {first_username: first_username, second_username: second_username})
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
        global.userConnectedList.forEach(element => {
            if (element.username === username)
            {
                element.status = status;
                return ;
            }
        });
    }

	async isUserBlocked(blockerUsername: string, blockedUsername: string): Promise<boolean> {
		// Find the user who is doing the blocking
		const blockerUser = await this.userRepository.findOne({
		  where: { username: blockerUsername },
		});
		if (!blockerUser) {
		  throw new Error(`User with username "${blockerUsername}" not found.`);
		}
	  
		// Find the user who is being checked for being blocked
		const blockedUser = await this.userRepository.findOne({
		  where: { username: blockedUsername },
		});
		if (!blockedUser) {
		  throw new Error(`User with username "${blockedUsername}" not found.`);
		}
	  
		// Check if the blocked user is already blocked by the blocker
		const qb = this.userBlockRepository.createQueryBuilder('u');
		let existingBlock = await qb
        .leftJoinAndSelect("u.id_user", "userblocker")
        .leftJoinAndSelect("u.id_user_blocked", "userblocked")
        .where("userblocker.username = :first_username AND userblocked.username = :second_username", {first_username: blockerUser.username, second_username: blockedUser.username})
        .getOne();
	
		return !!existingBlock;
	  }

	async blockUser(blockerUsername: string, blockedUsername: string): Promise<void> {
		// Find the user who is doing the blocking
		const blockerUser = await this.userRepository.findOne({
		  where: { username: blockerUsername },
		});
		if (!blockerUser) {
		  throw new Error(`User with username "${blockerUsername}" not found.`);
		}
	
		// Find the user who is being blocked
		const blockedUser = await this.userRepository.findOne({
		  where: { username: blockedUsername },
		});
		if (!blockedUser) {
		  throw new Error(`User with username "${blockedUsername}" not found.`);
		}
	
		// Check if the blocked user is already blocked by the blocker
		const qb = this.userBlockRepository.createQueryBuilder('u');
		let existingBlock = await qb
        .leftJoinAndSelect("u.id_user", "userblocker")
        .leftJoinAndSelect("u.id_user_blocked", "userblocked")
        .where("userblocker.username = :first_username AND userblocked.username = :second_username", {first_username: blockerUser.username, second_username: blockedUser.username})
        .getOne();
		if (existingBlock) {
		  throw new Error(`User "${blockedUsername}" is already blocked by "${blockerUsername}".`);
		}
	
		// Create a new UserBlockEntity to represent the block
		const userBlock = new UserBlockEntity();
		userBlock.id_user = blockerUser;
		userBlock.id_user_blocked = blockedUser;
	
		// Save the UserBlockEntity to the database
		await this.userBlockRepository.save(userBlock);
	  }

	  async unblockUser(unblockerUsername: string, unblockedUsername: string): Promise<void> {
		// Find the user who is doing the unblocking
		const unblockerUser = await this.userRepository.findOne({
		  where: { username: unblockerUsername },
		});
		if (!unblockerUser) {
		  throw new Error(`User with username "${unblockerUsername}" not found.`);
		}
	  
		// Find the user who is being unblocked
		const unblockedUser = await this.userRepository.findOne({
		  where: { username: unblockedUsername },
		});
		if (!unblockedUser) {
		  throw new Error(`User with username "${unblockedUsername}" not found.`);
		}
	  
		// Check if the unblocked user is actually blocked by the unblocker
		const qb = this.userBlockRepository.createQueryBuilder('u');
		let existingBlock = await qb
        .leftJoinAndSelect("u.id_user", "userUnblocker")
        .leftJoinAndSelect("u.id_user_blocked", "userUnblocked")
        .where("userUnblocker.username = :first_username AND userUnblocked.username = :second_username", {first_username: unblockerUser.username, second_username: unblockedUser.username})
        .getOne();
		if (!existingBlock) {
		  throw new Error(`User "${unblockedUsername}" is not blocked by "${unblockerUsername}".`);
		}
	  
		// Delete the UserBlockEntity to unblock the user
		await this.userBlockRepository.delete(existingBlock);
	  }
}