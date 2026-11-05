/**
 * Migration: Fabric & Norm Foundation
 *
 * 1. FabricType: remap unit pcs/roll → kg (closest physical equivalent),
 *    add enum validation.
 * 2. ConsumptionTemplate: derive adultNorm from consumptionPerSize.M,
 *    childNorm from consumptionPerSize.s9_10.
 *    For kg fabrics, values already in kg (UI was entering grams but saving as numbers —
 *    we preserve exactly what is stored; UI will display grams in Phase 4).
 *    consumptionPerSize is KEPT (never deleted).
 *
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/migrate-fabric-norms.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { FabricType } from '../fabric-types/schemas/fabric-type.schema';
import { ConsumptionTemplate } from '../consumption-templates/schemas/consumption-template.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const fabricModel = app.get<Model<FabricType>>(getModelToken(FabricType.name));
  const templateModel = app.get<Model<ConsumptionTemplate>>(getModelToken(ConsumptionTemplate.name));

  // ── 1. Remap pcs/roll units ───────────────────────────────────────────────
  const badUnitFabrics = await fabricModel.find({ unit: { $in: ['pcs', 'roll'] } }).exec();
  console.log(`\nFabrics with pcs/roll unit: ${badUnitFabrics.length}`);
  for (const f of badUnitFabrics) {
    const newUnit = f.unit === 'roll' ? 'm' : 'kg'; // roll → m (fabric rolls), pcs → kg
    console.log(`  [REMAP] "${f.nameArm}" (${f.nameEng}): ${f.unit} → ${newUnit}`);
    await fabricModel.findByIdAndUpdate(f._id, { unit: newUnit }).exec();
  }

  // ── 2. Derive adultNorm / childNorm from consumptionPerSize ───────────────
  const templates = await templateModel.find({
    $or: [{ adultNorm: { $exists: false } }, { adultNorm: null }],
  }).exec();

  console.log(`\nConsumptionTemplates needing norm derivation: ${templates.length}`);

  let updated = 0;
  let skipped = 0;

  for (const t of templates) {
    const ps = t.consumptionPerSize as any ?? {};
    const adultNorm = ps.M ?? null;
    const childNorm = ps.s9_10 ?? null;

    if (adultNorm === null && childNorm === null) {
      console.log(`  [SKIP] Template ${t._id} (${t.fabricTypeName ?? '?'} for cloth ${t.clothTypeId}): no M or s9_10 norm`);
      skipped++;
      continue;
    }

    console.log(
      `  [UPDATE] Template ${t._id} (${t.fabricTypeName ?? '?'}):` +
      ` adultNorm=${adultNorm} childNorm=${childNorm}` +
      ` (from M=${ps.M} s9_10=${ps.s9_10})`,
    );

    const updateFields: any = {};
    if (adultNorm !== null) updateFields.adultNorm = adultNorm;
    if (childNorm !== null) updateFields.childNorm = childNorm;

    await templateModel.findByIdAndUpdate(t._id, { $set: updateFields }).exec();
    updated++;
  }

  console.log(`\n── Migration complete ──────────────────────────────────────`);
  console.log(`  FabricType unit remaps:    ${badUnitFabrics.length}`);
  console.log(`  Templates updated:         ${updated}`);
  console.log(`  Templates skipped (no M):  ${skipped}`);
  console.log(`  consumptionPerSize fields: PRESERVED (not deleted)`);

  await app.close();
}

bootstrap().catch(e => { console.error(e); process.exit(1); });
