import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ListPaymentsQueryDto } from './dto/payments.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payments (paginated, filterable)' })
  list(@Query() query: ListPaymentsQueryDto) {
    return this.payments.list(query);
  }

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Record a payment and generate its invoice' })
  record(@Body() dto: CreatePaymentDto) {
    return this.payments.record(dto);
  }

  @Get('invoices/:id/url')
  @ApiOperation({ summary: 'Get a signed URL for an invoice PDF' })
  invoiceUrl(@Param('id') id: string) {
    return this.payments.getInvoiceUrl(id);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Delete a payment and reverse assignment balance' })
  remove(@Param('id') id: string) {
    return this.payments.remove(id);
  }
}
