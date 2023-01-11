import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../entity/User.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private usersRepository: Repository<UserEntity>, 
		private dataSource : DataSource,
		private jwtServer: JwtService,
	  ) {}
	
	  async findAll(): Promise<UserEntity[]> {
		return this.usersRepository.find();
	  }
	
	  async findOne(username: string): Promise<UserEntity> {
		return this.usersRepository.findOne({where : { username_42: username }});
	  }
	async findOneByUsername(username: string): Promise<UserEntity> {
		return this.usersRepository.findOne({where : { username: username }});
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
		const  querry = this.dataSource.createQueryRunner(); 
		await querry.connect();
		await querry.startTransaction();
		try{
			const res =  await querry.manager.insert(UserEntity,
				{username: user.username, password: user.password, email: user.email, is_42_user: user.is_42_user, img_url: user.img},
			);
			await querry.commitTransaction();
			return (res);
		} catch (e) {
			await querry.rollbackTransaction();
			// console.log("Create User failed");
			return (null);
		}
	}
	getUsername(req)
	{
		const user : any = (this.jwtServer.decode(req.headers.authorization.split(' ')[1]));
		return (user?.username_42);
	}
	async change_img(username : string, file : any)
	{
		const encoded_file = ("data:" + file.mimetype + ";base64," + file.buffer.toString('base64'));
		this.dataSource.createQueryBuilder().update(UserEntity)
		.set({img: encoded_file}).where({username_42: username}).execute();
		return (encoded_file);
	}
	async delete_img(username : string)
	{
		this.dataSource.createQueryBuilder().update(UserEntity)
		.set({img: ""}).where({username_42: username}).execute();
	}
}
