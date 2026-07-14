/**
 * Shared Application Types
 */

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================================
// Filter Types
// ============================================================================

export type FilterOperator = 
  | "eq"      // equals
  | "ne"      // not equals
  | "gt"      // greater than
  | "gte"     // greater than or equal
  | "lt"      // less than
  | "lte"     // less than or equal
  | "in"      // in array
  | "notIn"   // not in array
  | "contains" // contains substring
  | "startsWith" // starts with
  | "endsWith"   // ends with
  | "isNull"     // is null
  | "isNotNull";  // is not null

export interface FilterCondition<T = string> {
  field: T;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterOptions {
  filters?: FilterCondition[];
  AND?: FilterOptions[];
  OR?: FilterOptions[];
  NOT?: FilterOptions;
}

// ============================================================================
// Sorting Types
// ============================================================================

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: string;
  order: SortOrder;
}

// ============================================================================
// Query Options
// ============================================================================

export interface QueryOptions<T = string> {
  pagination?: PaginationOptions;
  filters?: FilterOptions<T>[];
  sort?: SortOptions[];
  include?: Record<string, boolean | object>;
  select?: Record<string, boolean>;
  distinct?: boolean;
}

// ============================================================================
// Service Result Types
// ============================================================================

export type ServiceStatus = "success" | "error";

export interface ServiceSuccess<T = unknown> {
  status: "success";
  data: T;
  message?: string;
}

export interface ServiceError {
  status: "error";
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ServiceResult<T = unknown> = ServiceSuccess<T> | ServiceError;

// ============================================================================
// Entity Types
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface AuditableEntity extends BaseEntity {
  createdById?: string | null;
  updatedById?: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: PaginationMeta;
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  profileId: string;
  roles: string[];
  permissions: string[];
}

export interface SessionUser {
  id: string;
  userId: string;
  email: string;
  name?: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateEntityInput {
  [key: string]: unknown;
}

export interface UpdateEntityInput {
  id: string;
  [key: string]: unknown;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// Logger Types
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}
