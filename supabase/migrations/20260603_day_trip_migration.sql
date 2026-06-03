-- Migration: move day trip recommendations from events → day_trip_suggestions
-- Tables day_trip_suggestions and day_trip_blocks were created in migration 00075_day_trip_suggestions.
-- 10 events of type='other' with titles beginning 'Day Trip:' are migrated here and then removed.

INSERT INTO day_trip_suggestions
  (trip_id, title, subtitle, departure_city, destination_city, overview, sort_order)
VALUES
  -- Casablanca base
  ('b1000000-0000-0000-0000-000000000001',
   'Mazagan (El Jadida)', 'Portuguese cistern & UNESCO ramparts — 1.5 hr south',
   'Casablanca', 'El Jadida',
   'El Jadida''s Portuguese cistern is one of Morocco''s most atmospheric spaces — a flooded Gothic vaulted hall reflected in still water. The UNESCO-listed medina ramparts are walkable and uncrowded. ~90 min drive south of Casablanca.',
   0),
  ('b1000000-0000-0000-0000-000000000001',
   'Mohammedia Corniche', 'Beach town 25 km north — local seafood, calm Atlantic',
   'Casablanca', 'Mohammedia',
   'Mohammedia is where Casablancans actually go on weekends. Its corniche is quieter, seafood restaurants are cheaper and better, and the pace is gentler. 30-min taxi.',
   1),
  ('b1000000-0000-0000-0000-000000000001',
   'Settat & Casablanca Hinterland', 'Berber market town — authentic souks, no tourists',
   'Casablanca', 'Settat',
   'Settat hosts one of Morocco''s largest weekly agricultural markets (Tuesdays). An hour south of Casablanca — a complete contrast to the coastal city and a glimpse of working Moroccan commerce.',
   2),
  -- Rabat base
  ('b1000000-0000-0000-0000-000000000001',
   'Kasbah des Oudaias — Café Maure', 'Blue-and-white alley & Café Maure terrace overlooking estuary',
   'Rabat', 'Rabat',
   'If not already done: the Kasbah des Oudaias is Rabat''s most photogenic corner. Café Maure on the terrace above the Bou Regreg serves mint tea with views of the Atlantic and Salé.',
   3),
  ('b1000000-0000-0000-0000-000000000001',
   'Mehdya & Sebou River Estuary', 'Atlantic mouth — birdwatching, Kasbah, empty beach',
   'Rabat', 'Mehdya',
   'Mehdya lagoon at the mouth of the Sebou River is an important migratory bird stopover (flamingos, storks) and has a Portuguese-era kasbah. 45 min north of Rabat.',
   4),
  ('b1000000-0000-0000-0000-000000000001',
   'Salé Medina', 'Ancient twin city — across the Bou Regreg river from Rabat',
   'Rabat', 'Salé',
   'Salé is Rabat''s older, less-visited sister city directly across the Bou Regreg. The medina predates Rabat''s and has almost no tourists. Take the short ferry across.',
   5),
  -- Burgundy base
  ('b1000000-0000-0000-0000-000000000001',
   'Abbaye de Cîteaux', 'Founding abbey of the Cistercian order — cheese & bread',
   'Gevrey-Chambertin', 'Cîteaux',
   'The Abbey of Cîteaux, 15 km from Saulon, is the founding house of the Cistercian monks who built much of Burgundy''s wine infrastructure. Still active today, selling their own cheese. Open to visitors.',
   6),
  ('b1000000-0000-0000-0000-000000000001',
   'Flavigny-sur-Ozerain', 'Medieval hilltop village — anise candy factory since 1591',
   'Gevrey-Chambertin', 'Flavigny-sur-Ozerain',
   'Flavigny is one of France''s most beautiful villages: a medieval fortified hilltop town housing the Anis de l''Abbaye de Flavigny factory, where anise candies have been made since 1591 inside a Carolingian abbey. 45 min northwest.',
   7),
  -- Loire Valley base
  ('b1000000-0000-0000-0000-000000000001',
   'Château de Beauregard', 'Portrait gallery of 327 historical figures — hidden gem',
   'Chambord', 'Beauregard',
   'Beauregard, near Blois, houses a remarkable gallery of 327 consecutive portraits of French monarchs and courtiers. Far less visited than Chambord but extraordinary as a document of Western history. 25 min from La Borde.',
   8),
  ('b1000000-0000-0000-0000-000000000001',
   'Château de Cheverny', 'Best-preserved Loire château — inspiration for Tintin''s Moulinsart',
   'Chambord', 'Cheverny',
   'Cheverny is 15 km from Chambord and considered the best-preserved and most elegantly furnished of all Loire châteaux. Its dog kennel with 70 hunting hounds is genuinely extraordinary. 20-min drive from La Borde.',
   9);

-- Remove the original events (safe: these are the only type='other' rows in this trip)
DELETE FROM events
WHERE type = 'other'
  AND title LIKE 'Day Trip:%'
  AND trip_id = 'b1000000-0000-0000-0000-000000000001';
