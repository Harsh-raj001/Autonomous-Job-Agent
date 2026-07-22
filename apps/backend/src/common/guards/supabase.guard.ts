import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = user;
      return true;
    } catch (error) {
      this.logger.error('Auth verification failed', error);
      throw new UnauthorizedException('Auth verification failed');
    }
  }
}
