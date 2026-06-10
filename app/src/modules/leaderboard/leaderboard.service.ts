import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';

type LeaderboardRow = {
  rank: bigint;
  userId: string;
  username: string;
  totalBets: Prisma.Decimal;
  totalWins: Prisma.Decimal;
  netProfit: Prisma.Decimal;
  betCount: bigint;
  lastPlayedAt: Date | null;
};

type CountRow = {
  total: bigint;
};

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [rows, countRows] = await Promise.all([
      this.prisma.$queryRaw<LeaderboardRow[]>`
        WITH user_totals AS (
          SELECT
            u.id AS "userId",
            u.username,
            COALESCE(SUM(CASE WHEN t.type = 'BET' THEN t.amount ELSE 0 END), 0) AS "totalBets",
            COALESCE(SUM(CASE WHEN t.type = 'WIN' THEN t.amount ELSE 0 END), 0) AS "totalWins",
            COUNT(*) FILTER (WHERE t.type = 'BET') AS "betCount",
            MAX(t.created_at) AS "lastPlayedAt"
          FROM users u
          INNER JOIN transactions t ON t.user_id = u.id
          WHERE
            t.status = 'COMPLETED'
            AND t.type IN ('BET', 'WIN')
            AND u.is_deleted = false
            AND u.is_banned = false
          GROUP BY u.id, u.username
          HAVING COALESCE(SUM(CASE WHEN t.type = 'BET' THEN t.amount ELSE 0 END), 0) > 0
        ),
        ranked AS (
          SELECT
            ROW_NUMBER() OVER (
              ORDER BY
                ("totalWins" - "totalBets") DESC,
                "totalWins" DESC,
                "totalBets" ASC,
                username ASC
            ) AS rank,
            "userId",
            username,
            "totalBets",
            "totalWins",
            ("totalWins" - "totalBets") AS "netProfit",
            "betCount",
            "lastPlayedAt"
          FROM user_totals
          WHERE ("totalWins" - "totalBets") > 0
        )
        SELECT *
        FROM ranked
        ORDER BY rank ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      this.prisma.$queryRaw<CountRow[]>`
        WITH user_totals AS (
          SELECT
            u.id AS "userId",
            COALESCE(SUM(CASE WHEN t.type = 'BET' THEN t.amount ELSE 0 END), 0) AS "totalBets",
            COALESCE(SUM(CASE WHEN t.type = 'WIN' THEN t.amount ELSE 0 END), 0) AS "totalWins"
          FROM users u
          INNER JOIN transactions t ON t.user_id = u.id
          WHERE
            t.status = 'COMPLETED'
            AND t.type IN ('BET', 'WIN')
            AND u.is_deleted = false
            AND u.is_banned = false
          GROUP BY u.id
          HAVING COALESCE(SUM(CASE WHEN t.type = 'BET' THEN t.amount ELSE 0 END), 0) > 0
        )
        SELECT COUNT(*) AS total
        FROM user_totals
        WHERE ("totalWins" - "totalBets") > 0
      `,
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    return {
      data: rows.map((row) => this.mapRow(row)),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  private mapRow(row: LeaderboardRow): LeaderboardEntryDto {
    return {
      rank: Number(row.rank),
      userId: row.userId,
      username: row.username,
      totalBets: row.totalBets.toString(),
      totalWins: row.totalWins.toString(),
      netProfit: row.netProfit.toString(),
      betCount: Number(row.betCount),
      lastPlayedAt: row.lastPlayedAt,
    };
  }
}
