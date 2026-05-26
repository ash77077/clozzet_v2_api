import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserEmailService } from './user-email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import * as bcrypt from 'bcrypt';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userEmailService: UserEmailService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll() {
    const users = await this.usersService.findAll();
    // Remove password from response
    return users.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });
  }

  @Post('send-reset-email')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email to user' })
  async sendResetEmail(
    @Body() body: { email: string; firstName: string; temporaryPassword: string },
  ) {
    try {
      await this.userEmailService.sendPasswordResetEmail(body.email, body.firstName, body.temporaryPassword);
      return { message: 'Reset email sent successfully' };
    } catch (err) {
      console.error('Failed to send reset email:', err.message);
      return { message: 'Email could not be sent', error: err.message };
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createUserDto: CreateUserDto) {
    const temporaryPassword = createUserDto.password;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
      mustChangePassword: true,
    } as any);

    // Send welcome email with the plain-text temporary password
    try {
      await this.userEmailService.sendWelcomeEmail(
        createUserDto.email,
        createUserDto.firstName,
        temporaryPassword,
      );
    } catch (err) {
      console.error('Failed to send welcome email:', err.message);
    }

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      (updateUserDto as any).mustChangePassword = true;
    }

    const user = await this.usersService.update(id, updateUserDto);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - only admins can delete users' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Put(':id/activate')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async activate(@Param('id') id: string) {
    const user = await this.usersService.activate(id);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  @Put(':id/deactivate')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async deactivate(@Param('id') id: string) {
    const user = await this.usersService.deactivate(id);
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
