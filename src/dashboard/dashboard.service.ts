import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User, UserDocument} from '../users/schemas/user.schema';
import {Company, CompanyDocument} from '../companies/schemas/company.schema';
import {ProductDetailsService} from '../product-details/product-details.service';

export interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  recentRegistrations: number;
  monthlyGrowth: number;
  completedOrders: number;
}

export interface UserDashboardData {
  user: any;
  recentOrders: any[];
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  stats: {
    thisMonth: {
      orders: number;
      spent: number;
    };
    lastMonth: {
      orders: number;
      spent: number;
    };
  };
}

export interface AdminDashboardData {
  stats: DashboardStats;
  recentUsers: any[];
  recentCompanies: any[];
  recentOrders: any[];
  topCompanies: any[];
  userActivity: any[];
  monthlyOrderData: any[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private productDetailsService: ProductDetailsService,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalCompanies,
      totalOrders,
      activeUsers,
      recentRegistrations,
    ] = await Promise.all([
      this.userModel.countDocuments({ isActive: true }),
      this.companyModel.countDocuments({ isActive: true }),
      this.productDetailsService.findAll().then(orders => orders.length),
      this.userModel.countDocuments({ 
        isActive: true,
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
    ]);

    // Get product details statistics
    const productStats = await this.productDetailsService.getStatistics();
    
    // Calculate monthly growth (mock calculation for now)
    const lastMonthUsers = await this.userModel.countDocuments({
      createdAt: { 
        $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    const monthlyGrowth = lastMonthUsers > 0 
      ? ((recentRegistrations - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;

    return {
      totalUsers,
      totalCompanies,
      totalOrders: productStats.totalOrders,
      totalRevenue: productStats.totalQuantity * 25, // Estimated revenue
      activeUsers,
      recentRegistrations,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      completedOrders: totalOrders,
    };
  }

  async getRecentUsers(limit: number = 5): Promise<any[]> {
    const users = await this.userModel
      .find({ isActive: true })
      .populate('company')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-password -emailVerificationToken -passwordResetToken')
      .exec();

    return users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      company: user.company,
      createdAt: user.createdAt,
      isActive: user.isActive,
    }));
  }

  async getRecentCompanies(limit: number = 5): Promise<any[]> {
    return this.companyModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getTopCompanies(limit: number = 5): Promise<any[]> {
    // Get companies with their order counts
    const companies = await this.companyModel.find({ isActive: true }).exec();
    
    // For now, return companies sorted by creation date
    // TODO: Add actual order counting when Order schema is implemented
    return companies
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(company => ({
        ...company.toObject(),
        orderCount: Math.floor(Math.random() * 20) + 1, // Mock data for now
        totalValue: Math.floor(Math.random() * 50000) + 5000, // Mock data for now
      }));
  }

  async getUserActivity(): Promise<any[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const activeUsers = await this.userModel.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 30
      }
    ]);

    return activeUsers.map(item => ({
      date: item._id,
      registrations: item.count,
    }));
  }

  async getMonthlyOrderData(): Promise<any[]> {
    // Mock monthly data for now
    // TODO: Implement real order tracking when Order schema is available
    const months = ['Nov', 'Dec', 'Jan'];
    return months.map(month => ({
      month,
      orders: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 30000) + 10000,
    }));
  }

  async getAdminDashboardData(): Promise<AdminDashboardData> {
    const [
      stats,
      recentUsers,
      recentCompanies,
      topCompanies,
      userActivity,
      monthlyOrderData,
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentUsers(5),
      this.getRecentCompanies(3),
      this.getTopCompanies(5),
      this.getUserActivity(),
      this.getMonthlyOrderData(),
    ]);

    // Get recent product details as orders
    const recentOrders = await this.productDetailsService.findAll();

    return {
      stats,
      recentUsers,
      recentCompanies,
      recentOrders: recentOrders.slice(0, 5).map(order => ({
        id: (order as any)._id,
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        salesPerson: order.salesPerson,
        quantity: order.quantity,
        priority: order.priority,
        clothType: order.clothType,
        createdAt: (order as any).createdAt,
        deadline: order.deadline,
      })),
      topCompanies,
      userActivity,
      monthlyOrderData,
    };
  }

  async getUserDashboardData(userId: string): Promise<UserDashboardData> {
    const user = await this.userModel
      .findById(userId)
      .populate('company')
      .select('-password -emailVerificationToken -passwordResetToken')
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    // For now, return mock user-specific data
    // TODO: Implement real user order tracking
    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        company: user.company,
        createdAt: user.createdAt,
        isActive: user.isActive,
      },
      recentOrders: [], // TODO: Get user's actual orders
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      stats: {
        thisMonth: {
          orders: 0,
          spent: 0,
        },
        lastMonth: {
          orders: 0,
          spent: 0,
        },
      },
    };
  }

  async getAllUsers(): Promise<any[]> {
    const users = await this.userModel
      .find({ isActive: true })
      .populate('company')
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .exec();

    return users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      company: user.company,
      createdAt: user.createdAt,
      lastLogin: user.updatedAt, // Using updatedAt as proxy for lastLogin
      isActive: user.isActive,
    }));
  }

  async getAllCompanies(): Promise<any[]> {
    const companies = await this.companyModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();

    // Calculate mock statistics for each company
    return companies.map(company => ({
      ...company.toObject(),
      totalEmployees: Math.floor(Math.random() * 500) + 10,
      totalOrders: Math.floor(Math.random() * 50) + 1,
      totalOrderValue: Math.floor(Math.random() * 100000) + 5000,
    }));
  }
}
