create table "public"."article_tags" (
    "id" uuid not null default gen_random_uuid(),
    "article_id" uuid,
    "tag_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."article_tags" enable row level security;

create table "public"."article_views" (
    "id" uuid not null default gen_random_uuid(),
    "article_id" uuid,
    "user_id" uuid,
    "ip_address" inet,
    "user_agent" text,
    "referrer" text,
    "viewed_at" timestamp with time zone default now(),
    "reading_time_seconds" integer
);


alter table "public"."article_views" enable row level security;

create table "public"."articles" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "slug" text not null,
    "subtitle" text,
    "excerpt" text,
    "content" text not null,
    "featured_image_url" text,
    "featured_image_alt" text,
    "category_id" uuid,
    "author_id" uuid,
    "status" text default 'draft'::text,
    "featured" boolean default false,
    "premium" boolean default false,
    "reading_time_minutes" integer default 5,
    "view_count" integer default 0,
    "like_count" integer default 0,
    "bookmark_count" integer default 0,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."articles" enable row level security;

create table "public"."authors" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "bio" text,
    "avatar_url" text,
    "email" text,
    "website_url" text,
    "twitter_handle" text,
    "linkedin_url" text,
    "featured" boolean default false,
    "article_count" integer default 0,
    "total_views" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."authors" enable row level security;

create table "public"."bookmarks" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "article_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."bookmarks" enable row level security;

create table "public"."bull_rooms" (
    "id" uuid not null default gen_random_uuid(),
    "slug" character varying(50) not null,
    "name" character varying(100) not null,
    "topic" text not null,
    "description" text,
    "banner_photo_url" text,
    "is_active" boolean default true,
    "is_featured" boolean default false,
    "sort_order" integer default 0,
    "message_count" integer default 0,
    "last_activity_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."bull_rooms" enable row level security;

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "description" text,
    "featured" boolean default false,
    "sort_order" integer default 0,
    "article_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."categories" enable row level security;

create table "public"."profile_operation_logs" (
    "id" uuid not null default gen_random_uuid(),
    "operation" text not null,
    "user_id" uuid,
    "profile_id" uuid,
    "operation_time" timestamp with time zone default now(),
    "details" jsonb
);


create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "permissions" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."roles" enable row level security;

create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "description" text,
    "featured" boolean default false,
    "article_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."tags" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null,
    "email" text not null,
    "username" text not null,
    "subscription_tier" text default 'free'::text,
    "newsletter_subscribed" boolean default true,
    "preferences" jsonb default '{"onboardingCompleted": false}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_admin" boolean default false
);


alter table "public"."user_profiles" enable row level security;

create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "role_id" uuid,
    "granted_by" uuid,
    "granted_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone
);


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX article_tags_article_id_tag_id_key ON public.article_tags USING btree (article_id, tag_id);

CREATE UNIQUE INDEX article_tags_pkey ON public.article_tags USING btree (id);

CREATE UNIQUE INDEX article_views_pkey ON public.article_views USING btree (id);

CREATE UNIQUE INDEX articles_pkey ON public.articles USING btree (id);

CREATE UNIQUE INDEX articles_slug_key ON public.articles USING btree (slug);

CREATE UNIQUE INDEX authors_pkey ON public.authors USING btree (id);

CREATE UNIQUE INDEX authors_slug_key ON public.authors USING btree (slug);

CREATE UNIQUE INDEX bookmarks_pkey ON public.bookmarks USING btree (id);

CREATE UNIQUE INDEX bookmarks_user_id_article_id_key ON public.bookmarks USING btree (user_id, article_id);

CREATE UNIQUE INDEX bull_rooms_pkey ON public.bull_rooms USING btree (id);

CREATE UNIQUE INDEX bull_rooms_slug_key ON public.bull_rooms USING btree (slug);

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);

CREATE INDEX idx_article_tags_article_id ON public.article_tags USING btree (article_id);

CREATE INDEX idx_article_tags_tag_id ON public.article_tags USING btree (tag_id);

CREATE INDEX idx_article_views_article_id ON public.article_views USING btree (article_id);

CREATE INDEX idx_article_views_viewed_at ON public.article_views USING btree (viewed_at DESC);

CREATE INDEX idx_articles_author_id ON public.articles USING btree (author_id);

CREATE INDEX idx_articles_category_id ON public.articles USING btree (category_id);

CREATE INDEX idx_articles_featured ON public.articles USING btree (featured);

CREATE INDEX idx_articles_published_at ON public.articles USING btree (published_at DESC);

CREATE INDEX idx_articles_status ON public.articles USING btree (status);

CREATE INDEX idx_articles_view_count ON public.articles USING btree (view_count DESC);

CREATE INDEX idx_authors_featured ON public.authors USING btree (featured);

CREATE INDEX idx_bookmarks_user_id ON public.bookmarks USING btree (user_id);

CREATE INDEX idx_bull_rooms_active ON public.bull_rooms USING btree (is_active);

CREATE INDEX idx_bull_rooms_featured ON public.bull_rooms USING btree (is_featured);

CREATE INDEX idx_bull_rooms_last_activity ON public.bull_rooms USING btree (last_activity_at);

CREATE INDEX idx_bull_rooms_slug ON public.bull_rooms USING btree (slug);

CREATE INDEX idx_bull_rooms_sort_order ON public.bull_rooms USING btree (sort_order);

CREATE INDEX idx_categories_featured ON public.categories USING btree (featured);

CREATE INDEX idx_roles_name ON public.roles USING btree (name);

CREATE INDEX idx_tags_featured ON public.tags USING btree (featured);

CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);

CREATE INDEX idx_user_profiles_username ON public.user_profiles USING btree (username);

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

CREATE UNIQUE INDEX profile_operation_logs_pkey ON public.profile_operation_logs USING btree (id);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX tags_slug_key ON public.tags USING btree (slug);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_username_key ON public.user_profiles USING btree (username);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_role_id_key ON public.user_roles USING btree (user_id, role_id);

alter table "public"."article_tags" add constraint "article_tags_pkey" PRIMARY KEY using index "article_tags_pkey";

alter table "public"."article_views" add constraint "article_views_pkey" PRIMARY KEY using index "article_views_pkey";

alter table "public"."articles" add constraint "articles_pkey" PRIMARY KEY using index "articles_pkey";

alter table "public"."authors" add constraint "authors_pkey" PRIMARY KEY using index "authors_pkey";

alter table "public"."bookmarks" add constraint "bookmarks_pkey" PRIMARY KEY using index "bookmarks_pkey";

alter table "public"."bull_rooms" add constraint "bull_rooms_pkey" PRIMARY KEY using index "bull_rooms_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."profile_operation_logs" add constraint "profile_operation_logs_pkey" PRIMARY KEY using index "profile_operation_logs_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."article_tags" add constraint "article_tags_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE not valid;

alter table "public"."article_tags" validate constraint "article_tags_article_id_fkey";

alter table "public"."article_tags" add constraint "article_tags_article_id_tag_id_key" UNIQUE using index "article_tags_article_id_tag_id_key";

alter table "public"."article_tags" add constraint "article_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."article_tags" validate constraint "article_tags_tag_id_fkey";

alter table "public"."article_views" add constraint "article_views_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE not valid;

alter table "public"."article_views" validate constraint "article_views_article_id_fkey";

alter table "public"."articles" add constraint "articles_author_id_fkey" FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL not valid;

alter table "public"."articles" validate constraint "articles_author_id_fkey";

alter table "public"."articles" add constraint "articles_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL not valid;

alter table "public"."articles" validate constraint "articles_category_id_fkey";

alter table "public"."articles" add constraint "articles_slug_key" UNIQUE using index "articles_slug_key";

alter table "public"."articles" add constraint "articles_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;

alter table "public"."articles" validate constraint "articles_status_check";

alter table "public"."authors" add constraint "authors_slug_key" UNIQUE using index "authors_slug_key";

alter table "public"."bookmarks" add constraint "bookmarks_article_id_fkey" FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE not valid;

alter table "public"."bookmarks" validate constraint "bookmarks_article_id_fkey";

alter table "public"."bookmarks" add constraint "bookmarks_user_id_article_id_key" UNIQUE using index "bookmarks_user_id_article_id_key";

alter table "public"."bull_rooms" add constraint "bull_rooms_slug_key" UNIQUE using index "bull_rooms_slug_key";

alter table "public"."categories" add constraint "categories_name_key" UNIQUE using index "categories_name_key";

alter table "public"."categories" add constraint "categories_slug_key" UNIQUE using index "categories_slug_key";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

alter table "public"."tags" add constraint "tags_slug_key" UNIQUE using index "tags_slug_key";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_subscription_tier_check" CHECK ((subscription_tier = ANY (ARRAY['free'::text, 'premium'::text, 'pro'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_subscription_tier_check";

alter table "public"."user_profiles" add constraint "user_profiles_username_key" UNIQUE using index "user_profiles_username_key";

alter table "public"."user_roles" add constraint "user_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_role_id_key" UNIQUE using index "user_roles_user_id_role_id_key";

set check_function_bodies = off;

create or replace view "public"."bull_rooms_stats" as  SELECT id,
    slug,
    name,
    message_count,
    last_activity_at,
    0 AS recent_message_count
   FROM bull_rooms br
  WHERE (is_active = true)
  ORDER BY sort_order;


CREATE OR REPLACE FUNCTION public.create_missing_user_profiles()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_record RECORD;
  profile_count integer := 0;
BEGIN
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data,
      au.email_confirmed_at
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    BEGIN
      INSERT INTO user_profiles (id, email, full_name, email_verified)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(
          user_record.raw_user_meta_data->>'username',
          user_record.raw_user_meta_data->>'full_name', 
          split_part(user_record.email, '@', 1)
        ),
        user_record.email_confirmed_at IS NOT NULL
      );
      profile_count := profile_count + 1;
      RAISE NOTICE 'Created profile for user %', user_record.email;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN profile_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    -- Check if user profile already exists
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = new.id) THEN
        RETURN new;
    END IF;
    
    insert into public.user_profiles (
        id,
        email,
        username,
        email_verified,
        subscription_tier,
        newsletter_subscribed,
        preferences
    ) values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
        new.email_confirmed_at is not null,
        'free',
        true,
        '{"onboardingCompleted": false}'::jsonb
    );
    return new;
exception
    when unique_violation then
        -- If we still get a unique violation, try with a modified username
        insert into public.user_profiles (
            id,
            email,
            username,
            email_verified,
            subscription_tier,
            newsletter_subscribed,
            preferences
        ) values (
            new.id,
            new.email,
            coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)) || '_' || substr(md5(random()::text), 1, 4),
            new.email_confirmed_at is not null,
            'free',
            true,
            '{"onboardingCompleted": false}'::jsonb
        );
        return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_personalized_articles(user_uuid uuid, limit_count integer DEFAULT 10)
 RETURNS TABLE(article_id uuid, title text, subtitle text, category_name text, author_name text, published_at timestamp with time zone, view_count integer, relevance_score numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_prefs jsonb;
  user_interests text[];
  user_risk_tolerance text;
  user_investor_type text;
BEGIN
  -- Get user preferences
  SELECT preferences INTO user_prefs
  FROM user_profiles 
  WHERE id = user_uuid;

  -- Extract preference values
  user_interests := ARRAY(SELECT jsonb_array_elements_text(user_prefs->'interests'));
  user_risk_tolerance := user_prefs->>'riskTolerance';
  user_investor_type := user_prefs->>'investorType';

  -- Return personalized articles with relevance scoring
  RETURN QUERY
  SELECT 
    a.id as article_id,
    a.title,
    a.subtitle,
    c.name as category_name,
    au.name as author_name,
    a.published_at,
    a.view_count,
    (
      -- Base score
      1.0 +
      -- Boost for matching interests (category or tags)
      CASE 
        WHEN c.name = ANY(user_interests) THEN 2.0
        WHEN EXISTS (
          SELECT 1 FROM article_tags at
          JOIN tags t ON at.tag_id = t.id
          WHERE at.article_id = a.id AND t.name = ANY(user_interests)
        ) THEN 1.5
        ELSE 0.0
      END +
      -- Boost for recent articles
      CASE 
        WHEN a.published_at > now() - interval '7 days' THEN 1.0
        WHEN a.published_at > now() - interval '30 days' THEN 0.5
        ELSE 0.0
      END +
      -- Boost for popular articles
      CASE 
        WHEN a.view_count > 10000 THEN 1.0
        WHEN a.view_count > 5000 THEN 0.5
        ELSE 0.0
      END
    )::numeric as relevance_score
  FROM articles a
  LEFT JOIN categories c ON a.category_id = c.id
  LEFT JOIN authors au ON a.author_id = au.id
  WHERE 
    a.status = 'published'
    AND a.published_at IS NOT NULL
  ORDER BY relevance_score DESC, a.published_at DESC
  LIMIT limit_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_preferences(user_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is requesting their own preferences or is admin
  IF auth.uid() != user_uuid AND NOT user_has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Cannot access other user preferences';
  END IF;

  RETURN (
    SELECT preferences 
    FROM user_profiles 
    WHERE id = user_uuid
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_profile_by_email(user_email text)
 RETURNS TABLE(id uuid, email text, username text, email_verified boolean, subscription_tier text, newsletter_subscribed boolean, preferences jsonb, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.username,
        up.email_verified,
        up.subscription_tier,
        up.newsletter_subscribed,
        up.preferences,
        up.created_at,
        up.updated_at
    FROM public.user_profiles up
    WHERE up.email = user_email;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid)
 RETURNS TABLE(role_name text, permissions jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user profile exists first
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = user_uuid) THEN
    -- User profile doesn't exist, return empty result
    RETURN;
  END IF;
  
  -- Return roles for users who have them
  RETURN QUERY
  SELECT r.name, r.permissions
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid 
  AND (ur.expires_at IS NULL OR ur.expires_at > now());
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.log_profile_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Log the deletion
  PERFORM log_profile_operation(
    'profile_deleted',
    OLD.id,
    OLD.id,
    jsonb_build_object(
      'email', OLD.email,
      'username', OLD.username,
      'deletion_time', now()
    )
  );
  
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_profile_operation(operation text, user_id uuid DEFAULT NULL::uuid, profile_id uuid DEFAULT NULL::uuid, details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO profile_operation_logs (
    operation,
    user_id,
    profile_id,
    details
  )
  VALUES (
    operation,
    user_id,
    profile_id,
    details
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_article_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update category article count
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET article_count = article_count + 1 
    WHERE id = NEW.category_id;
    
    UPDATE authors 
    SET article_count = article_count + 1 
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET article_count = article_count - 1 
    WHERE id = OLD.category_id;
    
    UPDATE authors 
    SET article_count = article_count - 1 
    WHERE id = OLD.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle category changes
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      UPDATE categories 
      SET article_count = article_count - 1 
      WHERE id = OLD.category_id;
      
      UPDATE categories 
      SET article_count = article_count + 1 
      WHERE id = NEW.category_id;
    END IF;
    
    -- Handle author changes
    IF OLD.author_id IS DISTINCT FROM NEW.author_id THEN
      UPDATE authors 
      SET article_count = article_count - 1 
      WHERE id = OLD.author_id;
      
      UPDATE authors 
      SET article_count = article_count + 1 
      WHERE id = NEW.author_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_tag_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags 
    SET article_count = article_count + 1 
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags 
    SET article_count = article_count - 1 
    WHERE id = OLD.tag_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_preferences(user_uuid uuid, new_preferences jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is updating their own preferences or is admin
  IF auth.uid() != user_uuid AND NOT user_has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Cannot update other user preferences';
  END IF;

  UPDATE user_profiles 
  SET 
    preferences = preferences || new_preferences,
    updated_at = now()
  WHERE id = user_uuid;

  RETURN FOUND;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid uuid, resource text, action text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid 
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
    AND r.permissions->resource ? action
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid uuid, role_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid 
    AND r.name = role_name
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$function$
;

grant delete on table "public"."article_tags" to "anon";

grant insert on table "public"."article_tags" to "anon";

grant references on table "public"."article_tags" to "anon";

grant select on table "public"."article_tags" to "anon";

grant trigger on table "public"."article_tags" to "anon";

grant truncate on table "public"."article_tags" to "anon";

grant update on table "public"."article_tags" to "anon";

grant delete on table "public"."article_tags" to "authenticated";

grant insert on table "public"."article_tags" to "authenticated";

grant references on table "public"."article_tags" to "authenticated";

grant select on table "public"."article_tags" to "authenticated";

grant trigger on table "public"."article_tags" to "authenticated";

grant truncate on table "public"."article_tags" to "authenticated";

grant update on table "public"."article_tags" to "authenticated";

grant delete on table "public"."article_tags" to "service_role";

grant insert on table "public"."article_tags" to "service_role";

grant references on table "public"."article_tags" to "service_role";

grant select on table "public"."article_tags" to "service_role";

grant trigger on table "public"."article_tags" to "service_role";

grant truncate on table "public"."article_tags" to "service_role";

grant update on table "public"."article_tags" to "service_role";

grant delete on table "public"."article_views" to "anon";

grant insert on table "public"."article_views" to "anon";

grant references on table "public"."article_views" to "anon";

grant select on table "public"."article_views" to "anon";

grant trigger on table "public"."article_views" to "anon";

grant truncate on table "public"."article_views" to "anon";

grant update on table "public"."article_views" to "anon";

grant delete on table "public"."article_views" to "authenticated";

grant insert on table "public"."article_views" to "authenticated";

grant references on table "public"."article_views" to "authenticated";

grant select on table "public"."article_views" to "authenticated";

grant trigger on table "public"."article_views" to "authenticated";

grant truncate on table "public"."article_views" to "authenticated";

grant update on table "public"."article_views" to "authenticated";

grant delete on table "public"."article_views" to "service_role";

grant insert on table "public"."article_views" to "service_role";

grant references on table "public"."article_views" to "service_role";

grant select on table "public"."article_views" to "service_role";

grant trigger on table "public"."article_views" to "service_role";

grant truncate on table "public"."article_views" to "service_role";

grant update on table "public"."article_views" to "service_role";

grant delete on table "public"."articles" to "anon";

grant insert on table "public"."articles" to "anon";

grant references on table "public"."articles" to "anon";

grant select on table "public"."articles" to "anon";

grant trigger on table "public"."articles" to "anon";

grant truncate on table "public"."articles" to "anon";

grant update on table "public"."articles" to "anon";

grant delete on table "public"."articles" to "authenticated";

grant insert on table "public"."articles" to "authenticated";

grant references on table "public"."articles" to "authenticated";

grant select on table "public"."articles" to "authenticated";

grant trigger on table "public"."articles" to "authenticated";

grant truncate on table "public"."articles" to "authenticated";

grant update on table "public"."articles" to "authenticated";

grant delete on table "public"."articles" to "service_role";

grant insert on table "public"."articles" to "service_role";

grant references on table "public"."articles" to "service_role";

grant select on table "public"."articles" to "service_role";

grant trigger on table "public"."articles" to "service_role";

grant truncate on table "public"."articles" to "service_role";

grant update on table "public"."articles" to "service_role";

grant delete on table "public"."authors" to "anon";

grant insert on table "public"."authors" to "anon";

grant references on table "public"."authors" to "anon";

grant select on table "public"."authors" to "anon";

grant trigger on table "public"."authors" to "anon";

grant truncate on table "public"."authors" to "anon";

grant update on table "public"."authors" to "anon";

grant delete on table "public"."authors" to "authenticated";

grant insert on table "public"."authors" to "authenticated";

grant references on table "public"."authors" to "authenticated";

grant select on table "public"."authors" to "authenticated";

grant trigger on table "public"."authors" to "authenticated";

grant truncate on table "public"."authors" to "authenticated";

grant update on table "public"."authors" to "authenticated";

grant delete on table "public"."authors" to "service_role";

grant insert on table "public"."authors" to "service_role";

grant references on table "public"."authors" to "service_role";

grant select on table "public"."authors" to "service_role";

grant trigger on table "public"."authors" to "service_role";

grant truncate on table "public"."authors" to "service_role";

grant update on table "public"."authors" to "service_role";

grant delete on table "public"."bookmarks" to "anon";

grant insert on table "public"."bookmarks" to "anon";

grant references on table "public"."bookmarks" to "anon";

grant select on table "public"."bookmarks" to "anon";

grant trigger on table "public"."bookmarks" to "anon";

grant truncate on table "public"."bookmarks" to "anon";

grant update on table "public"."bookmarks" to "anon";

grant delete on table "public"."bookmarks" to "authenticated";

grant insert on table "public"."bookmarks" to "authenticated";

grant references on table "public"."bookmarks" to "authenticated";

grant select on table "public"."bookmarks" to "authenticated";

grant trigger on table "public"."bookmarks" to "authenticated";

grant truncate on table "public"."bookmarks" to "authenticated";

grant update on table "public"."bookmarks" to "authenticated";

grant delete on table "public"."bookmarks" to "service_role";

grant insert on table "public"."bookmarks" to "service_role";

grant references on table "public"."bookmarks" to "service_role";

grant select on table "public"."bookmarks" to "service_role";

grant trigger on table "public"."bookmarks" to "service_role";

grant truncate on table "public"."bookmarks" to "service_role";

grant update on table "public"."bookmarks" to "service_role";

grant delete on table "public"."bull_rooms" to "anon";

grant insert on table "public"."bull_rooms" to "anon";

grant references on table "public"."bull_rooms" to "anon";

grant select on table "public"."bull_rooms" to "anon";

grant trigger on table "public"."bull_rooms" to "anon";

grant truncate on table "public"."bull_rooms" to "anon";

grant update on table "public"."bull_rooms" to "anon";

grant delete on table "public"."bull_rooms" to "authenticated";

grant insert on table "public"."bull_rooms" to "authenticated";

grant references on table "public"."bull_rooms" to "authenticated";

grant select on table "public"."bull_rooms" to "authenticated";

grant trigger on table "public"."bull_rooms" to "authenticated";

grant truncate on table "public"."bull_rooms" to "authenticated";

grant update on table "public"."bull_rooms" to "authenticated";

grant delete on table "public"."bull_rooms" to "service_role";

grant insert on table "public"."bull_rooms" to "service_role";

grant references on table "public"."bull_rooms" to "service_role";

grant select on table "public"."bull_rooms" to "service_role";

grant trigger on table "public"."bull_rooms" to "service_role";

grant truncate on table "public"."bull_rooms" to "service_role";

grant update on table "public"."bull_rooms" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."profile_operation_logs" to "anon";

grant insert on table "public"."profile_operation_logs" to "anon";

grant references on table "public"."profile_operation_logs" to "anon";

grant select on table "public"."profile_operation_logs" to "anon";

grant trigger on table "public"."profile_operation_logs" to "anon";

grant truncate on table "public"."profile_operation_logs" to "anon";

grant update on table "public"."profile_operation_logs" to "anon";

grant delete on table "public"."profile_operation_logs" to "authenticated";

grant insert on table "public"."profile_operation_logs" to "authenticated";

grant references on table "public"."profile_operation_logs" to "authenticated";

grant select on table "public"."profile_operation_logs" to "authenticated";

grant trigger on table "public"."profile_operation_logs" to "authenticated";

grant truncate on table "public"."profile_operation_logs" to "authenticated";

grant update on table "public"."profile_operation_logs" to "authenticated";

grant delete on table "public"."profile_operation_logs" to "service_role";

grant insert on table "public"."profile_operation_logs" to "service_role";

grant references on table "public"."profile_operation_logs" to "service_role";

grant select on table "public"."profile_operation_logs" to "service_role";

grant trigger on table "public"."profile_operation_logs" to "service_role";

grant truncate on table "public"."profile_operation_logs" to "service_role";

grant update on table "public"."profile_operation_logs" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

create policy "Article tags are viewable by everyone"
on "public"."article_tags"
as permissive
for select
to public
using (true);


create policy "Anyone can create article views"
on "public"."article_views"
as permissive
for insert
to public
with check (true);


create policy "Users can view their own article views"
on "public"."article_views"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Articles are manageable by content managers"
on "public"."articles"
as permissive
for all
to authenticated
using ((user_has_permission(auth.uid(), 'articles'::text, 'read'::text) OR user_has_permission(auth.uid(), 'articles'::text, 'update'::text) OR user_has_permission(auth.uid(), 'articles'::text, 'delete'::text)))
with check ((user_has_permission(auth.uid(), 'articles'::text, 'create'::text) OR user_has_permission(auth.uid(), 'articles'::text, 'update'::text)));


create policy "Published articles are viewable by everyone"
on "public"."articles"
as permissive
for select
to public
using ((status = 'published'::text));


create policy "Authors are manageable by content managers"
on "public"."authors"
as permissive
for all
to authenticated
using ((user_has_permission(auth.uid(), 'authors'::text, 'read'::text) OR user_has_permission(auth.uid(), 'authors'::text, 'update'::text) OR user_has_permission(auth.uid(), 'authors'::text, 'delete'::text)))
with check ((user_has_permission(auth.uid(), 'authors'::text, 'create'::text) OR user_has_permission(auth.uid(), 'authors'::text, 'update'::text)));


create policy "Authors are viewable by everyone"
on "public"."authors"
as permissive
for select
to public
using (true);


create policy "Users can manage their own bookmarks"
on "public"."bookmarks"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Allow admins to manage bull rooms"
on "public"."bull_rooms"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_profiles
  WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true)))));


create policy "Allow authenticated users to read all bull rooms"
on "public"."bull_rooms"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Allow public read access to active bull rooms"
on "public"."bull_rooms"
as permissive
for select
to public
using ((is_active = true));


create policy "Categories are manageable by content managers"
on "public"."categories"
as permissive
for all
to authenticated
using ((user_has_permission(auth.uid(), 'categories'::text, 'read'::text) OR user_has_permission(auth.uid(), 'categories'::text, 'update'::text) OR user_has_permission(auth.uid(), 'categories'::text, 'delete'::text)))
with check ((user_has_permission(auth.uid(), 'categories'::text, 'create'::text) OR user_has_permission(auth.uid(), 'categories'::text, 'update'::text)));


create policy "Categories are viewable by everyone"
on "public"."categories"
as permissive
for select
to public
using (true);


create policy "Roles are manageable by admins"
on "public"."roles"
as permissive
for all
to authenticated
using (user_has_role(auth.uid(), 'admin'::text))
with check (user_has_role(auth.uid(), 'admin'::text));


create policy "Roles are viewable by authenticated users"
on "public"."roles"
as permissive
for select
to authenticated
using (true);


create policy "Tags are manageable by content managers"
on "public"."tags"
as permissive
for all
to authenticated
using ((user_has_permission(auth.uid(), 'tags'::text, 'read'::text) OR user_has_permission(auth.uid(), 'tags'::text, 'update'::text) OR user_has_permission(auth.uid(), 'tags'::text, 'delete'::text)))
with check ((user_has_permission(auth.uid(), 'tags'::text, 'create'::text) OR user_has_permission(auth.uid(), 'tags'::text, 'update'::text)));


create policy "Tags are viewable by everyone"
on "public"."tags"
as permissive
for select
to public
using (true);


create policy "Service role can manage all profiles"
on "public"."user_profiles"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Users can update own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Users can view own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "User roles are manageable by admins"
on "public"."user_roles"
as permissive
for all
to authenticated
using (user_has_role(auth.uid(), 'admin'::text))
with check (user_has_role(auth.uid(), 'admin'::text));


create policy "User roles are viewable by the user or admins"
on "public"."user_roles"
as permissive
for select
to authenticated
using ((user_id = auth.uid()));


CREATE TRIGGER update_tag_counts_trigger AFTER INSERT OR DELETE ON public.article_tags FOR EACH ROW EXECUTE FUNCTION update_tag_counts();

CREATE TRIGGER update_article_counts_trigger AFTER INSERT OR DELETE OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_article_counts();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bull_rooms_updated_at BEFORE UPDATE ON public.bull_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


