import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserReqDto } from './dto/create-user.req.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserGetResDto } from './dto/user_get.res.dto.js';
import { HashHelper } from '../helpers/hash.helper.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { FindOptionsRelations, Repository } from 'typeorm';
import { DeliveryAddress } from './entities/delivery-address.entity.js';
import { City } from '../country/entities/city.entity.js';
import { DeliveryAddressReqDto } from './dto/delivery-address.req.dto.js';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly _repository: Repository<User>,
    private readonly _hashHelper: HashHelper,
    @InjectRepository(DeliveryAddress)
    private readonly _addressRepository: Repository<DeliveryAddress>,
    @InjectRepository(City)
    private readonly _cityRepository: Repository<City>,
  ) {}

  private readonly _relations: FindOptionsRelations<User> = {
    role: true,
    delivery_address: { city: { country: true } },
  };

  async create(createUserDto: CreateUserReqDto) {
    const user = await this._repository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (user != null) {
      throw new ConflictException('Користувач з таким email вже існує');
    }

    const hash = await this._hashHelper.hash(createUserDto.password);
    const result = this._repository.create({
      fullname: createUserDto.fullname,
      email: createUserDto.email,
      is_block: createUserDto.is_block,
      password_hash: hash,
      role: { id: 2 },
    });
    const savedUser = await this._repository.save(result);

    return {
      id: savedUser.id,
      email: savedUser.email,
      fullname: savedUser.fullname,
      is_block: savedUser.is_block,
    };
  }

  async validateCredentials(email: string, password: string) {
    const user = await this._repository.findOne({ where: { email } });
    if (!user || user.is_block) {
      return null;
    }

    const isValid = await this._hashHelper.isValidPassword(
      password,
      user.password_hash,
    );
    return isValid ? { id: user.id, email: user.email } : null;
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const user = await this._repository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    return user?.role?.name === roleName;
  }

  async findAll(): Promise<UserGetResDto[]> {
    const users = await this._repository.find({
      relations: this._relations,
      order: { id: 'ASC' },
    });
    return users.map((u: User) => this.toDto(u));
  }

  async findOne(id: number): Promise<UserGetResDto> {
    const user = await this._repository.findOne({
      where: { id },
      relations: this._relations,
    });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    return this.toDto(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserGetResDto> {
    const user = await this._repository.findOne({
      where: { id },
      relations: this._relations,
    });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    if (
      updateUserDto.email !== undefined &&
      updateUserDto.email !== user.email
    ) {
      const exists = await this._repository.findOneBy({
        email: updateUserDto.email,
      });
      if (exists) {
        throw new ConflictException('Користувач з таким email вже існує');
      }
      user.email = updateUserDto.email;
    }
    if (updateUserDto.fullname !== undefined) {
      user.fullname = updateUserDto.fullname;
    }
    if (updateUserDto.is_block !== undefined) {
      user.is_block = updateUserDto.is_block;
    }
    if (updateUserDto.password !== undefined) {
      user.password_hash = await this._hashHelper.hash(updateUserDto.password);
    }
    const result = await this._repository.save(user);
    return this.toDto(result);
  }

  async remove(id: number): Promise<UserGetResDto> {
    const user = await this._repository.findOne({
      where: { id },
      relations: this._relations,
    });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    await this._repository.remove(user);
    return this.toDto({ ...user, id });
  }

  async setAddress(
    id: number,
    dto: DeliveryAddressReqDto,
  ): Promise<UserGetResDto> {
    const user = await this.getUser(id);
    const address =
      user.delivery_address ?? this._addressRepository.create({ user });
    address.city = await this.getCity(dto.city_id);
    address.street = dto.street;
    address.house = dto.house;
    address.apartment = dto.apartment ?? null;
    address.postal_code = dto.postal_code ?? null;
    await this._addressRepository.save(address);
    return this.findOne(id);
  }

  async patchAddress(
    id: number,
    dto: UpdateDeliveryAddressDto,
  ): Promise<UserGetResDto> {
    const user = await this.getUser(id);
    const address = user.delivery_address;
    if (!address) {
      throw new NotFoundException('Адресу доставки не знайдено');
    }
    if (dto.city_id !== undefined) {
      address.city = await this.getCity(dto.city_id);
    }
    if (dto.street !== undefined) {
      address.street = dto.street;
    }
    if (dto.house !== undefined) {
      address.house = dto.house;
    }
    if (dto.apartment !== undefined) {
      address.apartment = dto.apartment;
    }
    if (dto.postal_code !== undefined) {
      address.postal_code = dto.postal_code;
    }
    await this._addressRepository.save(address);
    return this.findOne(id);
  }

  private async getUser(id: number): Promise<User> {
    const user = await this._repository.findOne({
      where: { id },
      relations: this._relations,
    });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    return user;
  }

  private async getCity(id: number): Promise<City> {
    const city = await this._cityRepository.findOne({
      where: { id },
      relations: { country: true },
    });
    if (!city) {
      throw new NotFoundException('Місто не знайдено');
    }
    return city;
  }

  private toDto(user: User): UserGetResDto {
    const address = user.delivery_address;
    return {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      is_block: user.is_block,
      role: user.role?.name ?? null,
      delivery_address: address
        ? {
            id: address.id,
            country: address.city.country.name,
            city: address.city.name,
            street: address.street,
            house: address.house,
            apartment: address.apartment,
            postal_code: address.postal_code,
          }
        : null,
    };
  }
}
