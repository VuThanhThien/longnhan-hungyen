import { ApiPublic } from '@/decorators/http.decorators';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SepayIpnReqDto } from './dto/sepay-ipn.req.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiPublic({ summary: 'SePay IPN (public)', statusCode: 200 })
  @Post('sepay/ipn')
  async sepayIpn(@Body() body: SepayIpnReqDto): Promise<{ success: true }> {
    return this.paymentsService.handleSepayIpn(body);
  }
}
