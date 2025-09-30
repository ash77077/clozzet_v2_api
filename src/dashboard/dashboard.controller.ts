import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DashboardService, DashboardStats, AdminDashboardData, UserDashboardData } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieves overall system statistics for dashboard display',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getStats(): Promise<{
    success: boolean;
    message: string;
    data: DashboardStats;
  }> {
    const stats = await this.dashboardService.getDashboardStats();
    
    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('admin')
  @ApiOperation({
    summary: 'Get admin dashboard data',
    description: 'Retrieves comprehensive dashboard data for admin users',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard data retrieved successfully',
  })
  async getAdminDashboard(): Promise<{
    success: boolean;
    message: string;
    data: AdminDashboardData;
  }> {
    const adminData = await this.dashboardService.getAdminDashboardData();
    
    return {
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: adminData,
    };
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user dashboard data',
    description: 'Retrieves dashboard data for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to get dashboard data for',
  })
  @ApiResponse({
    status: 200,
    description: 'User dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserDashboard(
    @Param('userId') userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: UserDashboardData;
  }> {
    const userData = await this.dashboardService.getUserDashboardData(userId);
    
    return {
      success: true,
      message: 'User dashboard data retrieved successfully',
      data: userData,
    };
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves all active users for dashboard display',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async getAllUsers(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const users = await this.dashboardService.getAllUsers();
    
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get('companies')
  @ApiOperation({
    summary: 'Get all companies',
    description: 'Retrieves all active companies for dashboard display',
  })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully',
  })
  async getAllCompanies(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const companies = await this.dashboardService.getAllCompanies();
    
    return {
      success: true,
      message: 'Companies retrieved successfully',
      data: companies,
    };
  }

  @Get('recent-users')
  @ApiOperation({
    summary: 'Get recent users',
    description: 'Retrieves recently registered users',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent users retrieved successfully',
  })
  async getRecentUsers(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const users = await this.dashboardService.getRecentUsers(10);
    
    return {
      success: true,
      message: 'Recent users retrieved successfully',
      data: users,
    };
  }

  @Get('recent-companies')
  @ApiOperation({
    summary: 'Get recent companies',
    description: 'Retrieves recently registered companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent companies retrieved successfully',
  })
  async getRecentCompanies(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const companies = await this.dashboardService.getRecentCompanies(10);
    
    return {
      success: true,
      message: 'Recent companies retrieved successfully',
      data: companies,
    };
  }

  @Get('top-companies')
  @ApiOperation({
    summary: 'Get top companies',
    description: 'Retrieves top performing companies by order volume',
  })
  @ApiResponse({
    status: 200,
    description: 'Top companies retrieved successfully',
  })
  async getTopCompanies(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const companies = await this.dashboardService.getTopCompanies(10);
    
    return {
      success: true,
      message: 'Top companies retrieved successfully',
      data: companies,
    };
  }

  @Get('user-activity')
  @ApiOperation({
    summary: 'Get user activity data',
    description: 'Retrieves user registration activity for the last 30 days',
  })
  @ApiResponse({
    status: 200,
    description: 'User activity data retrieved successfully',
  })
  async getUserActivity(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const activity = await this.dashboardService.getUserActivity();
    
    return {
      success: true,
      message: 'User activity data retrieved successfully',
      data: activity,
    };
  }

  @Get('monthly-orders')
  @ApiOperation({
    summary: 'Get monthly order data',
    description: 'Retrieves monthly order statistics for charts',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly order data retrieved successfully',
  })
  async getMonthlyOrderData(): Promise<{
    success: boolean;
    message: string;
    data: any[];
  }> {
    const monthlyData = await this.dashboardService.getMonthlyOrderData();
    
    return {
      success: true,
      message: 'Monthly order data retrieved successfully',
      data: monthlyData,
    };
  }
}