import { envConfigs } from '@/config';

import * as mysqlSchema from './schema.mysql';
import * as postgresSchema from './schema.postgres';
import * as sqliteSchema from './schema.sqlite';

const schema =
  envConfigs.database_provider === 'postgresql'
    ? postgresSchema
    : envConfigs.database_provider === 'mysql'
      ? mysqlSchema
      : sqliteSchema;

export const user = (schema as any).user;
export const session = (schema as any).session;
export const account = (schema as any).account;
export const verification = (schema as any).verification;
export const config = (schema as any).config;
export const taxonomy = (schema as any).taxonomy;
export const post = (schema as any).post;
export const order = (schema as any).order;
export const subscription = (schema as any).subscription;
export const credit = (schema as any).credit;
export const apikey = (schema as any).apikey;
export const role = (schema as any).role;
export const permission = (schema as any).permission;
export const rolePermission = (schema as any).rolePermission;
export const userRole = (schema as any).userRole;
export const aiTask = (schema as any).aiTask;
export const chat = (schema as any).chat;
export const chatMessage = (schema as any).chatMessage;
export const astrologyProfiles = (schema as any).astrologyProfiles;
export const rawUserPrompts = (schema as any).rawUserPrompts;
export const userKlines = (schema as any).userKlines;
export const userKlineQuota = (schema as any).userKlineQuota;
export const userReferrals = (schema as any).userReferrals;
