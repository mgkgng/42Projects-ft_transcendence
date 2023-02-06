import { Injectable, ExecutionContext, Catch } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler'

@Injectable()
@Catch()
export class WsThrottlerGuard extends ThrottlerGuard {
    async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const ip = client.conn.remoteAddress
        const key = this.generateKey(context, ip);
        const { totalHits } = await this.storageService.increment(key, ttl);
        if (totalHits > limit) {
            client.disconnect();
            return false;
        }
        return true;
    }
}