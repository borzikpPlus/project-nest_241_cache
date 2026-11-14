import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
  ParseIntPipe,
  Put,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserReqDto } from './dto/create-user.req.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserGetResDto } from './dto/user_get.res.dto.js';
import { DeliveryAddressReqDto } from './dto/delivery-address.req.dto.js';
import { UpdateDeliveryAddressDto } from './dto/update-delivery-address.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserReqDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<UserGetResDto[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserGetResDto> {
    return await this.userService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<UserGetResDto> {
    return await this.userService.update(id, updateUserDto);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserGetResDto> {
    return await this.userService.remove(id);
  }

  @Put(':id/address')
  async setAddress(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
    @Body(new ValidationPipe({ whitelist: true }))
    address: DeliveryAddressReqDto,
  ): Promise<UserGetResDto> {
    await this.checkAccess(request, id);
    return await this.userService.setAddress(id, address);
  }

  @Patch(':id/address')
  async patchAddress(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
    @Body(new ValidationPipe({ whitelist: true }))
    address: UpdateDeliveryAddressDto,
  ): Promise<UserGetResDto> {
    await this.checkAccess(request, id);
    return await this.userService.patchAddress(id, address);
  }

  private async checkAccess(
    request: AuthenticatedRequest,
    id: number,
  ): Promise<void> {
    const userId = request.user?.sub;
    if (userId === id) {
      return;
    }
    if (userId && (await this.userService.hasRole(userId, 'admin'))) {
      return;
    }
    throw new ForbiddenException('Недостатньо прав для виконання цієї дії');
  }
}
