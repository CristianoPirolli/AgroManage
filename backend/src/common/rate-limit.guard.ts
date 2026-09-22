import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, mixin } from '@nestjs/common';
import type { Request } from 'express';

const hits = new Map<string, number[]>();

/**
 * Rate limit simples em memória (janela deslizante por IP + rota).
 * Substitui o @nestjs/throttler: a versão atual do pacote ainda é CJS e
 * quebra ao rodar como função serverless na Vercel (Nest 12 é ESM puro).
 * Como cada instância serverless tem sua própria memória, o limite é
 * "por instância", não global — suficiente para inibir brute-force simples
 * num projeto acadêmico, mas não substitui um limitador distribuído (Redis)
 * em produção real.
 */
export function RateLimit(limit: number, windowMs: number) {
  @Injectable()
  class RateLimitGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<Request>();
      const key = `${request.route?.path ?? request.path}:${request.ip}`;
      const now = Date.now();
      const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

      if (timestamps.length >= limit) {
        throw new HttpException('Muitas tentativas. Tente novamente em instantes.', HttpStatus.TOO_MANY_REQUESTS);
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return true;
    }
  }

  return mixin(RateLimitGuard);
}
