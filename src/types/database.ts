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
  username: string | null;
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

/** Admin/office list row — excludes identity hashes. */
export type StudentRow = {
  id: string;
  profile_id: string | null;
  student_code: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  tc_last4: string | null;
  phone_last4: string | null;
  username: string | null;
  license_class: string | null;
  registration_status: string;
  document_status: string;
  payment_status: string;
  theory_exam_date: string | null;
  driving_exam_date: string | null;
  assigned_instructor_id: string | null;
  notes: string | null;
  initial_login_used: boolean;
  must_change_password: boolean;
  activated_at: string | null;
  password_reset_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileLinkOption = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: UserRole;
};

export type InstructorOption = {
  id: string;
  name: string;
  role_title: string;
};
