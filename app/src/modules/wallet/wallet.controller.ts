import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Prisma } from '@generated/prisma/client';
import { TransactionService } from './transaction.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
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
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  async getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  async deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);
    return this.transactionService.processDeposit(id, {
      ...dto,
      amount: amountDecimal,
    });
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({ status: 200, description: 'Withdrawal successful' })
  async withdraw(@CurrentUserId() userId: string, @Body() dto: WithdrawDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);

    return this.transactionService.processWithdrawal(userId, {
      amount: amountDecimal,
      idempotencyKey: dto.idempotencyKey,
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

  // @Post('transactions/:id/refund')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Refund a transaction' })
  // @ApiResponse({ status: 200, description: 'Refund successful' })
  // @ApiParam({ name: 'id', description: 'Transaction ID' })
  // async refundTransaction(@Param('id') txId: string) {
  //   return this.transactionService.processRefund(txId);
  // }

  // @Post('transactions/:id/dispute')
  // @ApiOperation({ summary: 'Dispute a transaction' })
  // @ApiResponse({ status: 200, description: 'Transaction marked as disputed' })
  // @ApiParam({ name: 'id', description: 'Transaction ID' })
  // async dispute(@Param('id') txId: string) {
  //   return this.transactionService.markAsDisputed(txId);
  // }
}
// function UseGuards(
//   JwtAuthGuard: any,
// ): (target: typeof WalletController) => void | typeof WalletController {
//   throw new Error('Function not implemented.');
// }
