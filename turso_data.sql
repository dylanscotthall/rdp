PRAGMA foreign_keys=OFF;

INSERT INTO "Location" VALUES(1,'Scottburgh Beach','South Africa','-30.1639','30.4531','2026-06-19T19:44:59.459+00:00');

INSERT INTO "Image" VALUES('cmql9fjgz0000rqsbr9cpdlhi','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00817.webp','',NULL,NULL,'2026-06-19T18:26:22.163+00:00',NULL,1,1,0);
INSERT INTO "Image" VALUES('cmql9fl090001rqsbhz12qy5g','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC09177.webp',NULL,NULL,NULL,'2026-06-19T18:26:24.153+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9fmks0002rqsbzod0gwot','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC09195.webp',NULL,NULL,NULL,'2026-06-19T18:26:26.188+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9fn7w0003rqsbeoj80eni','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC09356.webp',NULL,NULL,NULL,'2026-06-19T18:26:27.020+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9fo4f0004rqsbkhegfcls','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC09253.webp',NULL,NULL,NULL,'2026-06-19T18:26:28.191+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9fosh0005rqsb1e7uj6kn','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC09369.webp',NULL,NULL,NULL,'2026-06-19T18:26:29.057+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9g1od0006rqsbqe965khc','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC09381.webp',NULL,NULL,NULL,'2026-06-19T18:26:45.757+00:00',1,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9gmbz0007rqsb9et9zm9a','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00424-2.webp',NULL,NULL,NULL,'2026-06-19T18:27:12.527+00:00',NULL,1,4,0);
INSERT INTO "Image" VALUES('cmql9gmzi0008rqsbcrunh60r','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00425-5.webp',NULL,NULL,NULL,'2026-06-19T18:27:13.374+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9gnbp0009rqsbxww5mw6d','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00425-7.webp',NULL,NULL,NULL,'2026-06-19T18:27:13.813+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9gnl2000arqsb3rlovl24','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00425-8.webp',NULL,NULL,NULL,'2026-06-19T18:27:14.150+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmql9gody000brqsbd58utamt','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00343.webp',NULL,NULL,NULL,'2026-06-19T18:27:15.190+00:00',NULL,1,3,0);
INSERT INTO "Image" VALUES('cmql9gosm000crqsb0z09klsf','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC01019.webp',NULL,NULL,NULL,'2026-06-19T18:27:15.718+00:00',NULL,1,2,0);
INSERT INTO "Image" VALUES('cmql9gpba000drqsbpps17juz','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00390.webp',NULL,NULL,NULL,'2026-06-19T18:27:16.390+00:00',NULL,0,NULL,0);
INSERT INTO "Image" VALUES('cmqlcjozg00007gsbuxldvnbf','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/photos/web/DSC00424-2.webp',NULL,NULL,NULL,'2026-06-19T19:53:34.780+00:00',NULL,0,NULL,0);

INSERT INTO "Video" VALUES('cmqmscl3x00019isbfras17ff','https://pub-173a4c1c82904352a056d6fdb8a68209.r2.dev/videos/web/SHARK .mp4',NULL,NULL,'2026-06-20T20:03:43.197+00:00',NULL,1,0,1);

INSERT INTO "Theme" VALUES(1,'Surf','2026-06-19T18:25:59.983+00:00','cmql9g1od0006rqsbqe965khc',NULL);
INSERT INTO "Theme" VALUES(2,'Diving','2026-06-19T18:26:16.392+00:00','cmql9fjgz0000rqsbr9cpdlhi','cmqmscl3x00019isbfras17ff');
INSERT INTO "Theme" VALUES(3,'Environment','2026-06-19T18:27:09.533+00:00','cmql9gosm000crqsb0z09klsf',NULL);

INSERT INTO "ThemeImage" VALUES(2,'cmql9fjgz0000rqsbr9cpdlhi');
INSERT INTO "ThemeImage" VALUES(2,'cmql9fl090001rqsbhz12qy5g');
INSERT INTO "ThemeImage" VALUES(2,'cmql9fmks0002rqsbzod0gwot');
INSERT INTO "ThemeImage" VALUES(2,'cmql9fn7w0003rqsbeoj80eni');
INSERT INTO "ThemeImage" VALUES(2,'cmql9fo4f0004rqsbkhegfcls');
INSERT INTO "ThemeImage" VALUES(2,'cmql9fosh0005rqsb1e7uj6kn');
INSERT INTO "ThemeImage" VALUES(1,'cmql9g1od0006rqsbqe965khc');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gmbz0007rqsb9et9zm9a');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gmzi0008rqsbcrunh60r');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gnbp0009rqsbxww5mw6d');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gnl2000arqsb3rlovl24');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gody000brqsbd58utamt');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gosm000crqsb0z09klsf');
INSERT INTO "ThemeImage" VALUES(3,'cmql9gpba000drqsbpps17juz');

INSERT INTO "ThemeVideo" VALUES(2,'cmqmscl3x00019isbfras17ff');

PRAGMA foreign_keys=ON;
