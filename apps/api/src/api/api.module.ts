import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SepayModule } from '../integrations/sepay/sepay.module';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PostModule } from './post/post.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UserModule } from './user/user.module';
import { VouchersModule } from './vouchers/vouchers.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 1_000,
      },
    ]),
    UserModule,
    HealthModule,
    AuthModule,
    HomeModule,
    PostModule,
    ProductsModule,
    CategoriesModule,
    ReviewsModule,
    OrdersModule,
    VouchersModule,
    ArticlesModule,
    MediaModule,
    DashboardModule,
    TransactionsModule,
    SepayModule,
    PaymentsModule,
  ],
})
export class ApiModule {}
