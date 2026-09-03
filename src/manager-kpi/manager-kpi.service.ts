import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ManagerGoal } from './schemas/manager-goal.schema';
import { Interaction } from '../interactions/schemas/interaction.schema';
import { Meeting } from '../meetings/schemas/meeting.schema';
import { ProductDetails } from '../product-details/schemas/product-details.schema';
import { User } from '../users/schemas/user.schema';
import { SetGoalDto, SetGoalForAllDto } from './dto/set-goal.dto';

const OPEN_ENDED = 999_999_999;

const DEFAULT_TIERS = [
  { name: 'Legend',   min: 0,         max: 2_000_000,  rate: 0.05, color: '#f59e0b' },
  { name: 'Master',   min: 2_000_001, max: 5_000_000,  rate: 0.06, color: '#3b82f6' },
  { name: 'Champion', min: 5_000_001, max: OPEN_ENDED, rate: 0.07, color: '#8b5cf6' },
];

// Colors by tier index position (works for both default and custom tiers)
const TIER_PALETTE = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#6366f1'];

type TierLike = { name: string; min: number; max: number; rate: number; color?: string };

function resolveTiers(customTiers?: TierLike[] | null): TierLike[] {
  if (!customTiers || !Array.isArray(customTiers) || customTiers.length === 0) {
    return DEFAULT_TIERS;
  }
  // Convert Mongoose subdocuments to plain objects so spread works correctly in withColors
  const plain: TierLike[] = customTiers.map(t => ({
    name:  String((t as any).name  ?? ''),
    min:   Number((t as any).min)  || 0,
    max:   Number((t as any).max)  || OPEN_ENDED,
    rate:  Number((t as any).rate) || 0,
    color: (t as any).color,
  }));
  const valid = plain.every(
    t => t.name.length > 0 && isFinite(t.min) && isFinite(t.max) && isFinite(t.rate),
  );
  return valid ? plain : DEFAULT_TIERS;
}

function withColors(tiers: TierLike[]): (TierLike & { color: string })[] {
  return tiers.map((t, i) => ({
    // Explicitly extract each field so Mongoose subdocument getters are resolved
    name:  String(t.name  ?? ''),
    min:   Number(t.min)  || 0,
    max:   Number(t.max)  || OPEN_ENDED,
    rate:  Number(t.rate) || 0,
    color: t.color || TIER_PALETTE[i] || '#6b7280',
  }));
}

function getActiveTier(revenue: number, tiers: (TierLike & { color: string })[]) {
  // Walk tiers in order; the active tier is the highest bracket the manager has entered
  const reached = tiers.filter(t => revenue >= t.min);
  return reached[reached.length - 1] ?? tiers[0];
}

function calcFlatCommission(revenue: number, tiers: (TierLike & { color: string })[]): number {
  // Flat-rate model: entire revenue is multiplied by the active tier's rate.
  // e.g. revenue=6M in Champion (7%) → 6M × 7% = 420K (not a waterfall sum).
  const activeTier = getActiveTier(revenue, tiers);
  return Math.round(revenue * activeTier.rate);
}

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

@Injectable()
export class ManagerKpiService {
  constructor(
    @InjectModel(ManagerGoal.name) private goalModel: Model<ManagerGoal>,
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
    @InjectModel(Meeting.name)     private meetingModel: Model<Meeting>,
    @InjectModel(ProductDetails.name) private orderModel: Model<ProductDetails>,
    @InjectModel(User.name)        private userModel: Model<User>,
  ) {}

  // ── Goals ──────────────────────────────────────────────────────────────────

  async setGoal(dto: SetGoalDto): Promise<ManagerGoal> {
    const fields: any = {
      userId:             new Types.ObjectId(dto.userId),
      managerName:        dto.managerName,
      targetInteractions: dto.targetInteractions ?? 0,
      targetMeetings:     dto.targetMeetings ?? 0,
      targetRevenue:      dto.targetRevenue ?? 0,
    };
    if (dto.customTiers !== undefined) {
      // Sanitise before storing so we never write NaN/null rates into the DB
      fields.customTiers = Array.isArray(dto.customTiers)
        ? dto.customTiers.map((t, i) => ({
            name: String(t.name || `Tier ${i + 1}`),
            min:  Number(t.min)  || 0,
            max:  Number(t.max)  || OPEN_ENDED,
            rate: Number(t.rate) || 0,
          }))
        : null;
    }
    return this.goalModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.userId) },
      { $set: fields },
      { upsert: true, new: true },
    );
  }

  async setGoalForAll(dto: SetGoalForAllDto): Promise<ManagerGoal[]> {
    const managers = await this.getManagers();
    const results = await Promise.all(
      managers.map(m => this.setGoal({ ...dto, userId: String(m._id), managerName: `${m.firstName} ${m.lastName}` }))
    );
    return results;
  }

  async getAllGoals(): Promise<ManagerGoal[]> {
    return this.goalModel.find().sort({ managerName: 1 }).lean() as any;
  }

  async getGoalByUser(userId: string): Promise<ManagerGoal | null> {
    return this.goalModel.findOne({ userId: new Types.ObjectId(userId) }).lean() as any;
  }

  // ── KPI calculation ────────────────────────────────────────────────────────

  async getMonthlyKpi(userId: string, year: number, month: number) {
    const { start, end } = monthRange(year, month);
    const userObjId = new Types.ObjectId(userId);

    const goal = await this.goalModel.findOne({ userId: userObjId }).lean();

    // Resolve manager name — from goal first, then user record
    let managerName = goal?.managerName ?? '';
    if (!managerName) {
      const user = await this.userModel.findById(userObjId).select('firstName lastName');
      if (user) managerName = `${user.firstName} ${user.lastName}`;
    }

    // Interactions — any type, created by this user in this month
    const interactions = await this.interactionModel.countDocuments({
      createdBy: userObjId,
      interactionDate: { $gte: start, $lte: end },
    });

    // Meetings — created by this user, meetingDate in this month
    const meetings = await this.meetingModel.countDocuments({
      createdBy: userObjId,
      meetingDate: { $gte: start, $lte: end },
    });

    // Revenue — orders where salesPerson matches manager name, created in this month
    const escapedName = managerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const revenueAgg = managerName
      ? await this.orderModel.aggregate([
          {
            $match: {
              salesPerson: { $regex: new RegExp(`^${escapedName}$`, 'i') },
              createdAt:   { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id:   null,
              total: { $sum: { $ifNull: ['$expectedRevenue', 0] } },
            },
          },
        ])
      : [];
    const revenue = revenueAgg[0]?.total ?? 0;

    // Resolve tiers (custom or default) and attach colours by position
    const rawTiers  = resolveTiers(goal?.customTiers as TierLike[] | null);
    const tiers     = withColors(rawTiers);
    const tier      = getActiveTier(revenue, tiers);
    const commission = calcFlatCommission(revenue, tiers);

    // Next tier the manager hasn't reached yet (null if already at top)
    const nextTier = tiers.find(t => revenue < t.min) ?? null;

    return {
      userId,
      managerName,
      year,
      month,
      interactions,
      meetings,
      revenue,
      tier,          // active tier with color
      commission,
      tiers,         // all tiers with colors, used for the progression track
      nextTier,      // upcoming tier (null when at max) — drives progress bar UI
      goal: goal
        ? {
            targetInteractions: goal.targetInteractions,
            targetMeetings:     goal.targetMeetings,
            targetRevenue:      goal.targetRevenue,
            customTiers:        goal.customTiers ?? null,
          }
        : null,
    };
  }

  async getAllManagersMonthlyKpi(year: number, month: number) {
    const managers = await this.getManagers();
    const results  = await Promise.all(
      managers.map(m => this.getMonthlyKpi(String(m._id), year, month)),
    );
    return results;
  }

  // ── Managers list ──────────────────────────────────────────────────────────

  async getManagers() {
    return this.userModel
      .find({ role: { $in: ['manager', 'admin'] }, isActive: true })
      .select('_id firstName lastName email role')
      .sort({ firstName: 1 });
  }

  // ── Default tiers (for frontend reference cards) ───────────────────────────
  getTiers() {
    return DEFAULT_TIERS;
  }
}
