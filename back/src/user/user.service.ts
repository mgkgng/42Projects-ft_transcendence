import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../entity/User.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private usersRepository: Repository<UserEntity>, 
		private dataSource : DataSource
	  ) {}
	
	  findAll(): Promise<UserEntity[]> {
		return this.usersRepository.find();
	  }
	
	  findOne(username: string): Promise<UserEntity> {
		return this.usersRepository.findOneBy({ username });
	  }

	  async addJohn()
	  {
		return await (this.dataSource.createQueryBuilder().insert().into(UserEntity).values([
			{username: "John", password: "test", email: "bite@test.42.fr"},
		])
		.execute());
	  }
	 async create(user: any)
	 {
		console.log("TRY TO CREATE USER");
		const res =  await (this.dataSource.createQueryBuilder().insert().into(UserEntity).values([
			{username: user.username, password: user.password, email: user.email, is_42_user: user.is_42_user, img: user.img},
		]).execute());
		console.log("USER INSERTED");
		console.log(res);
		return (res);
	 }
}
