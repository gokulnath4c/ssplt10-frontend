CREATE TABLE player_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date NOT NULL,
  state text NOT NULL,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  payment_amount numeric,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  city text,
  town text,
  pincode text
);

CREATE TABLE registration_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  type text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  placeholder text,
  options jsonb,
  validation_rules jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  email text
);

CREATE TABLE website_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  content jsonb NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE theme_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  theme_name text NOT NULL,
  colors jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  content jsonb NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE google_analytics_pageviews (
  pageview_id integer NOT NULL DEFAULT nextval('google_analytics_pageviews_pageview_id_seq'::regclass),
  session_id integer NOT NULL,
  page_url text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

CREATE TABLE google_analytics_sessions (
  session_id integer NOT NULL DEFAULT nextval('google_analytics_sessions_session_id_seq'::regclass),
  user_id uuid NOT NULL,
  start_time timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  page_views integer DEFAULT 0
);

CREATE TABLE admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  config_key text NOT NULL,
  registration_fee integer NOT NULL DEFAULT 699,
  gst_percentage numeric NOT NULL DEFAULT 18.00,
  razorpay_key_id text,
  razorpay_key_secret text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE google_analytics_events (
  event_id integer NOT NULL DEFAULT nextval('google_analytics_events_event_id_seq'::regclass),
  session_id integer NOT NULL,
  event_name text NOT NULL,
  event_time timestamp with time zone DEFAULT now()
);

CREATE TABLE google_analytics_user_properties (
  user_property_id integer NOT NULL DEFAULT nextval('google_analytics_user_properties_user_property_id_seq'::regclass),
  user_id uuid NOT NULL,
  property_name text NOT NULL,
  property_value text,
  updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('8a4618e8-03f7-4513-bfce-96d35a2ad86f', 'Gokulnath Padmanaban', 'gokulnath.4c@gmail.com', '+919003677496', Thu Aug 30 1984 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sat Aug 30 2025 11:36:43 GMT+0530 (India Standard Time), Sat Aug 30 2025 11:36:43 GMT+0530 (India Standard Time), NULL, NULL, NULL);
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('69022261-28e4-454f-b25b-f2a5a30c2083', 'Prusothaman sethu', 'prusothamansethu@gmail.com', '9751681041', Sun Apr 27 1980 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'All-rounder', 'pending', 'pending', '824.82', NULL, NULL, Sat Aug 30 2025 13:32:26 GMT+0530 (India Standard Time), Sat Aug 30 2025 13:32:26 GMT+0530 (India Standard Time), 'Chennai', 'City Center', '600034');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('3a88bf39-8ab8-474e-8f8c-65947f7c6c2f', 'Prusothaman sethu', 'srprusothamansethu@gmail.com', '9751681041', Sun Apr 27 1980 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'All-rounder', 'pending', 'pending', '824.82', NULL, NULL, Sat Aug 30 2025 16:55:15 GMT+0530 (India Standard Time), Sat Aug 30 2025 16:55:15 GMT+0530 (India Standard Time), 'Chennai', 'City Center', '600034');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('5c6d9e7e-d692-46e3-97a6-7a2073a23ff0', 'Gokulnath', 'Gokulnath.4c@gmail.com', '+919150248561', Sat Aug 20 2005 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sat Aug 30 2025 22:09:53 GMT+0530 (India Standard Time), Sat Aug 30 2025 22:09:53 GMT+0530 (India Standard Time), 'Chennai', 'New City', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('51d84f84-c700-48ec-8488-aee5e9c649bc', 'Gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 03:28:12 GMT+0530 (India Standard Time), Sun Aug 31 2025 03:28:12 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('0646686e-5938-4b94-ba72-445636a9522d', 'Gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 03:28:25 GMT+0530 (India Standard Time), Sun Aug 31 2025 03:28:25 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('3d9a8b15-c43e-44e8-b92f-9f1286719e9b', 'Gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 03:28:36 GMT+0530 (India Standard Time), Sun Aug 31 2025 03:28:36 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('96dc3931-726f-4b66-8253-9b1dcbf13f4d', 'Gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 03:33:29 GMT+0530 (India Standard Time), Sun Aug 31 2025 03:33:29 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('4f7814db-5165-4a47-ad3f-a09ed5b37da6', 'gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 03:34:14 GMT+0530 (India Standard Time), Sun Aug 31 2025 03:34:14 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('db95230a-32ca-4789-b5f9-5ee3700173ab', 'Goku', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 03:38:27 GMT+0530 (India Standard Time), Sun Aug 31 2025 03:38:27 GMT+0530 (India Standard Time), 'Chennai', 'City Center', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('4e8bcb50-f6e5-4323-a0f3-0721dd707328', 'gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:03:59 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:03:59 GMT+0530 (India Standard Time), 'Chennai', 'Old City', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('cc2f37c8-6eb5-4b0a-927d-a6cbc9d304e1', 'gokjul', 'gokmul@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:21:52 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:21:52 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('82e1238f-b925-434b-b40e-19b64f38a4ce', 'gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:45:41 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:45:41 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('23aa9e67-d36e-4dd6-be6d-6b12b393eae2', 'gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:48:53 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:48:53 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('73abc8f5-ce91-4b9a-9457-87f0caf54880', 'gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:51:39 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:51:39 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('5942074a-95da-4b8d-8588-9a38b7b59f53', 'Gokulnath', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:56:22 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:56:22 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('baac2a55-5d7d-4eaf-add8-b0ade1e79900', 'gokul', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Sun Aug 31 2025 04:57:17 GMT+0530 (India Standard Time), Sun Aug 31 2025 04:57:17 GMT+0530 (India Standard Time), 'Chennai', 'School Area', '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('91ed04f7-aae3-4395-98af-07befbc5d818', 'Navin Kamath', 'navin.kamath@gmail.com', '+919150247561', Wed Jan 01 1964 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Mon Sep 01 2025 14:07:15 GMT+0530 (India Standard Time), Mon Sep 01 2025 14:07:15 GMT+0530 (India Standard Time), 'Chennai', NULL, '600090');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('705bb9ee-2a53-4a18-9274-6d2443d850ea', 'Navin', 'navin@gmail.com', '+919134247561', Tue Jan 01 2002 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batsman', 'pending', 'pending', '824.82', NULL, NULL, Mon Sep 01 2025 14:11:28 GMT+0530 (India Standard Time), Mon Sep 01 2025 14:11:28 GMT+0530 (India Standard Time), 'Chennai', NULL, '600032');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('6dd5b263-e3af-449f-902a-1a90f26db608', 'Gokulnath', 'gokulnath.4c@gmail.com', '+9109150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 12:45:36 GMT+0530 (India Standard Time), Wed Sep 03 2025 12:45:36 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('2cbb3bf8-3414-4aca-965b-28b0467f299e', 'Gokulnat', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 12:55:02 GMT+0530 (India Standard Time), Wed Sep 03 2025 12:55:02 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('a40b7096-a626-4416-8492-85bd732b1523', 'Gocool', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 13:02:53 GMT+0530 (India Standard Time), Wed Sep 03 2025 13:02:53 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('eab2b18a-6bff-43ca-8133-1eb99fef431e', 'Gokul nath', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 13:15:51 GMT+0530 (India Standard Time), Wed Sep 03 2025 13:15:51 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('2f9bfa0d-b0a1-411f-babb-114348753ad6', 'Nath', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 13:18:57 GMT+0530 (India Standard Time), Wed Sep 03 2025 13:18:57 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('d4b51287-a29b-4aa1-a048-a239e29e4cc0', 'Nath', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 13:19:30 GMT+0530 (India Standard Time), Wed Sep 03 2025 13:19:30 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('231f6411-3610-4771-9d3a-70e2705c359f', 'Cheena', 'gokulnath.4c@gmail.com', '+919150247561', Sat Apr 23 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 13:27:48 GMT+0530 (India Standard Time), Wed Sep 03 2025 13:27:48 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('ee75fed1-a563-4560-bf68-50e9030849db', 'Gokulnath1', 'gokulnath.4c@gmail.com', '+919150247561', Sun Apr 22 0001 00:00:00 GMT+0553 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 13:42:02 GMT+0530 (India Standard Time), Wed Sep 03 2025 13:42:02 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('4ca63731-122e-47c4-9e08-26b7c38f3b9b', 'Gokulnath', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 15:57:45 GMT+0530 (India Standard Time), Wed Sep 03 2025 15:57:45 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('44cbb80f-ec72-4807-a926-193c4e7128bc', 'Gokulnath Padmanaban', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 16:01:02 GMT+0530 (India Standard Time), Wed Sep 03 2025 16:01:02 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('f088393c-50fe-4ed1-97c4-66d189fe3355', 'Gokulnath Padmanaban', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 16:01:26 GMT+0530 (India Standard Time), Wed Sep 03 2025 16:01:26 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('35847afd-7f4a-4cd5-904f-b2437c8d8174', 'Karthick', 'gokulnath.4c@gmail.com', '+919150247561', Tue Nov 23 2004 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 17:54:49 GMT+0530 (India Standard Time), Wed Sep 03 2025 17:54:49 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('11e53631-caf3-421f-b5af-1d6e1b476025', 'Goku', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 18:20:38 GMT+0530 (India Standard Time), Wed Sep 03 2025 18:20:38 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('c3cb9ea4-f00f-4bf2-84c1-5919af9ac583', 'Go', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 22:07:07 GMT+0530 (India Standard Time), Wed Sep 03 2025 22:07:07 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('3c784cf8-796f-42c3-89d2-209412239047', 'Go', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 22:07:34 GMT+0530 (India Standard Time), Wed Sep 03 2025 22:07:34 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO player_registrations (id, full_name, email, phone, date_of_birth, state, position, status, payment_status, payment_amount, razorpay_order_id, razorpay_payment_id, created_at, updated_at, city, town, pincode) VALUES ('d3288eaf-a1e8-4031-bf40-f93663a324b3', 'Gokulnath', 'gokulnath.4c@gmail.com', '+919150247561', Fri Apr 22 1988 00:00:00 GMT+0530 (India Standard Time), 'Tamil Nadu', 'Batting', 'pending', 'pending', NULL, NULL, NULL, Wed Sep 03 2025 22:09:22 GMT+0530 (India Standard Time), Wed Sep 03 2025 22:09:22 GMT+0530 (India Standard Time), 'Chennai', NULL, '600041');
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('12200979-3ef9-4f38-9d7a-d91f42c85926', 'fullName', 'Full Name', 'text', true, 'Enter your full name', NULL, NULL, 1, true, Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time), Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('122f4f8c-08b1-46b1-b056-d16d09bcd789', 'email', 'Email', 'email', true, 'your@email.com', NULL, NULL, 2, true, Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time), Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('35b32668-c9a4-4c8d-9233-bcf75ff2a689', 'phone', 'Phone', 'phone', true, '+91 9876543210', NULL, NULL, 3, true, Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time), Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('fbbc4735-daf0-48e5-b832-f65b259c2283', 'dateOfBirth', 'Date of Birth', 'date', true, NULL, NULL, NULL, 4, true, Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time), Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('313eb655-e90c-4d73-93ba-b71f47fdfb88', 'state', 'State/Region', 'select', true, 'Select your state', Tamil Nadu,Karnataka,Telangana,Kerala,Andhra Pradesh,Puducherry,Goa, NULL, 5, true, Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time), Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('854b2f29-9e7e-4835-a3eb-a7e38a9a693c', 'pincode', 'PIN Code', 'text', true, 'Enter your PIN code', NULL, NULL, 11, true, Sat Aug 30 2025 11:40:41 GMT+0530 (India Standard Time), Sat Aug 30 2025 11:40:41 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('b4359e23-c1e3-4217-9d63-f3d52136b4fd', 'position', 'Playing Position', 'select', true, 'Select position', Batsman,Bowler,All-rounder,Wicket Keeper,Captain, NULL, 12, true, Sat Aug 30 2025 00:18:06 GMT+0530 (India Standard Time), Sat Aug 30 2025 12:11:00 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('e2815857-c65f-487e-9d94-e865126ace68', 'city', 'City', 'select', true, 'Enter your city', Mumbai,Delhi,Bengaluru,Chennai,Kolkata,Hyderabad,Pune,Ahmedabad,Surat,Jaipur,Lucknow,Kanpur,Nagpur,Indore,Thane,Bhopal,Visakhapatnam,Pimpri-Chinchwad,Patna,Vadodara,Ghaziabad,Ludhiana,Agra,Nashik,Faridabad,Meerut,Rajkot,Kalyan-Dombivli,Vasai-Virar,Varanasi,Srinagar,Dhanbad,Jodhpur,Amritsar,Raipur,Allahabad,Coimbatore,Jabalpur,Gwalior,Vijayawada,Madurai,Guwahati,Chandigarh,Hubli-Dharwad,Mysore, NULL, 9, true, Sat Aug 30 2025 11:40:41 GMT+0530 (India Standard Time), Sat Aug 30 2025 12:11:00 GMT+0530 (India Standard Time));
INSERT INTO registration_fields (id, name, label, type, required, placeholder, options, validation_rules, display_order, is_active, created_at, updated_at) VALUES ('061f287c-44e0-41bd-841c-b780d45d3044', 'town', 'Town/Area', 'select', false, 'Enter your town or area', City Center,Old City,New City,Industrial Area,Residential Area,Commercial Area,IT Hub,Airport Area,Railway Station Area,Bus Stand Area,Market Area,Hospital Area,School Area,College Area,Government Area,Cantonment,Civil Lines,Model Town,Garden City,Satellite Town,Suburb, NULL, 10, true, Sat Aug 30 2025 11:40:41 GMT+0530 (India Standard Time), Sat Aug 30 2025 12:11:00 GMT+0530 (India Standard Time));
INSERT INTO user_roles (id, user_id, role, created_at, updated_at, email) VALUES ('ea5acf26-da04-40d5-ad53-96a465f0ea62', 'f40051e0-ec66-42c8-94e3-f123b2b61de6', 'user', Sat Aug 30 2025 14:31:19 GMT+0530 (India Standard Time), Sat Aug 30 2025 14:31:19 GMT+0530 (India Standard Time), NULL);
INSERT INTO user_roles (id, user_id, role, created_at, updated_at, email) VALUES ('bbb5d705-974b-460f-be82-e0e9176b29a6', 'aab5d7fe-f49a-4b16-8fe1-fb8ae7b702d1', 'admin', Sat Aug 30 2025 18:26:22 GMT+0530 (India Standard Time), Sat Aug 30 2025 19:55:14 GMT+0530 (India Standard Time), NULL);
INSERT INTO user_roles (id, user_id, role, created_at, updated_at, email) VALUES ('2287e82b-b2f4-40fd-b253-6bc7a86adac5', '374cac1d-3028-4c63-8046-f8df9c26b310', 'admin', Sat Aug 30 2025 20:14:10 GMT+0530 (India Standard Time), Sun Aug 31 2025 01:44:38 GMT+0530 (India Standard Time), NULL);
INSERT INTO website_content (id, section_name, content, images, created_at, updated_at) VALUES ('9d443e6e-ed71-4b91-b3d1-739ccdaca594', 'teams', [object Object], , Sat Aug 30 2025 10:01:42 GMT+0530 (India Standard Time), Sat Aug 30 2025 10:01:42 GMT+0530 (India Standard Time));
INSERT INTO website_content (id, section_name, content, images, created_at, updated_at) VALUES ('3f44e2a7-c7eb-4664-816d-7ba473bffef1', 'hero', [object Object], , Sat Aug 30 2025 10:01:42 GMT+0530 (India Standard Time), Sun Aug 31 2025 01:38:25 GMT+0530 (India Standard Time));
INSERT INTO theme_settings (id, theme_name, colors, is_active, created_at, updated_at) VALUES ('33582af9-9f49-4c92-a30e-78244f6c094f', 'SSPL Original', [object Object], true, Sat Aug 30 2025 10:01:42 GMT+0530 (India Standard Time), Sat Aug 30 2025 10:01:42 GMT+0530 (India Standard Time));
INSERT INTO pages (id, title, slug, content, is_published, meta_title, meta_description, created_at, updated_at) VALUES ('625f6ef4-d06f-4692-abdf-5a23f1697a1f', 'About SSPL T10', 'about-us', [object Object], true, 'About SSPL T10 Cricket League', 'Learn about the SSPL T10 cricket tournament, its mission, format, and vision for cricket in South India', Sat Aug 30 2025 10:07:53 GMT+0530 (India Standard Time), Sat Aug 30 2025 10:07:53 GMT+0530 (India Standard Time));
INSERT INTO pages (id, title, slug, content, is_published, meta_title, meta_description, created_at, updated_at) VALUES ('15f8b288-5270-4f8b-9981-99733d728f00', 'Tournament Rules', 'rules', [object Object], true, 'SSPL T10 Tournament Rules', 'Official rules and regulations for the SSPL T10 cricket tournament', Sat Aug 30 2025 10:07:53 GMT+0530 (India Standard Time), Sat Aug 30 2025 10:07:53 GMT+0530 (India Standard Time));
INSERT INTO pages (id, title, slug, content, is_published, meta_title, meta_description, created_at, updated_at) VALUES ('7d477393-89fb-4b92-a502-2ae5091f5a65', 'Contact Us', 'contact', [object Object], true, 'Contact SSPL T10', 'Contact information for SSPL T10 cricket tournament organizers', Sat Aug 30 2025 10:07:53 GMT+0530 (India Standard Time), Sat Aug 30 2025 10:07:53 GMT+0530 (India Standard Time));
INSERT INTO admin_settings (id, config_key, registration_fee, gst_percentage, razorpay_key_id, razorpay_key_secret, created_at, updated_at) VALUES ('230097c7-06e8-4dc7-bfab-e1561e17ad06', 'payment_config', 699, '18.00', 'rzp_test_RCjgwiFuroQnPv', '3NkgnL80YbiedQgryXeBfrj1', Tue Sep 02 2025 16:59:03 GMT+0530 (India Standard Time), Wed Sep 03 2025 00:38:41 GMT+0530 (India Standard Time));
