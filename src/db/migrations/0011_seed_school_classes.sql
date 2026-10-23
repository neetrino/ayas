INSERT INTO "school_classes" (
  "id",
  "code",
  "status",
  "direction",
  "age",
  "level",
  "sort_order",
  "translations"
) VALUES
(
  '019a1b2c-3d4e-7000-8000-000000000201',
  'ballet-children',
  'PUBLISHED',
  'ballet',
  'children',
  'beginner',
  0,
  $json${"hy":{"title":"Դասական բալետ երեխաների համար","summary":"Առաջին դիրքեր, երաժշտականություն և տարիքին համապատասխան ծանրաբեռնվածություն։ Խաղի միջով երեխան սովորում է կարգ և առաջին բեմական փորձ։"},"en":{"title":"Classical ballet for children","summary":"First positions, musicality, and a load that fits the age. Through play, a child learns order and a first experience of the stage."},"ru":{"title":"Классический балет для детей","summary":"Первые позиции, музыкальность и нагрузка по возрасту. Через игру ребёнок учится порядку и первому сценическому опыту."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000202',
  'ballet-teens',
  'PUBLISHED',
  'ballet',
  'teens',
  'intermediate',
  1,
  $json${"hy":{"title":"Դասական բալետ պատանիների համար","summary":"Ստանկա, կենտրոն և բեմական նախապատրաստություն։ Դասը խորացնում է տեխնիկան և պատրաստում ելույթի։"},"en":{"title":"Classical ballet for teens","summary":"Barre, center, and stage preparation. The class deepens technique and prepares a performance."},"ru":{"title":"Классический балет для подростков","summary":"Станок, центр и сценическая подготовка. Занятие углубляет технику и готовит к выступлению."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000203',
  'ballet-adults',
  'PUBLISHED',
  'ballet',
  'adults',
  'all',
  2,
  $json${"hy":{"title":"Դասական բալետ մեծահասակների համար","summary":"Տեխնիկա նրանց համար, ովքեր սկսում են կամ վերադառնում են պարին։ Դասը հաշվի է առնում մարմնի փորձը և տանում է դեպի արտահայտություն։"},"en":{"title":"Classical ballet for adults","summary":"Technique for people starting or returning to dance. The class respects the body's experience and moves toward expression."},"ru":{"title":"Классический балет для взрослых","summary":"Техника для тех, кто начинает или возвращается к танцу. Урок учитывает опыт тела и ведёт к выражению."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000204',
  'contemporary',
  'PUBLISHED',
  'contemporary',
  'youth',
  'all',
  3,
  $json${"hy":{"title":"Ժամանակակից պար","summary":"Հատակի աշխատանք, իմպրովիզացիա և անձնական ձայն։ Ծրագիրը նրանց համար է, ովքեր ուզում են շարժումը դարձնել սեփական լեզու։"},"en":{"title":"Contemporary dance","summary":"Floor work, improvisation, and a personal voice. For students who want movement to become their own language."},"ru":{"title":"Современный танец","summary":"Работа на полу, импровизация и личный голос. Программа для тех, кто хочет сделать движение своим языком."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000205',
  'traditional-children',
  'PUBLISHED',
  'traditional',
  'children',
  'beginner',
  4,
  $json${"hy":{"title":"Ավանդական պար երեխաների համար","summary":"Հայկական պարը՝ նախշի, խաղի և համույթի միջով։ Երեխան սովորում է շարժման կարգը և առաջին բեմական ներկայությունը։"},"en":{"title":"Traditional dance for children","summary":"Armenian dance through pattern, play, and ensemble. A child learns the order of movement and a first stage presence."},"ru":{"title":"Традиционный танец для детей","summary":"Армянский танец через узор, игру и ансамбль. Ребёнок учится порядку движения и первому сценическому присутствию."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000206',
  'traditional-adults',
  'PUBLISHED',
  'traditional',
  'adults',
  'intermediate',
  5,
  $json${"hy":{"title":"Ավանդական պար մեծահասակների համար","summary":"Համույթային աշխատանք և բեմական ծրագիր։ Դասը խորացնում է ավանդական տեխնիկան և պատրաստում ելույթի։"},"en":{"title":"Traditional dance for adults","summary":"Ensemble work and stage repertoire. The class deepens traditional technique and prepares a performance."},"ru":{"title":"Традиционный танец для взрослых","summary":"Ансамблевая работа и сценический репертуар. Занятие углубляет традиционную технику и готовит к выступлению."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000207',
  'open-class',
  'PUBLISHED',
  'open',
  'all',
  'beginner',
  6,
  $json${"hy":{"title":"Բաց դաս","summary":"Հնարավորություն ծանոթանալ դպրոցին, սրահին և դասավանդողին նախքան խումբ ընտրելը։ Մեկ հանդիպում, առանց երկար պարտավորության։"},"en":{"title":"Open class","summary":"A way to meet the school, the studio, and a teacher before choosing a group. One visit, without a long commitment."},"ru":{"title":"Открытый урок","summary":"Возможность познакомиться со школой, залом и преподавателем до выбора группы. Одна встреча без долгого обязательства."}}$json$::jsonb
),
(
  '019a1b2c-3d4e-7000-8000-000000000208',
  'stage',
  'PUBLISHED',
  'ballet',
  'teens',
  'advanced',
  7,
  $json${"hy":{"title":"Բեմական նախապատրաստություն","summary":"Փորձեր, որոնք դասը տանում են հանդիսատեսի մոտ։ Ծրագիրը նրանց համար է, ովքեր արդեն ունեն տեխնիկա և պատրաստվում են ելույթի։"},"en":{"title":"Stage preparation","summary":"Rehearsals that carry classwork to an audience. For students who already have technique and are preparing to perform."},"ru":{"title":"Сценическая подготовка","summary":"Репетиции, которые выводят урок к зрителю. Программа для тех, у кого уже есть техника и кто готовится к выступлению."}}$json$::jsonb
);
