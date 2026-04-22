// ────────────────────── src/utils/tm/templates.js ──────────────────────/

// Replicates the JSON templates, random values, and name databases exactly 1:1

export const position_mapping = {
  'GK': 0, 'SW': 1, 'RWB': 2, 'RB': 3, 'RCB': 4, 'CB': 5, 'LCB': 6, 'LB': 7, 'LWB': 8,
  'RDM': 9, 'CDM': 10, 'LDM': 11, 'RM': 12, 'RCM': 13, 'CM': 14, 'LCM': 15, 'LM': 16,
  'RAM': 17, 'CAM': 18, 'LAM': 19, 'RF': 20, 'CF': 21, 'LF': 22, 'RW': 23, 'RS': 24,
  'ST': 25, 'LS': 26, 'LW': 27
};

export const random_values = {
  "firstnames": ["Alex", "James", "Maria", "John", "Emma", "Mohamed", "Wei", "Olivia"],
  "lastnames": ["Smith", "Garcia", "Zhang", "Lee", "Kowalski", "Nguyen", "Cohen", "Kim"],
  "eyebrowcodes": [1, 2, 3, 4, 5],
  "facialhairtypecodes": [0, 1, 2, 3, 4, 5],
  "hairtypecodes": [1, 2, 3, 4, 5, 6, 7, 8],
  "skinsurfacepacks": [1, 2, 3],
  "headtypecodes": [1, 2, 3, 4, 5],
  "heights": [160, 165, 170, 175, 180, 185, 190, 195, 200],
  "seasonaloutfitids": [100, 101, 102, 103, 104],
  "weights": [65, 70, 75, 80, 85, 90],
  "ethnicities": [1, 2, 3, 4, 5, 6],
  "personalityids": [0, 1],
  "nationalities": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "skintonecodes": [1, 2, 3, 4, 5],
  "outfitids": [200, 201, 202, 203, 204],
  "bodytypecodes": [1, 2, 3, 4],
  "facialhaircolorcodes": [1, 2, 3, 4, 5]
};

export const names_data = {
    "England": {
        "first_names": ["James", "Oliver", "Harry", "Jack", "William", "Thomas", "George", "Charlie", "Oscar", "Henry", "Arthur", "Leo", "Noah", "Ethan", "Mason", "Lucas", "Alexander", "Daniel", "Samuel", "Benjamin", "Emily", "Olivia", "Amelia", "Isla", "Ava", "Mia", "Isabella", "Sophia", "Grace", "Lily"],
        "last_names": ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Roberts", "Johnson", "Lewis", "Walker", "Robinson", "Wood", "Thompson", "White", "Watson", "Jackson", "Wright", "Green", "Harris", "Cooper", "King", "Lee", "Martin", "Clarke", "James", "Morgan", "Hughes"]
    },
    "Spain": {
        "first_names": ["Carlos", "David", "José", "Francisco", "Antonio", "Manuel", "Juan", "Jorge", "Miguel", "Álvaro", "Sergio", "Pablo", "Alejandro", "Daniel", "Fernando", "María", "Carmen", "Ana", "Isabel", "Laura", "Cristina", "Lucía", "Marta", "Elena", "Paula", "Sara", "Raquel", "Andrea", "Julia", "Silvia"],
        "last_names": ["García", "Rodríguez", "Martínez", "López", "Sánchez", "González", "Hernández", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Molina", "Blanco"]
    },
    "Germany": {
        "first_names": ["Lukas", "Leon", "Maximilian", "Jonas", "Felix", "Tim", "Julian", "Niklas", "Alexander", "Moritz", "Lukas", "Marcel", "Kevin", "Jan", "Lars", "Anna", "Julia", "Sarah", "Laura", "Lisa", "Marie", "Sophie", "Katharina", "Maria", "Johanna", "Lena", "Christina", "Sabine", "Nina", "Claudia"],
        "last_names": ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Braun", "Zimmermann", "Krüger", "Hartmann", "Werner", "Lange", "Schmitt", "Vogel", "Friedrich", "Klaus", "Jung", "Hahn", "Körner"]
    },
    "France": {
        "first_names": ["Antoine", "Lucas", "Hugo", "Nathan", "Théo", "Louis", "Raphaël", "Gabriel", "Arthur", "Paul", "Ethan", "Adam", "Sacha", "Maxime", "Alexandre", "Emma", "Léa", "Chloé", "Manon", "Jade", "Camille", "Zoé", "Inès", "Lina", "Alice", "Louise", "Juliette", "Clara", "Sarah", "Eva"],
        "last_names": ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "André", "Lefevre", "Mercier", "Dupont", "Lambert", "Fontaine", "Rousseau", "Vincent"]
    },
    "Italy": {
        "first_names": ["Marco", "Alessandro", "Lorenzo", "Luca", "Andrea", "Matteo", "Federico", "Giuseppe", "Roberto", "Stefano", "Davide", "Francesco", "Giovanni", "Paolo", "Fabio", "Sofia", "Giulia", "Aurora", "Martina", "Giorgia", "Sara", "Valentina", "Elena", "Chiara", "Alice", "Francesca", "Laura", "Beatrice", "Anna", "Elisa"],
        "last_names": ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Gatto", "Leone", "Longo"]
    },
    "Brazil": {
        "first_names": ["Lucas", "Gabriel", "Pedro", "Matheus", "Rafael", "Guilherme", "Bruno", "João", "Felipe", "Gustavo", "Thiago", "Diego", "Vinícius", "Carlos", "Eduardo", "Ana", "Julia", "Mariana", "Isabela", "Camila", "Fernanda", "Beatriz", "Larissa", "Gabriela", "Carolina", "Amanda", "Letícia", "Patrícia", "Raquel", "Daniela"],
        "last_names": ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas"]
    },
    "Argentina": {
        "first_names": ["Santiago", "Matías", "Nicolás", "Gonzalo", "Tomás", "Diego", "Federico", "Agustín", "Maximiliano", "Alejandro", "Joaquín", "Martín", "Luciano", "Facundo", "Brian", "Sofía", "Camila", "Valentina", "Luciana", "María", "Florencia", "Sol", "Micaela", "Agustina", "Laura", "Natalia", "Melina", "Andrea", "Paula", "Romina"],
        "last_names": ["González", "Rodríguez", "López", "Fernández", "García", "Martínez", "Pérez", "Gómez", "Sánchez", "Romero", "Díaz", "Torres", "Flores", "Acosta", "Giménez", "Álvarez", "Ruiz", "Herrera", "Molina", "Sosa", "Gutiérrez", "Córdoba", "Ortiz", "Vargas", "Castro", "Ramírez", "Medina", "Suárez", "Aguirre", "Ríos"]
    }
};

// Replicating the JSON template structure for EA database tables
export const templates = {
  common_template_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  teams: {
    columns: [
      "assetid", "teamcolor1g", "teamcolor1r", "clubworth", "teamcolor2b",
      "goalnetstanchioncolor2g", "teamcolor2r", "foundationyear",
      "goalnetstanchioncolor2r", "teamcolor3r", "goalnetstanchioncolor1b",
      "teamcolor1b", "opponentweakthreshold", "latitude", "teamcolor3g",
      "opponentstrongthreshold", "goalnetstanchioncolor2b",
      "goalnetstanchioncolor1r", "teamcolor2g", "goalnetstanchioncolor1g",
      "teamname", "teamcolor3b", "presassetone", "powid", "hassubstitutionboard",
      "rightfreekicktakerid", "flamethrowercannon", "domesticprestige",
      "genericint2", "defensivedepth", "hasvikingclap", "jerseytype",
      "pitchcolor", "pitchwear", "popularity", "hastifo", "presassettwo",
      "teamstadiumcapacity", "stadiumgoalnetstyle", "iscompetitionscarfenabled",
      "cityid", "rivalteam", "playsurfacetype", "isbannerenabled",
      "midfieldrating", "stadiummowpattern_code", "matchdayoverallrating",
      "matchdaymidfieldrating", "attackrating", "longitude", "buildupplay",
      "matchdaydefenserating", "hasstandingcrowd", "favoriteteamsheetid",
      "defenserating", "iscompetitionpoleflagenabled", "skinnyflags",
      "uefa_consecutive_wins", "longkicktakerid", "trait1vweak",
      "iscompetitioncrowdcardsenabled", "rightcornerkicktakerid", "gender",
      "cksupport1", "uefa_cl_wins", "hassuncanthem", "domesticcups",
      "ethnicity", "leftcornerkicktakerid", "youthdevelopment", "teamid",
      "uefa_el_wins", "trait1vequal", "numtransfersin", "stanchionflamethrower",
      "stadiumgoalnetpattern", "captainid", "personalityid", "prev_el_champ",
      "leftfreekicktakerid", "cksupport2", "leaguetitles", "genericbanner",
      "crowdregion", "uefa_uecl_wins", "overallrating", "ballid", "profitability",
      "utcoffset", "penaltytakerid", "pitchlinecolor", "freekicktakerid",
      "crowdskintonecode", "internationalprestige", "cksupport3", "haslargeflag",
      "trainingstadium", "form", "genericint1", "trait1vstrong",
      "matchdayattackrating"
    ],
    template: "{team_id},18,32,8500,6,255,255,1935,255,255,255,130,1,-25,255,1,255,255,217,255,{team_name},255,0,-1,0,{rightfreekicktakerid},0,1,-1,30,0,2,4,0,2,0,0,3000,0,1,771,101108,0,1,63,3,63,63,61,-57,3,63,0,-1,63,1,1,0,{longkicktakerid},4202496,0,{rightcornerkicktakerid},0,0,0,0,0,5,{leftcornerkicktakerid},4,{team_id},0,528384,0,0,0,{captainid},0,0,{leftfreekicktakerid},0,0,0,1,0,63,74,1,-3,{penaltytakerid},0,{freekicktakerid},7,1,0,1,316,0,-1,526336,61"
  },
  teamkits: {
    columns: [
      "teamkitid", "chestbadge", "shortsnumberplacementcode", "shortsnumbercolorprimg",
      "teamcolorsecb", "shortsrenderingdetailmaptype", "jerseyfrontnumberplacementcode",
      "jerseynumbercolorsecr", "jerseynumbercolorprimr", "jerseynumbercolorprimg",
      "shortsnumbercolorsecb", "teamcolorprimg", "shortsnumbercolorterb",
      "shortsnumbercolorprimr", "teamcolortertb", "jerseynumbercolorterg",
      "jerseynameoutlinecolorr", "shortsnumbercolorprimb", "jerseynamelayouttype",
      "jerseynumbercolorterr", "jerseyrightsleevebadge", "jerseynumbercolorprimb",
      "jerseyshapestyle", "jerseybacknameplacementcode", "teamcolorprimr",
      "jerseynamecolorg", "jerseyleftsleevebadge", "jerseynameoutlinecolorb",
      "teamcolorsecg", "shortsnumbercolorsecg", "teamcolortertr",
      "jerseynumbercolorsecg", "renderingmaterialtype", "shortsnumbercolorterr",
      "teamcolorsecr", "jerseycollargeometrytype", "shortsnumbercolorterg",
      "jerseynamecolorr", "teamcolorprimb", "jerseyrenderingdetailmaptype",
      "jerseynameoutlinecolorg", "jerseynumbercolorsecb", "jerseynamecolorb",
      "jerseynumbercolorterb", "teamcolortertg", "shortsnumbercolorsecr",
      "jerseybacknamefontcase", "teamkittypetechid", "powid", "isinheritbasedetailmap",
      "islocked", "numberfonttype", "jerseynamefonttype", "teamcolorprimpercent",
      "teamcolorsecpercent", "year", "captainarmband", "teamtechid", "isembargoed",
      "hasadvertisingkit", "jerseynameoutlinewidth", "dlc", "teamcolortertpercent",
      "armbandtype", "shortsnumberfonttype", "shortstyle", "jerseyfit",
      "jerseyrestriction"
    ],
    templates: [
      "17031,0,1,220,74,0,0,203,220,220,12,29,12,220,29,12,12,220,0,12,308,220,0,1,29,220,0,12,117,12,29,200,0,12,0,0,12,220,29,0,12,199,220,12,29,12,0,0,-1,0,0,84,44,64,22,0,100,{team_id},0,0,2,0,100,0,230,0,0,0",
      "17032,0,1,220,74,0,0,203,220,220,12,29,12,220,29,12,12,220,0,12,308,220,0,1,29,220,0,12,117,12,29,200,0,12,0,0,12,220,29,0,12,199,220,12,29,12,0,1,-1,0,0,84,44,64,22,0,100,{team_id},0,0,2,0,100,0,230,0,0,0",
      "17033,0,1,220,74,0,0,203,220,220,12,29,12,220,29,12,12,220,0,12,308,220,0,1,29,220,0,12,117,12,29,200,0,12,0,0,12,220,29,0,12,199,220,12,29,12,0,2,-1,0,0,84,44,64,22,0,100,{team_id},0,0,2,0,100,0,230,0,0,0"
    ]
  },
  teammentality: {
    columns: [
      "offset6x", "offset5y", "offset10x", "offset2x", "offset2y", "offset6y", "offset7x", "offset3x", "offset8x", "offset10y", "offset3y", "offset4x", "offset7y", "offset0x", "offset8y", "offset9x", "offset5x", "offset0y", "offset1x", "offset4y", "offset9y", "offset1y", "pos0role", "pos6role", "pos8role", "pos4role", "pos7role", "pos2role", "pos1role", "pos10role", "pos3role", "pos9role", "pos5role", "tactic_name", "playerid0", "playerid9", "position10", "defensivedepth", "playerid1", "position6", "playerid7", "position8", "playerid6", "buildupplay", "playerid5", "sourceformationid", "playerid8", "playerid2", "position5", "formationaudioid", "playerid4", "teamid", "position2", "playerid3", "position4", "position3", "formationfullnameid", "mentalityid", "playerid10", "position0", "position9", "position7", "position1"
    ],
    templates: {
      template1: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.35,0.3375,0.4995,0.675,0.15,0.3375,0.925,0.325,0.075,0.875,0.15,0.075,0.5875,0.5,0.5875,0.5,0.65,0.0175,0.925,0.2,0.6625,0.2,4161,17089,25794,8385,25602,12737,8513,38405,12737,29637,17153,,{playeridrelatedtoteam},{playeridrelatedtoteam},25,30,{playeridrelatedtoteam},11,{playeridrelatedtoteam},16,{playeridrelatedtoteam},3,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},9,14,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,3,4215,{playeridrelatedtoteam},0,18,12,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template2: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.35,0.5125,0.4995,0.5,0.15,0.5125,0.075,0.3239,0.8,0.875,0.15,0.925,0.5875,0.5,0.6625,0.2,0.65,0.0175,0.664,0.5875,0.6625,0.1564,4162,21251,29576,25729,25729,12870,12870,38410,12806,29637,21191,,{playeridrelatedtoteam},{playeridrelatedtoteam},25,50,{playeridrelatedtoteam},15,{playeridrelatedtoteam},17,{playeridrelatedtoteam},1,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},13,19,{playeridrelatedtoteam},{teamid},5,{playeridrelatedtoteam},12,6,21,4216,{playeridrelatedtoteam},0,19,16,4",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template3: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.35,0.3375,0.4995,0.6792,0.1517,0.3375,0.925,0.3564,0.075,0.875,0.1537,0.075,0.5875,0.5,0.5875,0.5,0.65,0.0175,0.925,0.1957,0.6625,0.225,4161,17089,25794,8386,25794,12737,8450,38213,12737,29637,17155,,{playeridrelatedtoteam},{playeridrelatedtoteam},25,30,{playeridrelatedtoteam},11,{playeridrelatedtoteam},16,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},9,14,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,3,4217,{playeridrelatedtoteam},0,18,12,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template4: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.65,0.5875,0.39,0.675,0.15,0.5125,0.35,0.325,0.075,0.875,0.15,0.075,0.5125,0.5,0.5875,0.6,0.925,0.0175,0.925,0.2,0.875,0.2,4161,21249,25602,8450,21185,12802,8386,38405,12737,38405,25602,,{playeridrelatedtoteam},{playeridrelatedtoteam},26,30,{playeridrelatedtoteam},13,{playeridrelatedtoteam},16,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},12,10,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,11,4218,{playeridrelatedtoteam},0,24,15,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template5: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.5,0.2,0.39,0.7125,0.175,0.3375,0.65,0.5,0.35,0.875,0.15,0.2875,0.5125,0.5,0.5125,0.6,0.075,0.0175,0.925,0.175,0.875,0.2,4161,17089,21314,12737,21314,12737,8450,38405,12737,38405,8386,,{playeridrelatedtoteam},{playeridrelatedtoteam},26,50,{playeridrelatedtoteam},10,{playeridrelatedtoteam},15,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},7,4,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},6,5,24,4219,{playeridrelatedtoteam},0,24,13,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template6: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.35,0.5125,0.075,0.5,0.15,0.5125,0.075,0.2898,0.925,0.825,0.175,0.925,0.5875,0.5,0.825,0.4995,0.65,0.0175,0.7102,0.5875,0.875,0.175,4161,21314,33794,25602,25602,12737,12737,33794,12865,38405,21314,,{playeridrelatedtoteam},{playeridrelatedtoteam},27,50,{playeridrelatedtoteam},15,{playeridrelatedtoteam},23,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},13,0,{playeridrelatedtoteam},{teamid},5,{playeridrelatedtoteam},12,6,2,4220,{playeridrelatedtoteam},0,25,16,4",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template7: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.925,0.3375,0.4995,0.675,0.15,0.5875,0.65,0.325,0.35,0.875,0.15,0.075,0.5125,0.5,0.5125,0.075,0.5,0.0175,0.925,0.2,0.5875,0.2,4161,25602,21314,8450,21185,12737,8386,38213,12737,25794,17089,,{playeridrelatedtoteam},{playeridrelatedtoteam},25,50,{playeridrelatedtoteam},12,{playeridrelatedtoteam},15,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},10,15,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,31,4221,{playeridrelatedtoteam},0,16,13,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template8: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.35,0.3375,0.39,0.6549,0.15,0.3375,0.8,0.3451,0.2,0.875,0.1457,0.075,0.6625,0.5,0.6625,0.6,0.65,0.0175,0.925,0.2,0.875,0.2,4226,17089,29570,8581,29570,12865,8513,38275,12737,38405,17089,,{playeridrelatedtoteam},{playeridrelatedtoteam},26,50,{playeridrelatedtoteam},11,{playeridrelatedtoteam},19,{playeridrelatedtoteam},1,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},9,10,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,32,4222,{playeridrelatedtoteam},0,24,17,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template9: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.65,0.3375,0.39,0.6701,0.1478,0.5125,0.35,0.3451,0.5,0.875,0.1479,0.075,0.5125,0.5,0.6625,0.6,0.5,0.0175,0.925,0.2,0.875,0.2,4161,21384,29570,8386,21442,12802,8452,38275,12802,38341,17089,,{playeridrelatedtoteam},{playeridrelatedtoteam},26,50,{playeridrelatedtoteam},13,{playeridrelatedtoteam},18,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},10,11,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,9,4223,{playeridrelatedtoteam},0,24,15,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template10: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.9128,0.225,0.509,0.7004,0.175,0.65,0.65,0.5,0.35,0.8558,0.15,0.3269,0.5125,0.5,0.5125,0.0962,0.075,0.0175,0.9189,0.175,0.65,0.225,4226,25669,21314,12737,21314,12737,8386,38405,12737,25602,8386,,{playeridrelatedtoteam},{playeridrelatedtoteam},25,50,{playeridrelatedtoteam},12,{playeridrelatedtoteam},15,{playeridrelatedtoteam},3,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},7,5,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},6,5,14,4224,{playeridrelatedtoteam},0,16,13,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template11: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.65,0.2,0.075,0.6792,0.1495,0.5125,0.35,0.5,0.925,0.825,0.15,0.336,0.5125,0.5,0.825,0.4995,0.075,0.0175,0.925,0.1495,0.875,0.2,4161,21314,33989,12737,21314,12737,8581,33989,12737,38405,8581,,{playeridrelatedtoteam},{playeridrelatedtoteam},27,50,{playeridrelatedtoteam},13,{playeridrelatedtoteam},23,{playeridrelatedtoteam},3,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},7,3,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},6,5,36,4225,{playeridrelatedtoteam},0,25,15,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template12: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.65,0.5875,0.39,0.5,0.15,0.5125,0.35,0.3625,0.075,0.875,0.1543,0.5,0.5125,0.5,0.5875,0.6,0.925,0.02,0.6375,0.3375,0.875,0.1543,4161,21445,25602,17089,21185,12737,12802,38405,12737,38405,25602,,{playeridrelatedtoteam},{playeridrelatedtoteam},26,30,{playeridrelatedtoteam},13,{playeridrelatedtoteam},16,{playeridrelatedtoteam},2,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},12,1,{playeridrelatedtoteam},{teamid},5,{playeridrelatedtoteam},10,6,28,4226,{playeridrelatedtoteam},0,24,15,4",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ],
      template13: [
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0.66,0.6173,0.4995,0.6598,0.1628,0.475,0.34,0.3402,0.0811,0.875,0.1628,0.0841,0.475,0.5,0.6258,0.5,0.925,0.0175,0.928,0.225,0.642,0.225,4226,21381,25794,8450,21314,12802,8386,38213,12802,29570,25794,,{playeridrelatedtoteam},{playeridrelatedtoteam},25,90,{playeridrelatedtoteam},13,{playeridrelatedtoteam},16,{playeridrelatedtoteam},1,{playeridrelatedtoteam},0,{playeridrelatedtoteam},{playeridrelatedtoteam},12,14,{playeridrelatedtoteam},{teamid},4,{playeridrelatedtoteam},7,6,18,4227,{playeridrelatedtoteam},0,18,15,3",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1",
        "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,-1,-1,-1,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4213,-1,-1,-1,-1,-1"
      ]
    }
  },
  teamsheet: {
    columns: [
      "playerid35", "playerid0", "playerid9", "customsub0in", "playerid36", "rightfreekicktakerid", "playerid44", "playerid27", "playerid1", "playerid38", "playerid31", "playerid7", "playerid20", "playerid39", "playerid42", "playerid48", "playerid13", "playerid6", "customsub0out", "playerid37", "playerid5", "playerid45", "playerid8", "playerid14", "playerid46", "longkicktakerid", "playerid12", "playerid2", "rightcornerkicktakerid", "playerid30", "customsub1in", "playerid15", "playerid41", "playerid47", "playerid23", "playerid16", "customsub1out", "leftcornerkicktakerid", "playerid18", "playerid4", "playerid40", "playerid49", "customsub2out", "teamid", "playerid22", "playerid24", "playerid11", "customsub2in", "playerid3", "captainid", "playerid51", "leftfreekicktakerid", "playerid25", "playerid33", "playerid19", "playerid17", "playerid26", "playerid50", "playerid34", "penaltytakerid", "playerid32", "freekicktakerid", "playerid28", "playerid21", "playerid10", "playerid43", "playerid29"
    ],
    template: "{playerid35},{playerid0},{playerid9},-1,{playerid36},{rightfreekicktakerid},{playerid44},{playerid27},{playerid1},{playerid38},{playerid31},{playerid7},{playerid20},{playerid39},{playerid42},{playerid48},{playerid13},{playerid6},-1,{playerid37},{playerid5},{playerid45},{playerid8},{playerid14},{playerid46},{longkicktakerid},{playerid12},{playerid2},{rightcornerkicktakerid},{playerid30},-1,{playerid15},{playerid41},{playerid47},{playerid23},{playerid16},-1,{leftcornerkicktakerid},{playerid18},{playerid4},{playerid40},{playerid49},-1,{teamid},{playerid22},{playerid24},{playerid11},-1,{playerid3},{captainid},{playerid51},{leftfreekicktakerid},{playerid25},{playerid33},{playerid19},{playerid17},{playerid26},{playerid50},{playerid34},{penaltytakerid},{playerid32},{freekicktakerid},{playerid28},{playerid21},{playerid10},{playerid43},{playerid29}"
  },
  formations: {
    columns: [
      "offset6x", "offset5y", "offset10x", "offset2x", "defenders", "offset2y", "offset6y", "offset7x", "offset3x", "offset8x", "offset10y", "offset3y", "offset4x", "offset7y", "offset0x", "offset8y", "attackers", "offset9x", "midfielders", "offset5x", "offset0y", "offset1x", "offset4y", "offset9y", "offset1y", "pos0role", "pos6role", "pos8role", "pos4role", "pos7role", "pos2role", "pos1role", "pos10role", "pos3role", "pos9role", "pos5role", "formationname", "position10", "position6", "offensiverating", "position8", "position5", "formationaudioid", "teamid", "position2", "formationid", "relativeformationid", "position4", "position3", "formationfullnameid", "position0", "position9", "position7", "position1"
    ],
    templates: {
      template1: [
        "0.647,0.3375,0.075,0.675,4,0.15,0.55,0.343,0.325,0.925,0.825,0.15,0.0841,0.55,0.5,0.825,3,0.4995,3,0.5,0.0175,0.925,0.225,0.875,0.2,4226,21381,33986,8514,21314,12865,8386,33986,12802,38341,17089,37714,27,13,3,23,10,6,{teamid},4,37,9,7,6,7,0,25,15,3"
      ],
      template2: [
        "0.35,0.5125,0.4995,0.5,3,0.15,0.5125,0.075,0.3239,0.8,0.875,0.15,0.925,0.5875,0.5,0.6625,2,0.2,5,0.65,0.0175,0.664,0.5875,0.6625,0.1564,4162,21251,29576,25729,25729,12870,12870,38410,12806,29637,21191,3-4-2-1,25,15,3,17,13,19,{teamid},5,55,24,12,6,21,0,19,16,4"
      ],
      template3: [
        "0.35,0.3375,0.4995,0.6792,5,0.1517,0.3375,0.925,0.3564,0.075,0.875,0.1537,0.075,0.5875,0.5,0.5875,1,0.5,4,0.65,0.0175,0.925,0.1957,0.6625,0.225,4161,17089,25794,8386,25794,12737,8450,38213,12737,29637,17155,4-2-3-1,25,11,2,16,9,14,{teamid},4,63,4,7,6,3,0,18,12,3"
      ],
      template4: [
        "0.65,0.5875,0.39,0.675,4,0.15,0.5125,0.35,0.325,0.075,0.875,0.15,0.075,0.5125,0.5,0.5875,2,0.6,4,0.925,0.0175,0.925,0.2,0.875,0.2,4161,21249,25602,8450,21185,12802,8386,38405,12737,38405,25602,4/4/2002,26,13,2,16,12,10,{teamid},4,79,16,7,6,11,0,24,15,3"
      ],
      template5: [
        "0.5,0.2,0.39,0.7125,5,0.175,0.3375,0.65,0.5,0.35,0.875,0.15,0.2875,0.5125,0.5,0.5125,2,0.6,3,0.075,0.0175,0.925,0.175,0.875,0.2,4161,17089,21314,12737,21314,12737,8450,38405,12737,38405,8386,5/3/2002,26,10,1,15,7,4,{teamid},4,82,31,6,5,24,0,24,13,3"
      ],
      template6: [
        "0.35,0.5125,0.075,0.5,3,0.15,0.5125,0.075,0.2898,0.925,0.825,0.175,0.925,0.5875,0.5,0.825,3,0.4995,4,0.65,0.0175,0.7102,0.5875,0.875,0.175,4161,21314,33794,25602,25602,12737,12737,33794,12865,38405,21314,3/4/2003,27,15,4,23,13,0,{teamid},5,84,25,12,6,2,0,25,16,4"
      ],
      template7: [
        "0.925,0.3375,0.4995,0.675,4.5,0.15,0.5875,0.65,0.325,0.35,0.875,0.15,0.075,0.5125,0.5,0.5125,1,0.075,4.5,0.5,0.0175,0.925,0.2,0.5875,0.2,4161,25602,21314,8450,21185,12737,8386,38213,12737,25794,17089,4-1-4-1,25,12,2,15,10,15,{teamid},4,107,2,7,6,31,0,16,13,3"
      ],
      template8: [
        "0.35,0.3375,0.39,0.6549,5,0.15,0.3375,0.8,0.3451,0.2,0.875,0.1457,0.075,0.6625,0.5,0.6625,2,0.6,3,0.65,0.0175,0.925,0.2,0.875,0.2,4226,17089,29570,8581,29570,12865,8513,38275,12737,38405,17089,4-2-2-2,26,11,2,19,9,10,{teamid},4,125,13,7,6,32,0,24,17,3"
      ],
      template9: [
        "0.65,0.3375,0.39,0.6701,4,0.1478,0.5125,0.35,0.3451,0.5,0.875,0.1479,0.075,0.5125,0.5,0.6625,2.5,0.6,3.5,0.5,0.0175,0.925,0.2,0.875,0.2,4161,21384,29570,8386,21442,12802,8452,38275,12802,38341,17089,4-1-2-1-2,26,13,2,18,10,11,{teamid},4,128,15,7,6,9,0,24,15,3"
      ],
      template10: [
        "0.9128,0.225,0.509,0.7004,5,0.175,0.65,0.65,0.5,0.35,0.8558,0.15,0.3269,0.5125,0.5,0.5125,1,0.0962,4,0.075,0.0175,0.9189,0.175,0.65,0.225,4226,25669,21314,12737,21314,12737,8386,38405,12737,25602,8386,5/4/2001,25,12,0,15,7,5,{teamid},4,181,33,6,5,14,0,16,13,3"
      ],
      template11: [
        "0.65,0.2,0.075,0.6792,6,0.1495,0.5125,0.35,0.5,0.925,0.825,0.15,0.336,0.5125,0.5,0.825,1,0.4995,3,0.075,0.0175,0.925,0.1495,0.875,0.2,4161,21314,33989,12737,21314,12737,8581,33989,12737,38405,8581,5/2/2003,27,13,1,23,7,3,{teamid},4,182,30,6,5,36,0,25,15,3"
      ],
      template12: [
        "0.65,0.5875,0.39,0.5,3.5,0.15,0.5125,0.35,0.3625,0.075,0.875,0.1543,0.5,0.5125,0.5,0.5875,2,0.6,4.5,0.925,0.02,0.6375,0.3375,0.875,0.1543,4161,21445,25602,17089,21185,12737,12802,38405,12737,38405,25602,3-1-4-2,26,13,3,16,12,1,{teamid},5,211,22,10,6,28,0,24,15,4"
      ],
      template13: [
        "0.66,0.6173,0.4995,0.6598,4,0.1628,0.475,0.34,0.3402,0.0811,0.875,0.1628,0.0841,0.475,0.5,0.6258,1.5,0.5,4.5,0.925,0.0175,0.928,0.225,0.642,0.225,4226,21381,25794,8450,21314,12802,8386,38213,12802,29570,25794,4-4-1-1,25,13,2,16,12,14,{teamid},4,230,18,7,6,18,0,18,15,3"
      ]
    }
  },
  teamplayerlink: {
    columns: [
      "leaguegoals", "isamongtopscorers", "yellows", "isamongtopscorersinteam", "jerseynumber", "position", "artificialkey", "teamid", "leaguegoalsprevmatch", "injury", "leagueappearances", "istopscorer", "leaguegoalsprevthreematches", "playerid", "form", "reds"
    ],
    template: "0,0,0,0,{jerseynumber},{position},{artificialkey},{teamid},0,0,0,0,0,{playerid},3,0"
  },
  managers: {
    columns: [
      "firstname", "commonname", "surname", "eyebrowcode", "skintypecode",
      "haircolorcode", "facialhairtypecode", "managerid", "accessorycode4",
      "hairtypecode", "lipcolor", "skinsurfacepack", "accessorycode3",
      "accessorycolourcode1", "headtypecode", "height", "seasonaloutfitid",
      "birthdate", "skinmakeup", "weight", "hashighqualityhead", "eyedetail",
      "gender", "headassetid", "ethnicity", "faceposerpreset", "teamid",
      "eyecolorcode", "personalityid", "accessorycolourcode3", "accessorycode1",
      "headclasscode", "nationality", "sideburnscode", "accessorycolourcode4",
      "headvariation", "skintonecode", "outfitid", "skincomplexion",
      "accessorycode2", "hairstylecode", "bodytypecode", "managerjointeamdate",
      "accessorycolourcode2", "facialhaircolorcode"
    ],
    template: "{firstname},,{lastname},{eyebrowcode},0,0,{facialhairtypecode},{managerid},0,{hairtypecode},0,{skinsurfacepack},0,0,{headtypecode},{height},{seasonaloutfitid},145895,0,{weight},0,2,0,45119,{ethnicity},3,{teamid},5,{personalityid},0,0,0,{nationality},0,0,0,{skintonecode},{outfitid},4,0,0,{bodytypecode},159680,0,{facialhaircolorcode}"
  },
  language_strings: {
    columns: [
      "langid", "stringid", "stringvalue", "hash"
    ],
    template: "0,{stringid},{stringvalue},{hash}"
  }
};