CREATE TYPE "public"."school_event_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "school_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" "school_event_status" DEFAULT 'DRAFT' NOT NULL,
	"event_date" text NOT NULL,
	"start_time" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price_amount" integer NOT NULL,
	"age_restriction" text,
	"poster_key" text,
	"seating_plan_key" text,
	"gallery_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"translations" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "school_events_duration_chk" CHECK ("school_events"."duration_minutes" >= 1 AND "school_events"."duration_minutes" <= 1440),
	CONSTRAINT "school_events_price_chk" CHECK ("school_events"."price_amount" >= 0)
);
--> statement-breakpoint
CREATE INDEX "school_events_status_date_idx" ON "school_events" USING btree ("status","event_date","start_time");--> statement-breakpoint
CREATE UNIQUE INDEX "school_events_slug_hy_uidx" ON "school_events" USING btree (("translations"->'hy'->>'slug')) WHERE "school_events"."deleted_at" IS NULL AND "school_events"."translations"->'hy'->>'slug' IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "school_events_slug_en_uidx" ON "school_events" USING btree (("translations"->'en'->>'slug')) WHERE "school_events"."deleted_at" IS NULL AND "school_events"."translations"->'en'->>'slug' IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "school_events_slug_ru_uidx" ON "school_events" USING btree (("translations"->'ru'->>'slug')) WHERE "school_events"."deleted_at" IS NULL AND "school_events"."translations"->'ru'->>'slug' IS NOT NULL;--> statement-breakpoint
INSERT INTO "school_events" (
  "id",
  "status",
  "event_date",
  "start_time",
  "duration_minutes",
  "price_amount",
  "age_restriction",
  "poster_key",
  "seating_plan_key",
  "gallery_keys",
  "translations"
) VALUES
(
  '019a1b2c-3d4e-7000-8000-000000000001',
  'PUBLISHED',
  '2026-08-12',
  '19:00',
  90,
  8000,
  NULL,
  '/home/event.png',
  '/home/map.png',
  '["/home/gallery-c.png","/home/gallery-a.png","/home/gallery-b.png"]'::jsonb,
  '{"hy":{"name":"Գարնանային գալա","slug":"spring-gala","description":"Դպրոցի գարնանային ելույթը մեկ բեմի վրա է հավաքում դասական, ժամանակակից և ավանդական պարը։ Երեկոն կիսում են բոլոր ծրագրերի սաները։","venue":"AYAS բեմ","address":"Աբովյան 15, Երևան"},"en":{"name":"Spring gala","slug":"spring-gala","description":"The school''s spring performance brings classical, contemporary, and traditional dance onto one stage. Students from every program share the evening.","venue":"AYAS stage","address":"15 Abovyan Street, Yerevan"},"ru":{"name":"Весенний гала-концерт","slug":"spring-gala","description":"Весенний концерт школы собирает на одной сцене классический, современный и традиционный танец. Вечер делят ученики всех программ.","venue":"Сцена AYAS","address":"улица Абовяна, 15, Ереван"}}'::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000002',
  'PUBLISHED',
  '2026-09-20',
  '18:30',
  75,
  5000,
  NULL,
  '/home/cta.png',
  '/home/map.png',
  '["/home/gallery-a.png","/home/coach.png","/home/gallery-d.png"]'::jsonb,
  '{"hy":{"name":"Բաց դասի երեկո","slug":"open-class-night","description":"Բաց դասերի և կարճ էտյուդների երեկո։ Կարելի է դիտել աշխատանքը ստուդիայում, ապա մնալ զրույցի դասավանդողների հետ։","venue":"AYAS ստուդիա","address":"Աբովյան 15, Երևան"},"en":{"name":"Open class night","slug":"open-class-night","description":"An evening of open classes and short studies. Watch the work in the studio, then stay for a conversation with the teachers.","venue":"AYAS studio","address":"15 Abovyan Street, Yerevan"},"ru":{"name":"Вечер открытого класса","slug":"open-class-night","description":"Вечер открытых классов и коротких этюдов. Можно посмотреть работу в студии, а затем остаться на разговор с преподавателями.","venue":"Студия AYAS","address":"улица Абовяна, 15, Ереван"}}'::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000003',
  'PUBLISHED',
  '2026-12-18',
  '19:30',
  120,
  10000,
  '12+',
  '/home/reviews-bg.png',
  '/home/map.png',
  '["/home/gallery-b.png","/home/gallery-d.png","/home/gallery-c.png"]'::jsonb,
  '{"hy":{"name":"Ձմեռային հաշվետու համերգ","slug":"winter-recital","description":"Ձմեռային հաշվետու համերգը դպրոցի բեմական երեկոն է՝ արդեն պատրաստված աշխատանքներով։ Տեղերը համարակալված են։","venue":"AYAS բեմ","address":"Աբովյան 15, Երևան"},"en":{"name":"Winter recital","slug":"winter-recital","description":"The winter recital is the school''s staged evening of prepared works. Seats are numbered.","venue":"AYAS stage","address":"15 Abovyan Street, Yerevan"},"ru":{"name":"Зимний отчётный концерт","slug":"winter-recital","description":"Зимний отчётный концерт — сценический вечер школы с подготовленными работами. Места нумерованные.","venue":"Сцена AYAS","address":"улица Абовяна, 15, Ереван"}}'::jsonb
);