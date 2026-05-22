import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { Prisma } from '@generated/prisma/client';
import { TransactionService } from './transaction.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns the wallet balance' })
  async getBalance(@CurrentUserId() userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  async deposit(@CurrentUserId() userId: string, @Body() dto: DepositDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);
    return this.transactionService.processDeposit(userId, {
      ...dto,
      amount: amountDecimal,
    });
  }

  @Get('transactions/history')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Returns transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @CurrentUserId() userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.transactionService.getHistory(userId, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  // TODO: Add withdrawal and dispute endpoints, implement idempotency and error handling in service methods
}
