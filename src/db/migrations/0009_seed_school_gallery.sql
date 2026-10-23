INSERT INTO "school_gallery_items" (
  "id",
  "status",
  "category",
  "kind",
  "sort_order",
  "image_key",
  "video_url",
  "translations"
) VALUES
(
  '019a1b2c-3d4e-7000-8000-000000000201',
  'PUBLISHED',
  'classes',
  'photo',
  0,
  '/home/class.png',
  NULL,
  $json${"hy":{"title":"Հենացատ","alt":"Աշակերտները դասի ժամանակ հենացատի մոտ"},"en":{"title":"Barre work","alt":"Students at the barre during class"},"ru":{"title":"Станок","alt":"Ученики у станка на занятии"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000202',
  'PUBLISHED',
  'classes',
  'photo',
  1,
  '/home/gallery-a.png',
  NULL,
  $json${"hy":{"title":"Կենտրոն","alt":"Պարողները ստուդիայի կենտրոնում"},"en":{"title":"Center phrase","alt":"Dancers crossing the studio floor"},"ru":{"title":"Центр","alt":"Танцующие в центре студии"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000203',
  'PUBLISHED',
  'classes',
  'video',
  2,
  '/home/class.png',
  '/gallery/barre-practice.mp4',
  $json${"hy":{"title":"Հենացատի պարապմունք","alt":"Տեսանյութ հենացատի պարապմունքից"},"en":{"title":"Barre practice","alt":"Video of barre practice in the studio"},"ru":{"title":"Экзерсис у станка","alt":"Видео экзерсиса у станка"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000204',
  'PUBLISHED',
  'performances',
  'photo',
  3,
  '/home/event.png',
  NULL,
  $json${"hy":{"title":"Գարնանային բեմ","alt":"Խումբը բեմի վրա"},"en":{"title":"Spring stage","alt":"The company on stage"},"ru":{"title":"Весенняя сцена","alt":"Группа на сцене"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000205',
  'PUBLISHED',
  'performances',
  'video',
  4,
  '/home/gallery-d.png',
  '/gallery/studio-turn.mp4',
  $json${"hy":{"title":"Պտույտ ստուդիայում","alt":"Տեսանյութ ստուդիայում արված պտույտից"},"en":{"title":"Studio turn","alt":"Video of a turn in the studio"},"ru":{"title":"Поворот в студии","alt":"Видео поворота в студии"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000206',
  'PUBLISHED',
  'competitions',
  'photo',
  5,
  '/home/gallery-b.png',
  NULL,
  $json${"hy":{"title":"Մրցույթի շարք","alt":"Պարողները մրցույթից առաջ"},"en":{"title":"Competition line","alt":"Dancers lined up before the floor"},"ru":{"title":"Линия конкурса","alt":"Танцующие перед выходом на площадку"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000207',
  'PUBLISHED',
  'backstage',
  'photo',
  6,
  '/home/gallery-c.png',
  NULL,
  $json${"hy":{"title":"Կուլիսներում","alt":"Սպասում բեմի կողքին"},"en":{"title":"In the wings","alt":"Waiting at the side of the stage"},"ru":{"title":"За кулисами","alt":"Ожидание у края сцены"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000208',
  'PUBLISHED',
  'backstage',
  'photo',
  7,
  '/home/cta.png',
  NULL,
  $json${"hy":{"title":"Արագ փոխում","alt":"Հագուստները համարների միջև"},"en":{"title":"Quick change","alt":"Costumes between numbers"},"ru":{"title":"Быстрая перемена","alt":"Костюмы между номерами"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000209',
  'PUBLISHED',
  'workshops',
  'photo',
  8,
  '/home/coach.png',
  NULL,
  $json${"hy":{"title":"Վարպետաց դաս","alt":"Վարպետաց դաս ստուդիայում"},"en":{"title":"Workshop circle","alt":"A workshop gathered in the studio"},"ru":{"title":"Мастер-класс","alt":"Мастер-класс в студии"}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000210',
  'PUBLISHED',
  'workshops',
  'photo',
  9,
  '/home/about.png',
  NULL,
  $json${"hy":{"title":"Հյուր վարպետ","alt":"Հյուր վարպետաց դաս ստուդիայում"},"en":{"title":"Guest workshop","alt":"A guest workshop in the studio"},"ru":{"title":"Приглашённый педагог","alt":"Мастер-класс приглашённого педагога"}}$json$::jsonb
)
ON CONFLICT ("id") DO NOTHING;
