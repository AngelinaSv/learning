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

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto.userId, dto.currency);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  // TODO: add param waletId
  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    return this.walletService.deposit(dto);
  }

  @Patch(':id/status')
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.walletService.toggleWalletStatus(id, isActive);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    const amountDecimal = new Prisma.Decimal(dto.amount);

    return this.transactionService.processWithdrawal(
      id,
      amountDecimal,
      dto.idempotencyKey,
    );
  }

  @Get(':id/history')
  async getHistory(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.transactionService.getHistory(id, Number(page), Number(limit));
  }

  @Post('transactions/:id/refund')
  @HttpCode(HttpStatus.OK)
  async refundTransaction(@Param('id') txId: string) {
    return this.transactionService.processRefund(txId);
  }

  @Post('transactions/:id/dispute')
  async dispute(@Param('id') txId: string) {
    return this.transactionService.markAsDisputed(txId);
  }
}
