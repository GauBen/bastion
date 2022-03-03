-- Create Alice and Bob
INSERT INTO "User" ("name", "displayName", "token", "admin")
VALUES ('alice', 'Alice', nanoid(), TRUE),
  ('bob', 'Bob', nanoid(), TRUE);

-- Insert three messages
INSERT INTO "Message" ("fromId", "toId", "gif", "body")
VALUES (3, 2, false, 'Hey Alice, do you have the flag?'),
  (2, 3, false, 'Yep, it''s THCon22{C''est_la_vie_-_Weathers}'),
  (3, 2, true, '{"id":"9471604","description":"Cool GIF","width":220,"height":167,"gif":"https://media.tenor.com/images/13333cc683dcd62e7fcf82cf2624a327/tenor.gif"}');
