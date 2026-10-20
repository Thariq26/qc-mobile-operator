/**
 * Master Data Constants for QC Defect Monitoring System
 * Contains exactly:
 * - 121 Master Parts
 * - 29 Production Machines
 * - 33 Defect Types
 */

export const MASTER_PARTS = [
  {
    "id": 1,
    "partNumber": "PT-1001",
    "partName": "Front Bracket A",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 2,
    "partNumber": "PT-1002",
    "partName": "Rear Flange B",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 3,
    "partNumber": "PT-1003",
    "partName": "Side Reinforce L",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 4,
    "partNumber": "PT-1004",
    "partName": "Main Stay Plate",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 5,
    "partNumber": "PT-1005",
    "partName": "Exhaust Hanger C",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 6,
    "partNumber": "PT-1006",
    "partName": "Seat Cross Member",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 7,
    "partNumber": "PT-1007",
    "partName": "Bumper Stay Lower",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 8,
    "partNumber": "PT-1008",
    "partName": "Engine Mount Bracket",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 9,
    "partNumber": "PT-1009",
    "partName": "Floor Center Crossmember",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 10,
    "partNumber": "PT-1010",
    "partName": "Fuel Tank Strap L",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 11,
    "partNumber": "PT-1011",
    "partName": "Front Gusset Plate E",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 12,
    "partNumber": "PT-1012",
    "partName": "Rear Mounting Base F",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 13,
    "partNumber": "PT-1013",
    "partName": "Upper Lever Guide A",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 14,
    "partNumber": "PT-1014",
    "partName": "Lower Shield Plate B",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 15,
    "partNumber": "PT-1015",
    "partName": "Left Clamp Guide C",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 16,
    "partNumber": "PT-1016",
    "partName": "Right Stopper Plate D",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 17,
    "partNumber": "PT-1017",
    "partName": "Center Angle Base E",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 18,
    "partNumber": "PT-1018",
    "partName": "Inner Pedal Arm F",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 19,
    "partNumber": "PT-1019",
    "partName": "Outer Collar Spacer A",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 20,
    "partNumber": "PT-1020",
    "partName": "Side Connector Bar B",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 21,
    "partNumber": "PT-1021",
    "partName": "Front Stiffener Inner C",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 22,
    "partNumber": "PT-1022",
    "partName": "Rear Stiffener Outer D",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 23,
    "partNumber": "PT-1023",
    "partName": "Upper Bulkhead Brace E",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 24,
    "partNumber": "PT-1024",
    "partName": "Lower Tunnel Reinforce F",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 25,
    "partNumber": "PT-1025",
    "partName": "Left Apron Member A",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 26,
    "partNumber": "PT-1026",
    "partName": "Right Bracket B",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 27,
    "partNumber": "PT-1027",
    "partName": "Center Flange C",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 28,
    "partNumber": "PT-1028",
    "partName": "Inner Reinforce D",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 29,
    "partNumber": "PT-1029",
    "partName": "Outer Stay Plate E",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 30,
    "partNumber": "PT-1030",
    "partName": "Side Hanger F",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 31,
    "partNumber": "PT-1031",
    "partName": "Front Cross Member A",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 32,
    "partNumber": "PT-1032",
    "partName": "Rear Support Arm B",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 33,
    "partNumber": "PT-1033",
    "partName": "Upper Hinge Upper C",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 34,
    "partNumber": "PT-1034",
    "partName": "Lower Hinge Lower D",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 35,
    "partNumber": "PT-1035",
    "partName": "Left Cover Plate E",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 36,
    "partNumber": "PT-1036",
    "partName": "Right Gusset Plate F",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 37,
    "partNumber": "PT-1037",
    "partName": "Center Mounting Base A",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 38,
    "partNumber": "PT-1038",
    "partName": "Inner Lever Guide B",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 39,
    "partNumber": "PT-1039",
    "partName": "Outer Shield Plate C",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 40,
    "partNumber": "PT-1040",
    "partName": "Side Clamp Guide D",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 41,
    "partNumber": "PT-1041",
    "partName": "Front Stopper Plate E",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 42,
    "partNumber": "PT-1042",
    "partName": "Rear Angle Base F",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 43,
    "partNumber": "PT-1043",
    "partName": "Upper Pedal Arm A",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 44,
    "partNumber": "PT-1044",
    "partName": "Lower Collar Spacer B",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 45,
    "partNumber": "PT-1045",
    "partName": "Left Connector Bar C",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 46,
    "partNumber": "PT-1046",
    "partName": "Right Stiffener Inner D",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 47,
    "partNumber": "PT-1047",
    "partName": "Center Stiffener Outer E",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 48,
    "partNumber": "PT-1048",
    "partName": "Inner Bulkhead Brace F",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 49,
    "partNumber": "PT-1049",
    "partName": "Outer Tunnel Reinforce A",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 50,
    "partNumber": "PT-1050",
    "partName": "Side Apron Member B",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 51,
    "partNumber": "PT-1051",
    "partName": "Front Bracket C",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 52,
    "partNumber": "PT-1052",
    "partName": "Rear Flange D",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 53,
    "partNumber": "PT-1053",
    "partName": "Upper Reinforce E",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 54,
    "partNumber": "PT-1054",
    "partName": "Lower Stay Plate F",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 55,
    "partNumber": "PT-1055",
    "partName": "Left Hanger A",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 56,
    "partNumber": "PT-1056",
    "partName": "Right Cross Member B",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 57,
    "partNumber": "PT-1057",
    "partName": "Center Support Arm C",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 58,
    "partNumber": "PT-1058",
    "partName": "Inner Hinge Upper D",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 59,
    "partNumber": "PT-1059",
    "partName": "Outer Hinge Lower E",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 60,
    "partNumber": "PT-1060",
    "partName": "Side Cover Plate F",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 61,
    "partNumber": "PT-1061",
    "partName": "Front Gusset Plate A",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 62,
    "partNumber": "PT-1062",
    "partName": "Rear Mounting Base B",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 63,
    "partNumber": "PT-1063",
    "partName": "Upper Lever Guide C",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 64,
    "partNumber": "PT-1064",
    "partName": "Lower Shield Plate D",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 65,
    "partNumber": "PT-1065",
    "partName": "Left Clamp Guide E",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 66,
    "partNumber": "PT-1066",
    "partName": "Right Stopper Plate F",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 67,
    "partNumber": "PT-1067",
    "partName": "Center Angle Base A",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 68,
    "partNumber": "PT-1068",
    "partName": "Inner Pedal Arm B",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 69,
    "partNumber": "PT-1069",
    "partName": "Outer Collar Spacer C",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 70,
    "partNumber": "PT-1070",
    "partName": "Side Connector Bar D",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 71,
    "partNumber": "PT-1071",
    "partName": "Front Stiffener Inner E",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 72,
    "partNumber": "PT-1072",
    "partName": "Rear Stiffener Outer F",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 73,
    "partNumber": "PT-1073",
    "partName": "Upper Bulkhead Brace A",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 74,
    "partNumber": "PT-1074",
    "partName": "Lower Tunnel Reinforce B",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 75,
    "partNumber": "PT-1075",
    "partName": "Left Apron Member C",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 76,
    "partNumber": "PT-1076",
    "partName": "Right Bracket D",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 77,
    "partNumber": "PT-1077",
    "partName": "Center Flange E",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 78,
    "partNumber": "PT-1078",
    "partName": "Inner Reinforce F",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 79,
    "partNumber": "PT-1079",
    "partName": "Outer Stay Plate A",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 80,
    "partNumber": "PT-1080",
    "partName": "Side Hanger B",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 81,
    "partNumber": "PT-1081",
    "partName": "Front Cross Member C",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 82,
    "partNumber": "PT-1082",
    "partName": "Rear Support Arm D",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 83,
    "partNumber": "PT-1083",
    "partName": "Upper Hinge Upper E",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 84,
    "partNumber": "PT-1084",
    "partName": "Lower Hinge Lower F",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 85,
    "partNumber": "PT-1085",
    "partName": "Left Cover Plate A",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 86,
    "partNumber": "PT-1086",
    "partName": "Right Gusset Plate B",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 87,
    "partNumber": "PT-1087",
    "partName": "Center Mounting Base C",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 88,
    "partNumber": "PT-1088",
    "partName": "Inner Lever Guide D",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 89,
    "partNumber": "PT-1089",
    "partName": "Outer Shield Plate E",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 90,
    "partNumber": "PT-1090",
    "partName": "Side Clamp Guide F",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 91,
    "partNumber": "PT-1091",
    "partName": "Front Stopper Plate A",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 92,
    "partNumber": "PT-1092",
    "partName": "Rear Angle Base B",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 93,
    "partNumber": "PT-1093",
    "partName": "Upper Pedal Arm C",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 94,
    "partNumber": "PT-1094",
    "partName": "Lower Collar Spacer D",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 95,
    "partNumber": "PT-1095",
    "partName": "Left Connector Bar E",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 96,
    "partNumber": "PT-1096",
    "partName": "Right Stiffener Inner F",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 97,
    "partNumber": "PT-1097",
    "partName": "Center Stiffener Outer A",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 98,
    "partNumber": "PT-1098",
    "partName": "Inner Bulkhead Brace B",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 99,
    "partNumber": "PT-1099",
    "partName": "Outer Tunnel Reinforce C",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 100,
    "partNumber": "PT-1100",
    "partName": "Side Apron Member D",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 101,
    "partNumber": "PT-1101",
    "partName": "Front Bracket E",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 102,
    "partNumber": "PT-1102",
    "partName": "Rear Flange F",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 103,
    "partNumber": "PT-1103",
    "partName": "Upper Reinforce A",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 104,
    "partNumber": "PT-1104",
    "partName": "Lower Stay Plate B",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 105,
    "partNumber": "PT-1105",
    "partName": "Left Hanger C",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 106,
    "partNumber": "PT-1106",
    "partName": "Right Cross Member D",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 107,
    "partNumber": "PT-1107",
    "partName": "Center Support Arm E",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 108,
    "partNumber": "PT-1108",
    "partName": "Inner Hinge Upper F",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 109,
    "partNumber": "PT-1109",
    "partName": "Outer Hinge Lower A",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 110,
    "partNumber": "PT-1110",
    "partName": "Side Cover Plate B",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 111,
    "partNumber": "PT-1111",
    "partName": "Front Gusset Plate C",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 112,
    "partNumber": "PT-1112",
    "partName": "Rear Mounting Base D",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 113,
    "partNumber": "PT-1113",
    "partName": "Upper Lever Guide E",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 114,
    "partNumber": "PT-1114",
    "partName": "Lower Shield Plate F",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 115,
    "partNumber": "PT-1115",
    "partName": "Left Clamp Guide A",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 116,
    "partNumber": "PT-1116",
    "partName": "Right Stopper Plate B",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  },
  {
    "id": 117,
    "partNumber": "PT-1117",
    "partName": "Center Angle Base C",
    "customerName": "PT Toyota Motor Mfg Indonesia",
    "status": "Active"
  },
  {
    "id": 118,
    "partNumber": "PT-1118",
    "partName": "Inner Pedal Arm D",
    "customerName": "PT Suzuki Indomobil Motor",
    "status": "Active"
  },
  {
    "id": 119,
    "partNumber": "PT-1119",
    "partName": "Outer Collar Spacer E",
    "customerName": "PT Astra Daihatsu Motor",
    "status": "Active"
  },
  {
    "id": 120,
    "partNumber": "PT-1120",
    "partName": "Side Connector Bar F",
    "customerName": "PT Mitsubishi Motors Krama Yudha",
    "status": "Active"
  },
  {
    "id": 121,
    "partNumber": "PT-1121",
    "partName": "Front Stiffener Inner A",
    "customerName": "PT Astra Honda Motor",
    "status": "Active"
  }
];

export const MASTER_MACHINES = [
  {
    "id": 1,
    "name": "Amada Press 01 (150T)",
    "line": "Stamping Press",
    "type": "Mechanical 150T",
    "status": "Running"
  },
  {
    "id": 2,
    "name": "Amada Press 02 (150T)",
    "line": "Stamping Press",
    "type": "Mechanical 150T",
    "status": "Running"
  },
  {
    "id": 3,
    "name": "Amada Press 03 (200T)",
    "line": "Stamping Press",
    "type": "Mechanical 200T",
    "status": "Running"
  },
  {
    "id": 4,
    "name": "Komatsu Press 01 (150T)",
    "line": "Stamping Press",
    "type": "Mechanical 150T",
    "status": "Running"
  },
  {
    "id": 5,
    "name": "Komatsu Press 02 (200T)",
    "line": "Stamping Press",
    "type": "Mechanical 200T",
    "status": "Running"
  },
  {
    "id": 6,
    "name": "Komatsu Press 03 (250T)",
    "line": "Stamping Press",
    "type": "Mechanical 250T",
    "status": "Maintenance"
  },
  {
    "id": 7,
    "name": "Aida Stamping 01 (110T)",
    "line": "Stamping Press",
    "type": "Precision Press 110T",
    "status": "Running"
  },
  {
    "id": 8,
    "name": "Aida Stamping 02 (110T)",
    "line": "Stamping Press",
    "type": "Precision Press 110T",
    "status": "Running"
  },
  {
    "id": 9,
    "name": "Aida Stamping 03 (160T)",
    "line": "Stamping Press",
    "type": "Precision Press 160T",
    "status": "Running"
  },
  {
    "id": 10,
    "name": "Chin Fong Press 01 (250T)",
    "line": "Stamping Press",
    "type": "Heavy Press 250T",
    "status": "Running"
  },
  {
    "id": 11,
    "name": "Chin Fong Press 02 (250T)",
    "line": "Stamping Press",
    "type": "Heavy Press 250T",
    "status": "Running"
  },
  {
    "id": 12,
    "name": "Chin Fong Press 03 (300T)",
    "line": "Stamping Press",
    "type": "Heavy Press 300T",
    "status": "Running"
  },
  {
    "id": 13,
    "name": "Seymour Press 01 (80T)",
    "line": "Stamping Press",
    "type": "C-Frame 80T",
    "status": "Running"
  },
  {
    "id": 14,
    "name": "Seymour Press 02 (80T)",
    "line": "Stamping Press",
    "type": "C-Frame 80T",
    "status": "Running"
  },
  {
    "id": 15,
    "name": "Seymour Press 03 (110T)",
    "line": "Stamping Press",
    "type": "C-Frame 110T",
    "status": "Running"
  },
  {
    "id": 16,
    "name": "Amada Servo Press 01 (300T)",
    "line": "Stamping Press",
    "type": "Servo Press 300T",
    "status": "Running"
  },
  {
    "id": 17,
    "name": "Komatsu Tandem Line 01",
    "line": "Tandem Line",
    "type": "Automated Tandem",
    "status": "Running"
  },
  {
    "id": 18,
    "name": "Komatsu Tandem Line 02",
    "line": "Tandem Line",
    "type": "Automated Tandem",
    "status": "Running"
  },
  {
    "id": 19,
    "name": "Amada Promecam CNC 01",
    "line": "Bending Line",
    "type": "CNC Press Brake 80T",
    "status": "Running"
  },
  {
    "id": 20,
    "name": "Amada Promecam CNC 02",
    "line": "Bending Line",
    "type": "CNC Press Brake 100T",
    "status": "Running"
  },
  {
    "id": 21,
    "name": "Komatsu Bending Press 01",
    "line": "Bending Line",
    "type": "Hydraulic Bender 120T",
    "status": "Running"
  },
  {
    "id": 22,
    "name": "Toyokoki Hydraulic Bender 01",
    "line": "Bending Line",
    "type": "Precision Bender 60T",
    "status": "Running"
  },
  {
    "id": 23,
    "name": "Toyokoki Hydraulic Bender 02",
    "line": "Bending Line",
    "type": "Precision Bender 80T",
    "status": "Running"
  },
  {
    "id": 24,
    "name": "Welding Robot A (OTC Daihen)",
    "line": "Welding Line",
    "type": "6-Axis Robot CO2",
    "status": "Running"
  },
  {
    "id": 25,
    "name": "Welding Robot B (Yaskawa)",
    "line": "Welding Line",
    "type": "Motoman Arc Welding",
    "status": "Running"
  },
  {
    "id": 26,
    "name": "Welding Robot C (Panasonic)",
    "line": "Welding Line",
    "type": "TAWERS Robot",
    "status": "Running"
  },
  {
    "id": 27,
    "name": "Welding Spot 01 (Pneumatic)",
    "line": "Spot Welding",
    "type": "Pedestal Spot 50kVA",
    "status": "Running"
  },
  {
    "id": 28,
    "name": "Welding Spot 02 (Inverter)",
    "line": "Spot Welding",
    "type": "MFDC Spot Welder",
    "status": "Running"
  },
  {
    "id": 29,
    "name": "Welding CO2 Manual 01",
    "line": "Manual Welding",
    "type": "MIG/MAG 350A",
    "status": "Running"
  }
];

export const MASTER_DEFECT_TYPES = [
  {
    "id": 1,
    "name": "Gompal (Chipping)",
    "proses": "Blanking",
    "category": "Critical",
    "description": "Tepi plat cuil atau sompal akibat punch tumpul/clearance tidak sesuai"
  },
  {
    "id": 2,
    "name": "Burry (Excess Burrs)",
    "proses": "Blanking",
    "category": "Medium",
    "description": "Serpihan tajam di tepian potongan melebihi toleransi 0.05mm"
  },
  {
    "id": 3,
    "name": "Crack / Retak Tarik",
    "proses": "Blanking",
    "category": "Critical",
    "description": "Retak mikro pada radius lekukan atau tepi potong"
  },
  {
    "id": 4,
    "name": "Gelombang (Wrinkle)",
    "proses": "Drawing",
    "category": "Medium",
    "description": "Permukaan plat bergelombang akibat blank holder force kurang"
  },
  {
    "id": 5,
    "name": "Scratch / Baret",
    "proses": "Blanking",
    "category": "Low",
    "description": "Goresan permukaan plat akibat die kotor atau serpihan scrap"
  },
  {
    "id": 6,
    "name": "Dent / Penyok",
    "proses": "Blanking",
    "category": "Medium",
    "description": "Cekungan akibat benturan part saat proses ejection"
  },
  {
    "id": 7,
    "name": "Slug Mark (Bekas Gram)",
    "proses": "Piercing",
    "category": "Medium",
    "description": "Bekas tumpukan sisa potongan (gram) yang tertekan kembali ke plat"
  },
  {
    "id": 8,
    "name": "Misfeed / Pergeseran Plat",
    "proses": "Blanking",
    "category": "Critical",
    "description": "Posisi strip feeder bergeser dari pilot pin"
  },
  {
    "id": 9,
    "name": "Dimensi NG (Out of Spec)",
    "proses": "Blanking",
    "category": "Critical",
    "description": "Panjang/lebar part melebihi batas toleransi drawing"
  },
  {
    "id": 10,
    "name": "Hole Deformed (Lubang Lonjong)",
    "proses": "Piercing",
    "category": "Medium",
    "description": "Bentuk lubang tidak bundar sempurna akibat punch miring"
  },
  {
    "id": 11,
    "name": "Burr Hole (Burr Lubang)",
    "proses": "Piercing",
    "category": "Low",
    "description": "Tepi lubang tajam melebihi toleransi drawing"
  },
  {
    "id": 12,
    "name": "Terkoyak (Tearing)",
    "proses": "Drawing",
    "category": "Critical",
    "description": "Plat robek akibat tegangan tarik melampaui batas elastis"
  },
  {
    "id": 13,
    "name": "Tidak Flat / Warpage",
    "proses": "Bending",
    "category": "Medium",
    "description": "Permukaan plat bergelombang / deformasi sudut tekuk"
  },
  {
    "id": 14,
    "name": "Over Bending (Sudut Minus)",
    "proses": "Bending",
    "category": "Medium",
    "description": "Sudut tekukan terlalu kecil dari toleransi derajat"
  },
  {
    "id": 15,
    "name": "Under Bending (Sudut Plus)",
    "proses": "Bending",
    "category": "Medium",
    "description": "Sudut tekukan terlalu lebar (kurang tekuk)"
  },
  {
    "id": 16,
    "name": "Springback Berlebih",
    "proses": "Bending",
    "category": "Medium",
    "description": "Sudut membal kembali melebihi batas kompensasi tool"
  },
  {
    "id": 17,
    "name": "Bekas Dies (Die Mark)",
    "proses": "Bending",
    "category": "Low",
    "description": "Garis bekas kontak tajam die pada radius luar tekukan"
  },
  {
    "id": 18,
    "name": "Step Bending Miring",
    "proses": "Bending",
    "category": "High",
    "description": "Tekukan bertingkat tidak simetris kanan-kiri"
  },
  {
    "id": 19,
    "name": "Radius NG",
    "proses": "Bending",
    "category": "Medium",
    "description": "Radius kelengkungan tekuk tidak sesuai R gambar kerja"
  },
  {
    "id": 20,
    "name": "Twist / Puntir",
    "proses": "Bending",
    "category": "High",
    "description": "Part terpuntir secara aksial setelah proses tekuk"
  },
  {
    "id": 21,
    "name": "Sudut Tidak Konsisten",
    "proses": "Bending",
    "category": "Medium",
    "description": "Sudut berbeda antara ujung depan dan belakang part"
  },
  {
    "id": 22,
    "name": "Overheat Spot (Gosong)",
    "proses": "Welding Spot",
    "category": "Medium",
    "description": "Gosong berlebih pada titik las elektroda akibat arus terlalu tinggi"
  },
  {
    "id": 23,
    "name": "Keropos (Porosity)",
    "proses": "Welding Robot",
    "category": "Critical",
    "description": "Rongga udara pada jalur sambungan las robot"
  },
  {
    "id": 24,
    "name": "Spatter Berlebih",
    "proses": "Welding Robot",
    "category": "Low",
    "description": "Percikan logam las menempel di sekitar area sambungan"
  },
  {
    "id": 25,
    "name": "Under Cut",
    "proses": "Welding Robot",
    "category": "Critical",
    "description": "Alur cekung pada tepi las yang mengurangi ketebalan plat induk"
  },
  {
    "id": 26,
    "name": "Kurang Penetrasi",
    "proses": "Welding Robot",
    "category": "Critical",
    "description": "Logam las tidak menembus sampai ke akar sambungan"
  },
  {
    "id": 27,
    "name": "Blow Hole",
    "proses": "Welding Robot",
    "category": "Critical",
    "description": "Lubang tembus pada manik las akibat kontaminasi oli/air"
  },
  {
    "id": 28,
    "name": "Misalignment Las",
    "proses": "Welding Robot",
    "category": "High",
    "description": "Posisi sambungan las meleset dari garis temu plat"
  },
  {
    "id": 29,
    "name": "Nugget Kecil (Spot Lepas)",
    "proses": "Welding Spot",
    "category": "Critical",
    "description": "Diameter inti las titik di bawah standar kekuatan geser"
  },
  {
    "id": 30,
    "name": "Crater Crack",
    "proses": "Welding Robot",
    "category": "Critical",
    "description": "Retakan pada kawah akhir manik las (stop welding point)"
  },
  {
    "id": 31,
    "name": "Burn Through (Bolong)",
    "proses": "Welding Spot",
    "category": "Critical",
    "description": "Plat berlubang tembus karena waktu las terlalu lama"
  },
  {
    "id": 32,
    "name": "Kawat Las Nyangkut",
    "proses": "Welding Robot",
    "category": "Low",
    "description": "Sisa kawat filler menonjol keluar sambungan"
  },
  {
    "id": 33,
    "name": "Asimetris Las",
    "proses": "Welding Spot",
    "category": "Medium",
    "description": "Titik las tidak simetris sesuai acuan jig welding"
  }
];

export const MASTER_DATA_METRICS = {
  totalParts: 121,
  totalMachines: 29,
  totalDefects: 33,
};

export default {
  MASTER_PARTS,
  MASTER_MACHINES,
  MASTER_DEFECT_TYPES,
  MASTER_DATA_METRICS,
};
