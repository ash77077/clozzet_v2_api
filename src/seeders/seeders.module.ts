import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSeeder } from './admin.seeder';
import { ProductSeeder } from './product.seeder';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [AdminSeeder, ProductSeeder],
  exports: [AdminSeeder, ProductSeeder],
})
export class SeedersModule {}