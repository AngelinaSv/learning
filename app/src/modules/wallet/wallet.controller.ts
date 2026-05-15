import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { Prisma } from '@generated/prisma/client';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TransactionService } from './transaction.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet successfully created' })
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto.userId, dto.currency);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Returns the wallet balance' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  async getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  // TODO: add param waletId
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle wallet status' })
  @ApiResponse({ status: 200, description: 'Wallet status updated' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.walletService.toggleWalletStatus(id, isActive);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiResponse({ status: 200, description: 'Withdrawal successful' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  async withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);

    return this.transactionService.processWithdrawal(id, {
      amount: amountDecimal,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Returns transaction history' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.transactionService.getHistory(id, Number(page), Number(limit));
  }

  @Post('transactions/:id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a transaction' })
  @ApiResponse({ status: 200, description: 'Refund successful' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  async refundTransaction(@Param('id') txId: string) {
    return this.transactionService.processRefund(txId);
  }

  @Post('transactions/:id/dispute')
  @ApiOperation({ summary: 'Dispute a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction marked as disputed' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  async dispute(@Param('id') txId: string) {
    return this.transactionService.markAsDisputed(txId);
  }
}
