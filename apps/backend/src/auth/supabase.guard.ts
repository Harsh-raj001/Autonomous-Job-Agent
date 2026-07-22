import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { prisma } from '../prisma.singleton';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Automatically sync authenticated user to local database's User table
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: { email: user.email || '' },
        create: {
          id: user.id,
          email: user.email || '',
        },
      });
    } catch (dbErr: any) {
      // Don't fail auth if sync fails, but log it
      console.error(`[SupabaseAuthGuard] Failed to sync user to local DB: ${dbErr.message}`);
    }

    // Attach user to the request object so controllers can access it
    request.user = user;
    return true;
  }
}
