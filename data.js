// DRH Leaderboard — data layer
// Fetches live from the bot's site_data.json, with local fallback snapshot.
// Class-agnostic: supports any number of classes (5inch, tinywhoop, ...)
// discovered dynamically from the payload. New classes appear automatically
// as soon as the bot exports them — no frontend change needed.

const FALLBACK = {"schema_version":"2.1","generated_at":"2026-11-06T10:56:41+00:00","season":2026,"current_track":"SimRushWeek-5","week_no":5,"rounds_completed":4,"track_display":"Sim Rush Week 5","current_leaderboard":{"5inch":[{"pilot":"anthunder","time":37.39,"quad":"Bahamut","pilot_id":"anthunder"},{"pilot":"TettixPro","time":38.623,"quad":"Carbix Zero","pilot_id":"tettixpro"},{"pilot":"DedalosFPV","time":39.183,"quad":"Bahamut","pilot_id":"dedalosfpv"},{"pilot":"tomahok","time":49.423,"quad":"Five33 Switchback","pilot_id":"tomahok"},{"pilot":"Cbeikos","time":50.665,"quad":"Five33 Switchback","pilot_id":"cbeikos"},{"pilot":"Agorastos","time":54.528,"quad":"Carbix Zero","pilot_id":"agorastos"},{"pilot":"Liapos","time":58.134,"quad":"Bahamut","pilot_id":"liapos"},{"pilot":"Torque72","time":70.324,"quad":"Bahamut","pilot_id":"torque72"},{"pilot":"Bakarim","time":120.871,"quad":"TBS Oblivion","pilot_id":"bakarim"}]},"season_standings":{"5inch":[{"pilot":"Exo_FPV","points":86,"wins":2,"podiums":4,"best":38.31,"pilot_id":"exo-fpv"},{"pilot":"ZOUP","points":83,"wins":2,"podiums":4,"best":40.165,"pilot_id":"zoup"},{"pilot":"TettixPro","points":57,"wins":0,"podiums":3,"best":42.241,"pilot_id":"tettixpro"},{"pilot":"DedalosFPV","points":46,"wins":0,"podiums":0,"best":48.537,"pilot_id":"dedalosfpv"},{"pilot":"Cbeikos","points":28,"wins":0,"podiums":0,"best":56.123,"pilot_id":"cbeikos"},{"pilot":"tomahok","points":26,"wins":0,"podiums":0,"best":63.578,"pilot_id":"tomahok"},{"pilot":"dimbazus","points":20,"wins":0,"podiums":0,"best":65.008,"pilot_id":"dimbazus"},{"pilot":"anthunder","points":18,"wins":0,"podiums":1,"best":38.87,"pilot_id":"anthunder"},{"pilot":"Liapos","points":18,"wins":0,"podiums":0,"best":70.629,"pilot_id":"liapos"},{"pilot":"Agorastos","points":16,"wins":0,"podiums":0,"best":67.587,"pilot_id":"agorastos"},{"pilot":"Torque72","points":3,"wins":0,"podiums":0,"best":110.281,"pilot_id":"torque72"},{"pilot":"fpvchucky","points":2,"wins":0,"podiums":0,"best":149.462,"pilot_id":"fpvchucky"},{"pilot":"Pontikos","points":1,"wins":0,"podiums":0,"best":null,"pilot_id":"pontikos"},{"pilot":"gkfpv13","points":0,"wins":0,"podiums":0,"best":null,"pilot_id":"gkfpv13"},{"pilot":"Bakarim","points":0,"wins":0,"podiums":0,"best":272.859,"pilot_id":"bakarim"},{"pilot":"Gaston_FPV","points":0,"wins":0,"podiums":0,"best":314.214,"pilot_id":"gaston-fpv"}]},"history":[{"date":"2026-10-11T00:07:15.960303","track":"SimRush Week1","class":"5inch","results":[{"pilot":"Exo_FPV","time":38.31,"points":25,"pilot_id":"exo-fpv"},{"pilot":"anthunder","time":38.87,"points":18,"pilot_id":"anthunder"},{"pilot":"ZOUP","time":41.353,"points":15,"pilot_id":"zoup"},{"pilot":"TettixPro","time":44.709,"points":12,"pilot_id":"tettixpro"},{"pilot":"DedalosFPV","time":50.564,"points":10,"pilot_id":"dedalosfpv"},{"pilot":"tomahok","time":66.467,"points":8,"pilot_id":"tomahok"},{"pilot":"Liapos","time":70.629,"points":6,"pilot_id":"liapos"},{"pilot":"dimbazus","time":71.886,"points":4,"pilot_id":"dimbazus"},{"pilot":"Agorastos","time":77.166,"points":2,"pilot_id":"agorastos"},{"pilot":"fpvchucky","time":160.283,"points":1,"pilot_id":"fpvchucky"}],"winner":"Exo_FPV","best_time":38.31,"pilots_count":10,"records_broken":null,"quads":{"Exo_FPV":"Bahamut","anthunder":"Bahamut","ZOUP":"Five33 Switchback","TettixPro":"Bahamut","DedalosFPV":"Bahamut","tomahok":"Five33 Switchback","Liapos":"Bahamut","dimbazus":"SniperX","Agorastos":"Bahamut","fpvchucky":"Bahamut"},"pb_events":67,"track_display":"Sim Rush Week 1","week":1,"season":2026},{"date":"2026-10-17T20:41:59.014846","track":"SimRushWeek2","class":"5inch","results":[{"pilot":"ZOUP","time":78.055,"points":25,"pilot_id":"zoup"},{"pilot":"Exo_FPV","time":78.546,"points":18,"pilot_id":"exo-fpv"},{"pilot":"TettixPro","time":85.841,"points":15,"pilot_id":"tettixpro"},{"pilot":"DedalosFPV","time":102.158,"points":12,"pilot_id":"dedalosfpv"},{"pilot":"tomahok","time":128.807,"points":10,"pilot_id":"tomahok"},{"pilot":"Cbeikos","time":132.451,"points":8,"pilot_id":"cbeikos"},{"pilot":"Agorastos","time":134.332,"points":6,"pilot_id":"agorastos"},{"pilot":"Liapos","time":140.24,"points":4,"pilot_id":"liapos"},{"pilot":"dimbazus","time":141.878,"points":2,"pilot_id":"dimbazus"},{"pilot":"fpvchucky","time":377.356,"points":1,"pilot_id":"fpvchucky"}],"winner":"ZOUP","best_time":78.055,"pilots_count":10,"records_broken":null,"quads":{"ZOUP":"Bahamut","Exo_FPV":"Bahamut","TettixPro":"Five33 Switchback","DedalosFPV":"Bahamut","tomahok":"Five33 Switchback","Cbeikos":"Five33 Switchback","Agorastos":"BetaFPV 75x","Liapos":"Bahamut","dimbazus":"Bahamut","fpvchucky":"Bahamut"},"pb_events":87,"track_display":"Sim Rush Week 2","week":2,"season":2026},{"date":"2026-10-24T18:06:02.064241","track":"SimRushWeek3","class":"5inch","results":[{"pilot":"Exo_FPV","time":39.312,"points":25,"pilot_id":"exo-fpv"},{"pilot":"ZOUP","time":40.165,"points":18,"pilot_id":"zoup"},{"pilot":"TettixPro","time":42.241,"points":15,"pilot_id":"tettixpro"},{"pilot":"DedalosFPV","time":48.537,"points":12,"pilot_id":"dedalosfpv"},{"pilot":"Cbeikos","time":56.123,"points":10,"pilot_id":"cbeikos"},{"pilot":"tomahok","time":63.578,"points":8,"pilot_id":"tomahok"},{"pilot":"dimbazus","time":65.008,"points":6,"pilot_id":"dimbazus"},{"pilot":"Agorastos","time":67.587,"points":4,"pilot_id":"agorastos"},{"pilot":"Liapos","time":73.075,"points":2,"pilot_id":"liapos"},{"pilot":"Torque72","time":110.281,"points":1,"pilot_id":"torque72"},{"pilot":"gkfpv13","time":129.287,"points":0,"pilot_id":"gkfpv13"},{"pilot":"fpvchucky","time":149.462,"points":0,"pilot_id":"fpvchucky"},{"pilot":"Bakarim","time":272.859,"points":0,"pilot_id":"bakarim"}],"winner":"Exo_FPV","best_time":39.312,"pilots_count":13,"records_broken":null,"quads":{"Exo_FPV":"Bahamut","ZOUP":"Bahamut","TettixPro":"Carbix Zero","DedalosFPV":"Bahamut","Cbeikos":"Five33 Switchback","tomahok":"Five33 Switchback","dimbazus":"Bahamut","Agorastos":"Carbix Zero","Liapos":"Bahamut","Torque72":"Five33 Switchback","fpvchucky":"Carbix Zero","Bakarim":"TBS Oblivion"},"pb_events":71,"track_display":"Sim Rush Week 3","week":3,"season":2026},{"date":"2026-10-31T18:06:03.392199","track":"SimRushWeek-4","class":"5inch","results":[{"pilot":"ZOUP","time":76.192,"points":25,"pilot_id":"zoup"},{"pilot":"Exo_FPV","time":77.595,"points":18,"pilot_id":"exo-fpv"},{"pilot":"TettixPro","time":90.149,"points":15,"pilot_id":"tettixpro"},{"pilot":"DedalosFPV","time":93.657,"points":12,"pilot_id":"dedalosfpv"},{"pilot":"Cbeikos","time":115.225,"points":10,"pilot_id":"cbeikos"},{"pilot":"dimbazus","time":134.78,"points":8,"pilot_id":"dimbazus"},{"pilot":"Liapos","time":150.967,"points":6,"pilot_id":"liapos"},{"pilot":"Agorastos","time":188.394,"points":4,"pilot_id":"agorastos"},{"pilot":"Torque72","time":214.556,"points":2,"pilot_id":"torque72"},{"pilot":"Pontikos","time":221.562,"points":1,"pilot_id":"pontikos"},{"pilot":"Gaston_FPV","time":314.214,"points":0,"pilot_id":"gaston-fpv"}],"winner":"ZOUP","best_time":76.192,"pilots_count":11,"records_broken":null,"quads":{"ZOUP":"Bahamut","Exo_FPV":"Bahamut","TettixPro":"Five33 Switchback","DedalosFPV":"Bahamut","Cbeikos":"Five33 Switchback","dimbazus":"Bahamut","Liapos":"Bahamut","Agorastos":"Carbix Zero","Torque72":"Five33 Switchback","Gaston_FPV":"Five33 Switchback"},"pb_events":71,"track_display":"Sim Rush Week 4","week":4,"season":2026}],"season_chart":{"weeks":["SimRush Week1","SimRushWeek2","SimRushWeek3","SimRushWeek-4"],"series":{"Agorastos":[2,8,12,16],"Bakarim":[0,0,0,0],"Cbeikos":[0,8,18,28],"DedalosFPV":[10,22,34,46],"Exo_FPV":[25,43,68,86],"Gaston_FPV":[0,0,0,0],"Liapos":[6,10,12,18],"Pontikos":[0,0,0,1],"TettixPro":[12,27,42,57],"Torque72":[0,0,1,3],"ZOUP":[15,40,58,83],"anthunder":[18,18,18,18],"dimbazus":[4,6,12,20],"fpvchucky":[1,2,2,2],"gkfpv13":[0,0,0,0],"tomahok":[8,18,26,26]}},"insights":{"pilots":[{"pilot":"anthunder","class":"5inch","pos":1,"time":37.39,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"TettixPro","class":"5inch","pos":2,"time":38.623,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"DedalosFPV","class":"5inch","pos":3,"time":39.183,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"tomahok","class":"5inch","pos":4,"time":49.423,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"Cbeikos","class":"5inch","pos":5,"time":50.665,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"Agorastos","class":"5inch","pos":6,"time":54.528,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"Liapos","class":"5inch","pos":7,"time":58.134,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"Torque72","class":"5inch","pos":8,"time":70.324,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null},{"pilot":"Bakarim","class":"5inch","pos":9,"time":120.871,"first_time":null,"prev_time":null,"improvements":0,"user_id":null,"pos_24h":null,"pos_change_24h":null}],"hours_at_top":{},"race_to_top":[]},"duels":{"active":[],"recent_resolved":[]},"improvements":[],"pilot_stats":{},"pilot_of_the_week":null,"hot_battles":[{"leader":"TettixPro","chaser":"DedalosFPV","gap":0.56,"days":0,"class":"5inch","opened":false},{"leader":"anthunder","chaser":"TettixPro","gap":1.233,"days":0,"class":"5inch","opened":false},{"leader":"tomahok","chaser":"Cbeikos","gap":1.242,"days":0,"class":"5inch","opened":false}],"track_reveal":null,"race_director_messages":[{"date":"2026-10-31T18:06:05","text":"🏆 Εβδομάδα ολοκληρώθηκε: «SimRushWeek-4» [5inch]\n🥇 **ZOUP**  76.192s  (+25)","tag":"announcement","id":"rd-dad960d3a2","event_type":"unknown","category":"general","priority":"normal","pilots":[],"pilot_ids":[],"track":null,"class":null,"week":null,"season":2026,"related_duel_id":null,"metadata":{},"created_at":"2026-10-31T18:06:05","expires_at":null},{"date":"2026-11-06T07:48:43","text":"📢 «SimRushWeek-5» είναι η νέα αρένα! Ας δούμε ποιος κυριαρχεί! 🏟️\n(Auto Leaderboard Upload: ON)","tag":"announcement","id":"rd-37415fb9cd","event_type":"WEEK_ANNOUNCE","category":"track_reveal","priority":"high","pilots":[],"pilot_ids":[],"track":"SimRushWeek-5","class":null,"week":5,"season":2026,"related_duel_id":null,"metadata":{},"created_at":"2026-11-06T07:48:43+00:00","expires_at":null},{"date":"2026-11-06T07:48:43","text":"«SimRushWeek-5» \n⚡ Ο **anthunder** έγραψε 37.390s στην «SimRushWeek-5» και πήρε στέμμα!","tag":"announcement","id":"rd-74d29e3fac","event_type":"NEW_TOP","category":"timing","priority":"high","pilots":["anthunder"],"pilot_ids":["anthunder"],"track":"SimRushWeek-5","class":"5inch","week":5,"season":2026,"related_duel_id":null,"metadata":{"time":37.39,"previous_time":38.87,"position":1},"created_at":"2026-11-06T07:48:43+00:00","expires_at":null},{"date":"2026-11-06T07:48:43","text":"«SimRushWeek-5» \nΡΕ ΠΑΙΔΙΑ, ο **DedalosFPV** ξαναχτύπησε: 39.183s στην «SimRushWeek-5»! Τι να πω τώρα εγώ... 😅","tag":"announcement","id":"rd-7707873cdf","event_type":"PERSONAL","category":"timing","priority":"normal","pilots":["DedalosFPV"],"pilot_ids":["dedalosfpv"],"track":"SimRushWeek-5","class":"5inch","week":5,"season":2026,"related_duel_id":null,"metadata":{"time":39.183,"previous_time":48.537},"created_at":"2026-11-06T07:48:43+00:00","expires_at":null},{"date":"2026-11-06T07:48:43","text":"🎯 Ο σκοπευτής DedalosFPV έχει κλειδώσει: 0.560s από τον TettixPro!","tag":"announcement","id":"rd-ae15d19462","event_type":"TEASER","category":"rivalries","priority":"normal","pilots":["TettixPro","DedalosFPV"],"pilot_ids":["tettixpro","dedalosfpv"],"track":"SimRushWeek-5","class":"5inch","week":5,"season":2026,"related_duel_id":null,"metadata":{"gap":0.56,"position":2},"created_at":"2026-11-06T07:48:43+00:00","expires_at":null},{"date":"2026-11-06T07:48:43","text":"⚖️ Ζυγαριά: TettixPro 0.560s μπροστά από DedalosFPV, 1 μέρα τώρα! Ποιος κερδίζει σε duel;","tag":"announcement","id":"rd-af473b690a","event_type":"DUEL_SUGGEST","category":"rivalries","priority":"normal","pilots":["TettixPro","DedalosFPV"],"pilot_ids":["tettixpro","dedalosfpv"],"track":"SimRushWeek-5","class":"5inch","week":5,"season":2026,"related_duel_id":null,"metadata":{"gap":0.56,"days":1},"created_at":"2026-11-06T07:48:43+00:00","expires_at":null},{"date":"2026-11-06T07:48:43","text":"🎉 Νέο μέλος στην πίστα! Ο **Bakarim** πέταξε για πρώτη φορά - καλή τύχη και καλές βουτιές! 🍀","tag":"announcement","id":"rd-739735d9ab","event_type":"WELCOME","category":"community","priority":"normal","pilots":["Bakarim"],"pilot_ids":["bakarim"],"track":"SimRushWeek-5","class":null,"week":5,"season":2026,"related_duel_id":null,"metadata":{},"created_at":"2026-11-06T07:48:43+00:00","expires_at":null}],"pilots":{"agorastos":{"pilot_id":"agorastos","callsign":"Agorastos","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":16,"wins":0,"podiums":0,"best":67.587,"position":10,"previous_position":8,"position_change":-2,"points_change":4,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":6,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":54.528,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"anthunder":{"pilot_id":"anthunder","callsign":"anthunder","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":18,"wins":0,"podiums":1,"best":38.87,"position":9,"previous_position":7,"position_change":-2,"points_change":0,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":1,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":37.39,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"bakarim":{"pilot_id":"bakarim","callsign":"Bakarim","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":0,"wins":0,"podiums":0,"best":272.859,"position":14,"previous_position":13,"position_change":-1,"points_change":0,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":9,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":120.871,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"cbeikos":{"pilot_id":"cbeikos","callsign":"Cbeikos","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":28,"wins":0,"podiums":0,"best":56.123,"position":5,"previous_position":6,"position_change":1,"points_change":10,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":5,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":50.665,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"dedalosfpv":{"pilot_id":"dedalosfpv","callsign":"DedalosFPV","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":46,"wins":0,"podiums":0,"best":48.537,"position":4,"previous_position":4,"position_change":0,"points_change":12,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":3,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":39.183,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"dimbazus":{"pilot_id":"dimbazus","callsign":"dimbazus","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":20,"wins":0,"podiums":0,"best":65.008,"position":7,"previous_position":10,"position_change":3,"points_change":8,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null},"exo-fpv":{"pilot_id":"exo-fpv","callsign":"Exo_FPV","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":86,"wins":2,"podiums":4,"best":38.31,"position":1,"previous_position":1,"position_change":0,"points_change":18,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null},"fpvchucky":{"pilot_id":"fpvchucky","callsign":"fpvchucky","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":2,"wins":0,"podiums":0,"best":149.462,"position":12,"previous_position":11,"position_change":-1,"points_change":0,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null},"gaston-fpv":{"pilot_id":"gaston-fpv","callsign":"Gaston_FPV","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":0,"wins":0,"podiums":0,"best":314.214,"position":15,"previous_position":14,"position_change":-1,"points_change":0,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null},"gkfpv13":{"pilot_id":"gkfpv13","callsign":"gkfpv13","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":0,"wins":0,"podiums":0,"best":null,"position":16,"previous_position":16,"position_change":0,"points_change":0,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null},"liapos":{"pilot_id":"liapos","callsign":"Liapos","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":18,"wins":0,"podiums":0,"best":70.629,"position":8,"previous_position":9,"position_change":1,"points_change":6,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":7,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":58.134,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"pontikos":{"pilot_id":"pontikos","callsign":"Pontikos","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":1,"wins":0,"podiums":0,"best":null,"position":13,"previous_position":15,"position_change":2,"points_change":1,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null},"tettixpro":{"pilot_id":"tettixpro","callsign":"TettixPro","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":57,"wins":0,"podiums":3,"best":42.241,"position":3,"previous_position":3,"position_change":0,"points_change":15,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":2,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":38.623,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"tomahok":{"pilot_id":"tomahok","callsign":"tomahok","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":26,"wins":0,"podiums":0,"best":63.578,"position":6,"previous_position":5,"position_change":-1,"points_change":0,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":4,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":49.423,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"torque72":{"pilot_id":"torque72","callsign":"Torque72","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":3,"wins":0,"podiums":0,"best":110.281,"position":11,"previous_position":12,"position_change":1,"points_change":2,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":{"track":"SimRushWeek-5","class":"5inch","current_position":8,"previous_position":null,"position_change":null,"comparison_period":null,"best_time":70.324,"previous_best_time":null,"time_improvement":null,"first_time":null},"stats":null},"zoup":{"pilot_id":"zoup","callsign":"ZOUP","avatar_url":null,"discord":null,"user_id":null,"season":{"class":"5inch","points":83,"wins":2,"podiums":4,"best":40.165,"position":2,"previous_position":2,"position_change":0,"points_change":25,"comparison_period":"previous_completed_week","comparison_reference":"SimRushWeek-4"},"current_week":null,"stats":null}},"hall_of_fame":{"period":{"type":"season","season":2026,"weeks_completed":4,"tracks":["SimRush Week1","SimRushWeek-4","SimRushWeek2","SimRushWeek3"],"note":"Υπολογίζεται από τα season_standings/history/pilot_stats του ίδιου export — όχι χειροκίνητες διακρίσεις."},"classes":{"5inch":[{"key":"most_points","title":"Κορυφή βαθμολογίας","holders":[{"pilot_id":"exo-fpv","callsign":"Exo_FPV","value":86}]},{"key":"most_wins","title":"Περισσότερες νίκες","holders":[{"pilot_id":"exo-fpv","callsign":"Exo_FPV","value":2},{"pilot_id":"zoup","callsign":"ZOUP","value":2}]},{"key":"most_podiums","title":"Περισσότερα βάθρα","holders":[{"pilot_id":"exo-fpv","callsign":"Exo_FPV","value":4},{"pilot_id":"zoup","callsign":"ZOUP","value":4}]},{"key":"best_time_season","title":"Ταχύτερος χρόνος σεζόν","holders":[{"pilot_id":"exo-fpv","callsign":"Exo_FPV","value":38.31}],"track":null}]},"overall":[]}};

const DATA_URL = "https://raw.githubusercontent.com/alefas9/velocidrone-bot-data/main/site_data.json";
// Το GitHub API σερβίρει το ίδιο αρχείο με cache μόνο 60" (το raw.githubusercontent
// έχει CDN cache 5' και ΑΓΝΟΕΙ τα query params — ο cache-buster εκεί δεν δουλεύει).
const API_URL = "https://api.github.com/repos/alefas9/velocidrone-bot-data/contents/site_data.json";
// Optional same-origin/Worker gateway. Leave unset during local development.
// This does not change the bot or its export format.
const DRH_DATA_GATEWAY = typeof window !== "undefined" &&
  typeof window.DRH_SITE_CONFIG?.dataGateway === "string" &&
  /^https:\/\//i.test(window.DRH_SITE_CONFIG.dataGateway)
    ? window.DRH_SITE_CONFIG.dataGateway : null;
const REFRESH_MS = 2 * 60 * 1000;
const DEFAULT_CLASS = "5inch";

// ---- class helpers -----------------------------------------------------------

// Pretty labels per class; unknown classes get a best-effort prettified name.
const CLASS_LABELS = {
  "5inch": '5"',
  "tinywhoop": "TinyWhoop",
  "whoop": "TinyWhoop",
  "micro": "Micro",
  "7inch": '7"'
};
function classLabel(cls) {
  if (CLASS_LABELS[cls]) return CLASS_LABELS[cls];
  return String(cls).replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Union of class keys from every place they can appear in the payload.
// `5inch` always first (default), then whatever else the bot exports, in
// first-seen order. TinyWhoop (or anything new) shows up automatically.
function discoverClasses(d) {
  const found = [];
  const push = (c) => { if (c && !found.includes(c)) found.push(c); };
  Object.keys(d.current_leaderboard || {}).forEach(push);
  Object.keys(d.season_standings || {}).forEach(push);
  (d.history || []).forEach(h => push(h.class || DEFAULT_CLASS));
  if (!found.length) found.push(DEFAULT_CLASS);
  found.sort((a, b) => (a === DEFAULT_CLASS ? -1 : b === DEFAULT_CLASS ? 1 : 0));
  return found;
}

// ---- derived data (per class) ------------------------------------------------

function computeDerived(d, cls) {
  cls = cls || DEFAULT_CLASS;
  const standings = (d.season_standings && d.season_standings[cls]) || [];
  const currentLb = (d.current_leaderboard && d.current_leaderboard[cls]) || [];

  // history weeks of THIS class only — untagged entries count as the default class
  const weeks = (d.history || [])
    .filter(h => (h.class || DEFAULT_CLASS) === cls)
    .map((h, i) => ({
      n: i + 1,
      label: "W" + (i + 1),
      week: h.week != null ? Number(h.week) : null,
      season: h.season != null ? Number(h.season) : null,
      track: h.track,
      date: h.date,
      winner: h.winner,
      best: h.best_time,
      // v2.1: records_broken μπορεί να είναι null (άγνωστο σε παλιά exports) — ποτέ fake 0
      records: h.records_broken != null ? h.records_broken : null,
      pbs: h.pb_events != null ? h.pb_events : null,
      trackDisplay: h.track_display || h.track,
      pilots: h.pilots_count || (h.results || []).length,
      results: (h.results || []).map((r, j) => ({ ...r, rank: j + 1 })),
      quads: h.quads || {}
    }));

  // cumulative points progression per pilot
  const progression = {}; // pilot -> [cumPoints after each week]
  const pilots = new Set();
  weeks.forEach(w => w.results.forEach(r => pilots.add(r.pilot)));
  pilots.forEach(p => progression[p] = []);
  const cum = {};
  [...pilots].forEach(p => (cum[p] = 0));
  weeks.forEach(w => {
    w.results.forEach(r => (cum[r.pilot] = (cum[r.pilot] || 0) + (r.points || 0)));
    [...pilots].forEach(p => progression[p].push(cum[p] || 0));
  });
  // pilots in standings but never in a week's results (new season, no flights yet):
  // give them a flat zero line so charts/lookups never hit undefined.
  standings.forEach(s => { if (!progression[s.pilot]) progression[s.pilot] = weeks.map(() => 0); });

  // per-pilot profile cards — built from standings AND current leaderboard,
  // so a brand-new pilot with no season points still opens a drawer.
  const profiles = {};
  const profileSeeds = new Map();
  standings.forEach(s => profileSeeds.set(s.pilot, { ...s }));
  currentLb.forEach(r => {
    if (!profileSeeds.has(r.pilot)) profileSeeds.set(r.pilot, { pilot: r.pilot, points: 0, wins: 0, podiums: 0, best: null });
  });
  profileSeeds.forEach((s, name) => {
    const weekResults = weeks.map(w => w.results.find(r => r.pilot === name)).map((r, i) => r ? { week: i + 1, ...r } : null);
    const quadsUsed = [...new Set(weeks.map(w => w.quads[name]).filter(Boolean))];
    const cur = currentLb.find(r => r.pilot === name);
    if (cur && cur.quad && !quadsUsed.includes(cur.quad)) quadsUsed.push(cur.quad);
    // Season best is the fastest history lap of this class, even when the bot
    // leaves standings.best null (e.g. pilots with 0 points — gkfpv13 W3).
    let best = s.best;
    if (best == null) {
      const laps = weekResults.filter(Boolean).map(r => r.time).filter(t => t != null && Number.isFinite(Number(t)));
      if (laps.length) best = Math.min(...laps);
    }
    profiles[name] = {
      ...s,
      best,
      weeks: weekResults,
      quads: quadsUsed,
      appearances: weekResults.filter(Boolean).length,
      avgRank: (() => {
        const ranks = weekResults.filter(Boolean).map(r => r.rank);
        return ranks.length ? (ranks.reduce((x, y) => x + y, 0) / ranks.length).toFixed(1) : "—";
      })(),
      form: weekResults.filter(Boolean).slice(-3).map(r => r.rank)
    };
  });

  // quad meta
  const quadCount = {};
  weeks.forEach(w => Object.values(w.quads || {}).forEach(q => { if (q) quadCount[q] = (quadCount[q] || 0) + 1; }));
  currentLb.forEach(r => { if (r.quad) quadCount[r.quad] = (quadCount[r.quad] || 0) + 1; });

  const totalRecords = weeks.every(w => w.records == null) ? null : weeks.reduce((s, w) => s + (w.records || 0), 0);
  const totalPoints = standings.reduce((s, p) => s + (p.points || 0), 0);
  const validWeekBests = weeks.map(w => Number(w.best)).filter((v, i) => weeks[i].best != null && Number.isFinite(v) && v > 0);
  const seasonBest = validWeekBests.length ? Math.min(...validWeekBests) : null;
  // Publish standings with the recomputed best so tables/HOF never show a
  // false “no time” for a pilot who actually flew (bot inconsistency).
  const standingsOut = standings.map(s => ({ ...s, best: profiles[s.pilot]?.best ?? s.best }));

  const trackReveal = d.track_reveal || null;

  // title fight: top-2 — tolerate classes with 0 or 1 pilot
  const s1 = standings[0] || null;
  const s2 = standings[1] || null;
  const s3 = standings[2] || null;

  // ---- v2 fields (από το νέο export του bot — όλα optional, με safe defaults)

  // track -> class map, για να φιλτράρεται το improvement feed ανά κλάση
  const trackClass = {};
  (d.history || []).forEach(h => { trackClass[h.track] = h.class || DEFAULT_CLASS; });

  // improvement feed: PB events της κλάσης (ή track που δεν έχει ταξινομηθεί ακόμα)
  const feed = (d.improvements || []).filter(r => !trackClass[r.track] || trackClass[r.track] === cls);

  // per-pilot PB σύνοψη -> μέσα στα profiles
  Object.values(profiles).forEach(p => {
    const st = (d.pilot_stats || {})[p.pilot];
    p.pbs = st ? st.pbs : 0;
    p.tracksImproved = st ? st.tracks_improved : 0;
    p.bestImprovementPct = st ? st.best_improvement_pct : null;
  });

  // ---- v2.1 δομημένα RD μηνύματα (feature-detected — v1 payload δουλεύει με fallbacks)
  const rdTs = (m) => {
    const s = String(m.created_at || m.date || "");
    const t = new Date((/[zZ]|[+-]\d{2}:?\d{2}$/.test(s) || !s.includes("T")) ? s : s + "Z");
    return isNaN(t) ? 0 : t.getTime();
  };
  const rdMessages = (Array.isArray(d.race_director_messages) ? d.race_director_messages : [])
    .filter(m => m && m.text)
    .map(m => ({ ...m, _ts: rdTs(m) }))
    .sort((a, b) => b._ts - a._ts);
  const RD_PRIO = { breaking: 3, high: 2, normal: 1 };
  const rdByCat = {}; // category -> πιο πρόσφατο μήνυμα (η λίστα είναι ήδη sorted desc)
  rdMessages.forEach(m => { const c = m.category || "general"; if (!rdByCat[c]) rdByCat[c] = m; });
  const rdHero = rdMessages.find(m => (RD_PRIO[m.priority] || 1) >= 2) || rdMessages[0] || null;

  return {
    cls,
    weeks, progression, profiles, quadCount, totalRecords, totalPoints, seasonBest,
    standings: standingsOut, currentLb,
    nextTrackAt: (trackReveal && trackReveal.race_start) || null,
    currentTrack: d.current_track || null,
    trackDisplay: d.track_display || d.current_track || null,
    weekNo: d.week_no != null ? d.week_no : weeks.length + 1,
    roundsCompleted: d.rounds_completed != null ? d.rounds_completed : weeks.length,
    rd: { messages: rdMessages, byCat: rdByCat, hero: rdHero },
    hallOfFame: d.hall_of_fame || null,
    pilotsV2: d.pilots || null,
    trackReveal,
    titleFight: { a: s1, b: s2, c: s3, gap: s1 && s2 ? s1.points - s2.points : null },
    feed,
    potw: d.pilot_of_the_week || null,
    hotBattles: d.hot_battles || []
  };
}

// ---- loader --------------------------------------------------------------------

let state = {
  data: null,          // raw payload
  classes: [DEFAULT_CLASS],
  derivedByClass: {},  // cls -> derived
  error: false,
  updatedAt: null, feedStatus: "snapshot"
};
let initStarted = false;

function buildState(json, error, feedStatus) {
  const classes = discoverClasses(json);
  const derivedByClass = {};
  classes.forEach(c => { derivedByClass[c] = computeDerived(json, c); });
  state = { data: json, classes, derivedByClass, error, updatedAt: new Date(), feedStatus: feedStatus || (error ? "snapshot" : "verified") };
}

// A single owner for feed requests, refreshes and published state.
// The newest successfully accepted export never rolls back to an older export.
const DATA_TIMEOUT_MS = 6000;
const DATA_TOTAL_BUDGET_MS = 12000;
const FEED_FRESH_MS = 15 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;
let fetchInFlight = null;
let lastPayloadFingerprint = JSON.stringify(FALLBACK);
let lastAcceptedGeneration = Number.isFinite(Date.parse(FALLBACK.generated_at))
  ? Date.parse(FALLBACK.generated_at) : -Infinity;

function validFeed(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
  if (!candidate.current_leaderboard || typeof candidate.current_leaderboard !== "object" ||
      Array.isArray(candidate.current_leaderboard)) return false;
  if (!candidate.season_standings || typeof candidate.season_standings !== "object" ||
      Array.isArray(candidate.season_standings)) return false;
  if (!Number.isFinite(Date.parse(candidate.generated_at))) return false;
  if (candidate.history != null && !Array.isArray(candidate.history)) return false;
  // A malformed row must never enter computeDerived(), where it could crash
  // the entire page. Validate only the fields consumed by the UI; preserve
  // optional fields for forwards-compatible bot exports.
  for (const table of [candidate.current_leaderboard, candidate.season_standings]) {
    if (!Object.values(table).every(rows => Array.isArray(rows) && rows.every(row =>
      row && typeof row === "object" && !Array.isArray(row) &&
      typeof row.pilot === "string" && row.pilot.trim().length > 0
    ))) return false;
  }
  if (candidate.history && !candidate.history.every(week =>
    week && typeof week === "object" && !Array.isArray(week) &&
    (week.results == null || (Array.isArray(week.results) && week.results.every(row =>
      row && typeof row === "object" && typeof row.pilot === "string"
    ))) && (week.quads == null || (typeof week.quads === "object" && !Array.isArray(week.quads)))
  )) return false;
  if (candidate.race_director_messages != null && !Array.isArray(candidate.race_director_messages)) return false;
  return true;
}

async function fetchFeedSource(url, options, timeoutMs = DATA_TIMEOUT_MS) {
  // Browsers support AbortController; the guard also permits deterministic
  // offline tests without DOM timers. Always clear the timeout on completion.
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller && typeof setTimeout === "function"
    ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, { ...options, ...(controller ? { signal: controller.signal } : {}) });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const candidate = await response.json();
    if (!validFeed(candidate)) throw new Error("invalid feed schema");
    return candidate;
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

async function fetchNow() {
  if (fetchInFlight) return fetchInFlight;
  fetchInFlight = fetchAndPublish();
  try { return await fetchInFlight; }
  finally { fetchInFlight = null; }
}

async function fetchAndPublish() {
  const previousStatus = state.feedStatus;
  const previousError = state.error;
  let json = null;
  let online = false;
  const sources = [
    ...(DRH_DATA_GATEWAY ? [[DRH_DATA_GATEWAY, { cache: "no-store" }]] : []),
    [API_URL, { headers: { Accept: "application/vnd.github.raw" }, cache: "no-store" }],
    [DATA_URL, { cache: "no-store" }]
  ];

  const deadline = Date.now() + DATA_TOTAL_BUDGET_MS;
  for (const [url, options] of sources) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;
    try {
      const candidate = await fetchFeedSource(url, options, Math.min(DATA_TIMEOUT_MS, remainingMs));
      const generation = Date.parse(candidate.generated_at);
      // Reject outdated or implausibly future-dated exports. A stale CDN
      // response must not overwrite a newer API result already on screen.
      if (generation < lastAcceptedGeneration || generation > Date.now() + FUTURE_SKEW_MS) {
        throw new Error("out-of-order feed generation");
      }
      json = candidate;
      online = true;
      break;
    } catch (error) {
      console.warn("[DRH] data source unavailable:", error.message);
    }
  }

  if (!json) json = state.data || FALLBACK;
  // Normalize without mutating the previously published payload or fallback.
  const normalized = {
    ...json,
    history: Array.isArray(json.history) ? json.history : [],
    // Preserve both official bot contracts: legacy list and v2 grouped duels.
    // Do not erase recent_resolved before the Completed Duels renderer sees it.
    duels: Array.isArray(json.duels) ? json.duels : (
      json.duels && typeof json.duels === "object" && !Array.isArray(json.duels)
        ? { active: Array.isArray(json.duels.active) ? json.duels.active : [],
            recent_resolved: Array.isArray(json.duels.recent_resolved) ? json.duels.recent_resolved : [] }
        : []
    )
  };
  const fingerprint = JSON.stringify(normalized);
  const dataChanged = fingerprint !== lastPayloadFingerprint || !state.updatedAt;
  const generation = Date.parse(normalized.generated_at || "");
  const age = Date.now() - generation;
  const fresh = online && Number.isFinite(age) && age >= -FUTURE_SKEW_MS && age < FEED_FRESH_MS;
  const feedStatus = online ? (fresh ? "verified" : "stale") :
    (state.updatedAt && state.feedStatus !== "snapshot" ? "stale" : "snapshot");
  const error = !fresh;

  if (dataChanged) {
    buildState(normalized, error, feedStatus);
    lastPayloadFingerprint = fingerprint;
  } else {
    state.error = error;
    state.feedStatus = feedStatus;
  }
  if (online) lastAcceptedGeneration = Math.max(lastAcceptedGeneration, generation);

  const healthChanged = previousStatus !== state.feedStatus || previousError !== state.error;
  if (dataChanged || healthChanged) {
    dispatchEvent(new CustomEvent("drh:data", {
      detail: { state, dataChanged, healthChanged }
    }));
  }
  return state;
}

// Avoid polling while the tab is hidden. On return, refresh once if the last
// attempt is old enough; fetchNow() already deduplicates concurrent requests.
let lastFetchAttemptAt = 0;
const RESUME_REFRESH_MIN_MS = 15 * 1000;
function pageIsVisible() {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}
function refreshIfVisible() {
  if (!pageIsVisible()) return Promise.resolve(state);
  lastFetchAttemptAt = Date.now();
  return fetchNow();
}
function refreshOnReturn() {
  if (pageIsVisible() && Date.now() - lastFetchAttemptAt >= RESUME_REFRESH_MIN_MS) {
    void refreshIfVisible();
  }
}
// Render a clearly labelled bundled snapshot immediately while the network
// loads. This never marks the snapshot as live and never advances the accepted
// feed generation; a fresh export may replace it as soon as it arrives.
function getInitialSnapshotState() {
  if (!state.data) buildState(FALLBACK, true, "snapshot");
  return state;
}

async function initData() {
  if (!initStarted) {
    initStarted = true;
    // Register listeners before awaiting the network, avoiding missed returns.
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("visibilitychange", refreshOnReturn);
    }
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("focus", refreshOnReturn);
    }
    const initial = refreshIfVisible();
    setInterval(refreshIfVisible, REFRESH_MS);
    await initial;
  }
  return state;
}
