import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from './user.entity';

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
}
