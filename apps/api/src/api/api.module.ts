import { Module } from '@nestjs/common';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { MediaModule } from './media/media.module';
import { OrdersModule } from './orders/orders.module';
import { PostModule } from './post/post.module';
import { ProductsModule } from './products/products.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    HealthModule,
    AuthModule,
    HomeModule,
    PostModule,
    ProductsModule,
    OrdersModule,
    ArticlesModule,
    MediaModule,
    DashboardModule,
  ],
})
export class ApiModule {}
