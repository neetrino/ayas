INSERT INTO "school_teachers" (
  "id",
  "status",
  "role",
  "class_ids",
  "sort_order",
  "portrait_key",
  "translations"
) VALUES
(
  '019a1b2c-3d4e-7000-8000-000000000101',
  'PUBLISHED',
  'ballet',
  '["ballet-children","ballet-teens","stage"]'::jsonb,
  0,
  '/home/coach.png',
  $json${"hy":{"name":"Անահիտ Գրիգորյան","experience":"Քսան տարվա բեմական աշխատանք և ստուդիական դասավանդում։","biography":"Անահիտը վարում է դասական ծրագիրը։ Նա կառուցում է ստանկի աշխատանքը, կենտրոնը և այն փորձերը, որոնք դասը տանում են բեմ։"},"en":{"name":"Anahit Grigoryan","experience":"Twenty years of stage performance and studio teaching.","biography":"Anahit leads the classical program. She shapes barre, center work, and the rehearsals that carry a class to the stage."},"ru":{"name":"Анаит Григорян","experience":"Двадцать лет сценической работы и преподавания в студии.","biography":"Анаит ведет классическую программу. Она выстраивает работу у станка, центр и репетиции, которые выводят класс на сцену."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000102',
  'PUBLISHED',
  'contemporary',
  '["contemporary"]'::jsonb,
  1,
  '/home/gallery-c.png',
  $json${"hy":{"name":"Մանե Ավագյան","experience":"Տասներկու տարի ժամանակակից պարի դասավանդում։","biography":"Մանեն աշխատում է հատակի շարժման, իմպրովիզացիայի և անձնական շարժողական լեզվի հետ՝ պատանիների և մեծահասակների համար։"},"en":{"name":"Mane Avagyan","experience":"Twelve years teaching contemporary dance.","biography":"Mane works with floor work, improvisation, and a personal movement language for teens and adults."},"ru":{"name":"Мане Авагян","experience":"Двенадцать лет преподавания современного танца.","biography":"Мане работает с партером, импровизацией и личным языком движения для подростков и взрослых."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000103',
  'PUBLISHED',
  'traditional',
  '["traditional-children","traditional-adults"]'::jsonb,
  2,
  '/home/gallery-a.png',
  $json${"hy":{"name":"Տիգրան Հակոբյան","experience":"Տասնհինգ տարի հայկական պարի համույթներում։","biography":"Տիգրանը ավանդական պարը դասավանդում է որպես անսամբլային աշխատանք՝ երեխայի առաջին նախշից մինչև բեմական ծրագիր։"},"en":{"name":"Tigran Hakobyan","experience":"Fifteen years with Armenian dance ensembles.","biography":"Tigran teaches traditional dance as ensemble work, from a child's first pattern to stage repertoire."},"ru":{"name":"Тигран Акопян","experience":"Пятнадцать лет в ансамблях армянского танца.","biography":"Тигран преподает традиционный танец как ансамблевую работу: от первого детского рисунка до сценического репертуара."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000104',
  'PUBLISHED',
  'ballet',
  '["ballet-adults","open-class"]'::jsonb,
  3,
  '/home/about.png',
  $json${"hy":{"name":"Լիլիթ Սարգսյան","experience":"Ինը տարի սկսնակների և պարին վերադարձող մեծահասակների հետ։","biography":"Լիլիթը առաջին այցը պահում է պարզ և մեծահասակների բալետը կառուցում է մարմնի փորձին համապատասխան տեմպով։"},"en":{"name":"Lilit Sargsyan","experience":"Nine years with beginners and adults returning to dance.","biography":"Lilit keeps a first visit simple and builds adult ballet at a pace that respects the body's experience."},"ru":{"name":"Лилит Саргсян","experience":"Девять лет с начинающими и взрослыми, которые возвращаются к танцу.","biography":"Лилит делает первый визит простым и ведет балет для взрослых в темпе, который учитывает опыт тела."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000105',
  'PUBLISHED',
  'team',
  '["open-class"]'::jsonb,
  4,
  '/home/gallery-b.png',
  $json${"hy":{"name":"Նունե Պետրոսյան","experience":"Ութ տարի ծրագրերի, այցերի և ստուդիայի օրվա համակարգում։","biography":"Նունեն դպրոցի թիմի մաս է։ Նա ընդունում է նոր աշակերտներին, բացատրում խմբերը և պահում օրվա կարգը։"},"en":{"name":"Nune Petrosyan","experience":"Eight years coordinating programs, visits, and the studio day.","biography":"Nune is part of the school team. She welcomes new students, explains the groups, and keeps the daily schedule in order."},"ru":{"name":"Нуне Петросян","experience":"Восемь лет координации программ, визитов и студийного дня.","biography":"Нуне входит в команду школы. Она встречает новых учеников, объясняет группы и держит распорядок дня."}}$json$::jsonb
)
ON CONFLICT ("id") DO NOTHING;
