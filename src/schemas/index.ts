import { z } from "zod";

export const StatusSchema = z.enum(["operational", "degraded", "major_incident"]);
export const VisibilitySchema = z.enum(["public", "private"]);
export const ProvenanceSchema = z.enum(["user", "ai"]);
export const IdSchema = z.string().min(1).max(128);
export const UsernameSchema = z.string().regex(/^[a-z0-9][a-z0-9_-]{2,29}$/);
const TimestampSchema = z.iso.datetime({ offset: true });
const BodySchema = z.string().min(1).max(10000);
const RecordFields = { id: IdSchema, created_at: TimestampSchema, updated_at: TimestampSchema };
const OwnedFields = { ...RecordFields, owner_id: IdSchema, visibility: VisibilitySchema };
const AuthoredFields = { ...OwnedFields, author_id: IdSchema, created_by: ProvenanceSchema };

export const ProfileSchema = z.strictObject({
  ...OwnedFields, username: UsernameSchema, display_name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(), avatar_url: z.url().optional(),
});
export const ServiceSchema = z.strictObject({
  ...OwnedFields, name: z.string().min(1).max(100),
  description: z.string().max(500).optional(), status: StatusSchema,
});
export const ChangelogEntrySchema = z.strictObject({
  ...AuthoredFields, service_id: IdSchema, previous_status: StatusSchema,
  status: StatusSchema, title: z.string().min(1).max(200), body: BodySchema.optional(),
});
export const EntrySchema = z.strictObject({ ...AuthoredFields, body: BodySchema });
export const CommentSchema = z.strictObject({ ...AuthoredFields, entry_id: IdSchema, body: BodySchema });

// Request schemas exclude backend-owned identity, provenance and timestamps.
export const CreateServiceSchema = ServiceSchema.pick({ name: true, description: true, status: true, visibility: true });
export const UpdateServiceSchema = CreateServiceSchema.partial().refine(value => Object.keys(value).length > 0, "At least one field is required");
export const CreateChangelogEntrySchema = ChangelogEntrySchema.pick({ service_id: true, status: true, title: true, body: true, visibility: true });
export const CreateEntrySchema = EntrySchema.pick({ body: true, visibility: true });
export const CreateCommentSchema = CommentSchema.pick({ body: true });
export type Profile = z.infer<typeof ProfileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>;
export type Entry = z.infer<typeof EntrySchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Visibility = z.infer<typeof VisibilitySchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const StatusSummarySchema = z.strictObject({
  status: StatusSchema.nullable(), service_count: z.number().int().nonnegative(), as_of: TimestampSchema,
});
export const ContextSchema = z.strictObject({
  profile: ProfileSchema, services: z.array(ServiceSchema).max(50),
  recent_changelog: z.array(ChangelogEntrySchema).max(10), recent_entries: z.array(EntrySchema).max(10),
  truncated: z.boolean(), as_of: TimestampSchema,
});
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.strictObject({ items: z.array(item).max(50), next_cursor: z.string().nullable() });
}
