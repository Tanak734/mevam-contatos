import { PrismaClient } from "@prisma/client/extension";
import { CreateUserDTO, UserResponseDTO } from "../dtos/user.dto.js";


export class UserService{
  constructor(private readonly db:PrismaClient){}

  async create(userDto: CreateUserDTO): Promise<UserResponseDTO> {
    const existeUser = await this.db.user.findFirst({
      where: {telefone: userDto.telefone}
    })

    if(existeUser){
      throw new Error("O Usuario ja existe");
    }

    return this.db.user.create({data: userDto})
    
  }
}