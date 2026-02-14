export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Expedition = {
  id: string;
  year: number;
  title: string;
  date_from: string | null;
  date_to: string | null;
  place: string | null;
  participant_list: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  expedition_id: string | null;
  uploaded_by: string | null;
  image_path: string;
  caption: string | null;
  place: string | null;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PhotoTag = {
  id: string;
  photo_id: string;
  tag: string;
};

export type PhotoPerson = {
  id: string;
  photo_id: string;
  person_name: string;
  x_percent: number | null;
  y_percent: number | null;
  created_at: string;
};

export type Comment = {
  id: string;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type PhotoWithDetails = Photo & {
  expedition?: Expedition | null;
  profiles?: { display_name: string | null } | null;
  photo_tags: PhotoTag[];
  photo_persons: PhotoPerson[];
  comments_count?: number;
};

export type ExpeditionWithPhotos = Expedition & {
  photos: Photo[];
  photos_count?: number;
};
