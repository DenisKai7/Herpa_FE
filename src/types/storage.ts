// --- Storage types ---

import type { ServiceStatus } from './common';

export type { AttachmentStatus, AttachmentInfo, FileUploadResponse, AttachmentStatusResponse } from './index';

export interface StorageBucketInfo {
  name: string;
  object_count: number;
  size_bytes: number;
}

export interface StorageStatusResponse {
  status: ServiceStatus;
  buckets: StorageBucketInfo[];
  total_size_bytes: number;
  failed_uploads: number;
}
