export type UserRole =
  | "member"
  | "student"
  | "instructor"
  | "office"
  | "admin";

export type PostStatus = "draft" | "published";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InstructorRow = {
  id: string;
  name: string;
  role_title: string;
  bio: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  is_visible_on_home: boolean;
  created_at: string;
  updated_at: string;
};

export type VehicleRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItemRow = {
  id: string;
  title: string;
  image_url: string | null;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettingRow = {
  id: string;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
};

export type MemberTestResultRow = {
  id: string;
  profile_id: string;
  test_title: string;
  score: number | null;
  total_questions: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  created_at: string;
};

export type StudentRow = {
  id: string;
  profile_id: string;
  student_code: string | null;
  license_class: string | null;
  registration_status: string | null;
  document_status: string | null;
  payment_status: string | null;
  assigned_instructor_id: string | null;
  created_at: string;
  updated_at: string;
};
