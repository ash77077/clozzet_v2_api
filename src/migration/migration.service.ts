import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Customer,
  CustomerStatus,
} from '../customers/schemas/customer.schema';
import { Interaction } from '../interactions/schemas/interaction.schema';

export interface DryRunSample {
  _id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  lastContactedAt?: Date | null;
  nextFollowUpAt?: Date | null;
  assignedTo?: string | null;
}

export interface DryRunReport {
  generatedAt: Date;
  mode: 'dry-run';
  totals: {
    customers: number;
    byStatus: Record<string, number>;
    withInteractions: number;
    withoutInteractions: number;
  };
  wouldCreateDeals: {
    inNewLeadStage: number;
    inContactedStage: number;
    skippedActiveOrInactive: number;
  };
  followUpFlags: {
    missingNextFollowUp: number;
    overdueNextFollowUp: number;
  };
  samples: {
    newLeadStage: DryRunSample[];
    contactedStage: DryRunSample[];
    skipped: DryRunSample[];
    missingNextFollowUp: DryRunSample[];
    overdueNextFollowUp: DryRunSample[];
  };
}

@Injectable()
export class MigrationService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Interaction.name)
    private readonly interactionModel: Model<Interaction>,
  ) {}

  async dryRun(): Promise<DryRunReport> {
    const now = new Date();

    const customers = await this.customerModel.find().lean().exec();

    const byStatus: Record<string, number> = {};
    for (const c of customers) {
      const key = c.status || 'Unknown';
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }

    const leadIds = customers
      .filter((c) => c.status === CustomerStatus.LEAD)
      .map((c) => c._id as Types.ObjectId);

    // Get distinct customerIds with any interaction (for leads only — only used for leads bucketing)
    const leadIdsWithInteractions = new Set<string>();
    if (leadIds.length > 0) {
      const rows = await this.interactionModel
        .aggregate([
          { $match: { customerId: { $in: leadIds } } },
          { $group: { _id: '$customerId' } },
        ])
        .exec();
      for (const r of rows) {
        leadIdsWithInteractions.add(String(r._id));
      }
    }

    // All-customers counts of with/without interactions (requested in totals)
    const allCustomerIds = customers.map((c) => c._id as Types.ObjectId);
    const allWithInteractions = new Set<string>();
    if (allCustomerIds.length > 0) {
      const rows = await this.interactionModel
        .aggregate([
          { $match: { customerId: { $in: allCustomerIds } } },
          { $group: { _id: '$customerId' } },
        ])
        .exec();
      for (const r of rows) {
        allWithInteractions.add(String(r._id));
      }
    }

    const newLeadBucket: typeof customers = [];
    const contactedBucket: typeof customers = [];
    const skippedBucket: typeof customers = [];
    const missingFollowUp: typeof customers = [];
    const overdueFollowUp: typeof customers = [];

    for (const c of customers) {
      if (c.status === CustomerStatus.LEAD) {
        if (leadIdsWithInteractions.has(String(c._id))) {
          contactedBucket.push(c);
        } else {
          newLeadBucket.push(c);
        }
        if (!c.nextFollowUpAt) {
          missingFollowUp.push(c);
        } else if (new Date(c.nextFollowUpAt) < now) {
          overdueFollowUp.push(c);
        }
      } else {
        // Active or Inactive — no deal created
        skippedBucket.push(c);
      }
    }

    const toSample = (list: typeof customers, n = 10): DryRunSample[] =>
      list.slice(0, n).map((c) => ({
        _id: String(c._id),
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        status: c.status,
        lastContactedAt: c.lastContactedAt ?? null,
        nextFollowUpAt: c.nextFollowUpAt ?? null,
        assignedTo: c.assignedTo ? String(c.assignedTo) : null,
      }));

    return {
      generatedAt: now,
      mode: 'dry-run',
      totals: {
        customers: customers.length,
        byStatus,
        withInteractions: allWithInteractions.size,
        withoutInteractions: customers.length - allWithInteractions.size,
      },
      wouldCreateDeals: {
        inNewLeadStage: newLeadBucket.length,
        inContactedStage: contactedBucket.length,
        skippedActiveOrInactive: skippedBucket.length,
      },
      followUpFlags: {
        missingNextFollowUp: missingFollowUp.length,
        overdueNextFollowUp: overdueFollowUp.length,
      },
      samples: {
        newLeadStage: toSample(newLeadBucket),
        contactedStage: toSample(contactedBucket),
        skipped: toSample(skippedBucket),
        missingNextFollowUp: toSample(missingFollowUp),
        overdueNextFollowUp: toSample(overdueFollowUp),
      },
    };
  }
}
