import json
import random
import pandas as pd
from pathlib import Path
import os
from collections import defaultdict

class TeamDataProcessor:
    def __init__(self):
        self.data_dir = self._get_data_dir()
        self.templates = self.load_templates()
        self.position_mapping = {
            'GK': 0, 'SW': 1, 'RWB': 2, 'RB': 3, 'RCB': 4, 'CB': 5, 'LCB': 6, 'LB': 7, 'LWB': 8,
            'RDM': 9, 'CDM': 10, 'LDM': 11, 'RM': 12, 'RCM': 13, 'CM': 14, 'LCM': 15, 'LM': 16,
            'RAM': 17, 'CAM': 18, 'LAM': 19, 'RF': 20, 'CF': 21, 'LF': 22, 'RW': 23, 'RS': 24,
            'ST': 25, 'LS': 26, 'LW': 27
        }
        self.random_values = self.load_random_values()
        self.names_data = self.load_names_data()
        self.country_list = list(self.names_data.keys())
        self.template_assignments = {}

    def _get_data_dir(self):
        """Get the correct data directory path"""
        possible_paths = [
            Path(__file__).parent / 'data',
            Path(os.getcwd()) / 'data',
            Path(os.path.dirname(os.path.abspath(__file__))) / 'data'
        ]
        
        for path in possible_paths:
            if path.exists():
                return path
        raise FileNotFoundError(f"Could not find 'data' directory in: {[str(p) for p in possible_paths]}")

    def load_random_values(self):
        """Load random values for manager generation"""
        file_path = self.data_dir / 'manager_random_values.json'
        return self._load_json_file(file_path)

    def load_names_data(self):
        """Load nationality-based names"""
        file_path = self.data_dir / 'names.json'
        return self._load_json_file(file_path)

    def _load_json_file(self, file_path):
        """Helper method to load JSON files with multiple encoding attempts"""
        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'windows-1252']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return json.load(f)
            except (UnicodeDecodeError, json.JSONDecodeError):
                continue
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read().decode('utf-8', errors='replace')
                return json.loads(content)
        except Exception as e:
            raise Exception(f"Failed to load {file_path.name} with all encodings: {str(e)}")

    def load_templates(self):
        """Load all JSON templates from the data directory"""
        template_files = {
            'teams': 'teams_template.json',
            'teamkits': 'teamkits_template.json',
            'teammentality': 'teammentality_template.json',
            'teamsheet': 'teamsheet_template.json',
            'formations': 'formations_template.json',
            'teamplayerlink': 'teamplayerlink_template.json',
            'managers': 'managers_template.json',
            'language_strings': 'language_strings_template.json'
        }
        
        templates = {}
        for name, filename in template_files.items():
            try:
                with open(self.data_dir / filename, 'r', encoding='utf-8') as f:
                    templates[name] = json.load(f)
            except Exception as e:
                raise Exception(f"Error loading {filename}: {str(e)}")
        
        formation_templates = list(templates['formations']['templates'].keys())
        mentality_templates = list(templates['teammentality']['templates'].keys())
        
        common_templates = set(formation_templates) & set(mentality_templates)
        templates['common_template_numbers'] = sorted([int(t.replace('template', '')) for t in common_templates])
        
        return templates

    def _get_column_insensitive(self, df, column_name):
        """Get column data case-insensitively"""
        for col in df.columns:
            if col.lower() == column_name.lower():
                return col
        return None

    def process_data(self, teams_df, players_df, is_national_team=False):
        """Process the data and generate all required tables"""
        # Get teamid and teamname columns case-insensitively
        teamid_col = self._get_column_insensitive(teams_df, 'teamid')
        teamname_col = self._get_column_insensitive(teams_df, 'teamname')
        
        if teamid_col is None or teamname_col is None:
            raise ValueError(f"Could not find 'teamid' or 'teamname' columns. Available: {teams_df.columns.tolist()}")
        
        # Get player columns case-insensitively
        playerid_col = self._get_column_insensitive(players_df, 'playerid')
        team_col = self._get_column_insensitive(players_df, 'team')
        position_col = self._get_column_insensitive(players_df, 'position1')  # Use Position1
        ovr_col = self._get_column_insensitive(players_df, 'ovr')
        
        if playerid_col is None:
            raise ValueError(f"Could not find 'playerid' column. Available: {players_df.columns.tolist()}")
        
        if position_col is None:
            raise ValueError(f"Could not find 'Position1' column. Available: {players_df.columns.tolist()}")
        
        results = {name: [] for name in self.templates.keys() if name != 'common_template_numbers'}
        all_team_ids = teams_df[teamid_col].tolist()
        
        rival_assignments = self._assign_rival_teams(all_team_ids)
        template_assignments = self._assign_templates_to_teams(all_team_ids)
        
        for _, team in teams_df.iterrows():
            team_id = team[teamid_col]
            team_name = team[teamname_col]
            
            # Filter players for this team
            team_players = players_df[players_df[team_col] == team_name].copy()
            if len(team_players) == 0:
                continue
                
            template_num = template_assignments[team_id]
            
            team_data = self.process_single_team(
                team_id, 
                team_name, 
                team_players, 
                is_national_team, 
                all_team_ids,
                rival_assignments.get(team_id, -1),
                template_num,
                playerid_col,
                position_col,
                ovr_col
            )
            
            for table_name, data in team_data.items():
                results[table_name].extend(data)
        
        return {
            table_name: pd.DataFrame(data, columns=self.templates[table_name]['columns'])
            for table_name, data in results.items()
        }

    def _assign_templates_to_teams(self, team_ids):
        """Assign templates to teams as evenly as possible"""
        template_numbers = self.templates['common_template_numbers']
        if not template_numbers:
            raise ValueError("No common templates found between formations and mentality")
        
        assignments = {}
        for i, team_id in enumerate(team_ids):
            template_idx = i % len(template_numbers)
            assignments[team_id] = template_numbers[template_idx]
        
        return assignments

    def _assign_rival_teams(self, team_ids):
        """Assign each team a unique rival team"""
        if len(team_ids) < 2:
            return {}
            
        shuffled_ids = team_ids.copy()
        random.shuffle(shuffled_ids)
        
        rival_assignments = {}
        for i in range(len(shuffled_ids)):
            rival_index = (i + 1) % len(shuffled_ids)
            rival_assignments[shuffled_ids[i]] = shuffled_ids[rival_index]
        
        return rival_assignments

    def process_single_team(self, team_id, team_name, team_players, is_national_team, all_team_ids, rival_team_id, template_num, playerid_col, position_col, ovr_col):
        """Process data for a single team with specific template number"""
        team_players = team_players.copy()
        
        # Rename columns to standard names
        team_players = team_players.rename(columns={
            playerid_col: 'playerid',
            position_col: 'Position',
            ovr_col: 'OVR'
        })
        
        # Convert position to numeric
        team_players['NumericPosition'] = team_players['Position'].apply(
            lambda x: self.position_mapping.get(str(x).upper(), 28)
        )
        
        # Sort by OVR
        team_players = team_players.sort_values('OVR', ascending=False)
        
        position_assignments, main_players = self.assign_players_to_positions(team_players)
        special_roles = self.select_special_roles(main_players)
        manager_id = team_id * 1000
        nationality_code = random.choice(self.random_values['nationalities'])
        
        return {
            'teams': [self.generate_team_row(team_id, team_name, special_roles, rival_team_id)],
            'teamkits': self.generate_teamkits_rows(team_id),
            'teammentality': self.generate_teammentality_rows(team_id, special_roles, template_num),
            'teamsheet': [self.generate_teamsheet_row(team_id, team_players, special_roles, template_num)],
            'formations': [self.generate_formation_row(team_id, template_num)],
            'teamplayerlink': self.generate_teamplayerlink_rows(team_id, position_assignments, team_players, is_national_team),
            'managers': [self.generate_manager_row(team_id, manager_id, nationality_code)],
            'language_strings': self.generate_language_strings(team_id, team_name)
        }

    def assign_players_to_positions(self, team_players):
        """Assign players to specific positions with priority to exact matches"""
        position_order = [
            (0, 0),   # GK
            (3, 1),   # RB
            (4, 2),   # RCB
            (6, 3),   # LCB
            (7, 4),   # LB
            (10, 5),  # CDM
            (13, 6),  # RCM
            (15, 7),  # LCM
            (23, 8),  # RW
            (25, 9),  # ST
            (27, 10)  # LW
        ]
        
        assigned_players = set()
        position_assignments = {}
        main_players = []
        
        # First pass: exact position matches
        for pos, artificial_key in position_order:
            candidates = team_players[
                (~team_players['playerid'].isin(assigned_players)) & 
                (team_players['NumericPosition'] == pos)
            ].copy()
            
            if not candidates.empty:
                player = candidates.iloc[0]
                position_assignments[(pos, artificial_key)] = player['playerid']
                main_players.append(player['playerid'])
                assigned_players.add(player['playerid'])
        
        # Second pass: compatible position matches
        for pos, artificial_key in position_order:
            if (pos, artificial_key) not in position_assignments:
                compatible_positions = self.get_compatible_positions(pos)
                candidates = team_players[
                    (~team_players['playerid'].isin(assigned_players)) & 
                    (team_players['NumericPosition'].isin(compatible_positions))
                ].copy()
                
                if not candidates.empty:
                    player = candidates.iloc[0]
                    position_assignments[(pos, artificial_key)] = player['playerid']
                    main_players.append(player['playerid'])
                    assigned_players.add(player['playerid'])
        
        # Third pass: any remaining players
        for pos, artificial_key in position_order:
            if (pos, artificial_key) not in position_assignments:
                candidates = team_players[~team_players['playerid'].isin(assigned_players)].copy()
                if not candidates.empty:
                    player = candidates.iloc[0]
                    position_assignments[(pos, artificial_key)] = player['playerid']
                    main_players.append(player['playerid'])
                    assigned_players.add(player['playerid'])
        
        return position_assignments, main_players

    def get_compatible_positions(self, position):
        """Return compatible positions in order of preference"""
        compatibility_map = {
            0: [0],  # GK
            3: [3, 4, 5, 6, 7, 10],  # RB
            4: [4, 5, 6, 3, 7, 10],   # RCB
            6: [6, 5, 4, 7, 3, 10],   # LCB
            7: [7, 4, 5, 6, 3, 10],   # LB
            10: [10, 13, 14, 15, 9, 11, 4, 5, 6],  # CDM
            13: [13, 14, 15, 10, 12, 16, 17, 19],  # RCM
            15: [15, 14, 13, 10, 16, 12, 19, 17],  # LCM
            23: [23, 17, 20, 19, 27, 12, 16],      # RW
            25: [25, 21, 24, 26, 20, 22, 23, 27],  # ST
            27: [27, 19, 22, 16, 23, 17, 20]       # LW
        }
        return compatibility_map.get(position, [])

    def select_special_roles(self, main_players):
        """Select players for special roles from starting players only"""
        if not main_players:
            return [-1] * 7
        
        if len(main_players) >= 7:
            selected = random.sample(main_players, 7)
        else:
            selected = random.choices(main_players, k=7)
        
        if len(main_players) >= 3:
            selected[4] = main_players[0]
        
        return selected

    def generate_team_row(self, team_id, team_name, special_roles, rival_team_id):
        """Generate teams table row with proper special role assignments"""
        template = self.templates['teams']['template']

        replacements = {
            'team_id': team_id,
            'teamid': team_id,
            'team_name': team_name,
            'rightfreekicktakerid': special_roles[0],
            'longkicktakerid': special_roles[1],
            'rightcornerkicktakerid': special_roles[2],
            'leftcornerkicktakerid': special_roles[3],
            'captainid': special_roles[4],
            'leftfreekicktakerid': special_roles[5],
            'penaltytakerid': special_roles[6],
            'freekicktakerid': special_roles[0],
            'rivalteam': rival_team_id
        }

        for key, value in replacements.items():
            template = template.replace(f'{{{key}}}', str(value))

        return template.split(',')

    def generate_teamkits_rows(self, team_id):
        """Generate teamkits table rows"""
        rows = []
        for template in self.templates['teamkits']['templates']:
            filled = template.replace('{team_id}', str(team_id))
            rows.append(filled.split(','))
        return rows

    def generate_teammentality_rows(self, team_id, special_roles, template_num):
        """Generate teammentality table rows with proper special roles using assigned template"""
        template_key = f'template{template_num}'
        if template_key not in self.templates['teammentality']['templates']:
            template_key = 'template1'
        
        templates = self.templates['teammentality']['templates'][template_key]
        rows = []
        
        for template in templates:
            filled = template.replace('{team_id}', str(team_id))
            filled = filled.replace('{teamid}', str(team_id))
            
            role_replacements = {
                'rightfreekicktakerid': special_roles[0],
                'longkicktakerid': special_roles[1],
                'rightcornerkicktakerid': special_roles[2],
                'leftcornerkicktakerid': special_roles[3],
                'captainid': special_roles[4],
                'leftfreekicktakerid': special_roles[5],
                'penaltytakerid': special_roles[6],
                'playeridrelatedtoteam': special_roles[0],
                'playerid0': special_roles[0],
                'playerid1': special_roles[1],
                'playerid2': special_roles[2],
                'playerid3': special_roles[3],
                'playerid4': special_roles[4],
                'playerid5': special_roles[5],
                'playerid6': special_roles[6],
                'playerid7': special_roles[0],
                'playerid8': special_roles[1],
                'playerid9': special_roles[2],
                'playerid10': special_roles[3]
            }
            
            for role, player_id in role_replacements.items():
                filled = filled.replace(f'{{{role}}}', str(player_id))
            
            rows.append(filled.split(','))
        
        return rows

    def generate_teamsheet_row(self, team_id, team_players, special_roles, template_num):
        """Generate teamsheet table row with proper player ordering and special roles"""
        template = self.templates['teamsheet']['template']
        
        starting_order = [0, 3, 4, 6, 7, 10, 13, 15, 23, 25, 27]
        starting_players = []
        
        for pos in starting_order:
            candidates = team_players[team_players['NumericPosition'] == pos]
            if len(candidates) == 0:
                compatible_positions = self.get_compatible_positions(pos)
                candidates = team_players[team_players['NumericPosition'].isin(compatible_positions)]
            
            if len(candidates) > 0:
                player = candidates.sort_values('OVR', ascending=False).iloc[0]
                starting_players.append(player['playerid'])
            else:
                starting_players.append(-1)
        
        filled = template.replace('{team_id}', str(team_id))
        filled = filled.replace('{teamid}', str(team_id))
        
        for i in range(11):
            if i < len(starting_players):
                filled = filled.replace(f'{{playerid{i}}}', str(starting_players[i]))
            else:
                filled = filled.replace(f'{{playerid{i}}}', '-1')
        
        substitutes = team_players[
            ~team_players['playerid'].isin(starting_players)
        ].sort_values('OVR', ascending=False)
        
        for i in range(11, 52):
            sub_idx = i - 11
            if sub_idx < len(substitutes):
                filled = filled.replace(f'{{playerid{i}}}', str(substitutes.iloc[sub_idx]['playerid']))
            else:
                filled = filled.replace(f'{{playerid{i}}}', '-1')
        
        role_mapping = {
            'rightfreekicktakerid': special_roles[0],
            'longkicktakerid': special_roles[1],
            'rightcornerkicktakerid': special_roles[2],
            'leftcornerkicktakerid': special_roles[3],
            'captainid': special_roles[4],
            'leftfreekicktakerid': special_roles[5],
            'penaltytakerid': special_roles[6],
            'freekicktakerid': special_roles[0],
            'formationid': template_num
        }
        
        for role, player_id in role_mapping.items():
            filled = filled.replace(f'{{{role}}}', str(player_id))
        
        return filled.split(',')

    def generate_formation_row(self, team_id, template_num):
        """Generate formations table row with proper team_id using assigned template"""
        template_key = f'template{template_num}'
        if template_key not in self.templates['formations']['templates']:
            template_key = 'template1'
        
        template = self.templates['formations']['templates'][template_key][0]
        
        filled = template.replace('{team_id}', str(team_id))
        filled = filled.replace('{teamid}', str(team_id))
        filled = filled.replace('{formationid}', str(template_num))
        
        return filled.split(',')

    def generate_teamplayerlink_rows(self, team_id, position_assignments, team_players, is_national_team=False):
        """Generate teamplayerlink table rows with proper position assignments"""
        position_order = [
            (0, 0), (3, 1), (4, 2), (6, 3), (7, 4), 
            (10, 5), (13, 6), (15, 7), (23, 8), (25, 9), (27, 10)
        ]
        rows = []
        
        max_main_players = 26 if is_national_team else len(position_order)
        
        for pos, artificial_key in position_order[:max_main_players]:
            player_id = position_assignments.get((pos, artificial_key), -1)
            if player_id != -1:
                rows.append(f"0,0,0,0,{random.randint(1,99)},{pos},{artificial_key},{team_id},0,0,0,0,0,{player_id},3,0".split(','))
        
        if not is_national_team:
            subs = team_players[~team_players['playerid'].isin(position_assignments.values())].copy()
            for sub_idx, (_, player) in enumerate(subs.head(10).iterrows(), len(position_order)):
                rows.append(f"0,0,0,0,{random.randint(1,99)},28,{sub_idx},{team_id},0,0,0,0,0,{player['playerid']},3,0".split(','))
        
        for _, player in team_players.iterrows():
            rows.append(f"0,0,0,0,{random.randint(1,99)},0,0,111592,0,0,0,0,0,{player['playerid']},3,0".split(','))
        
        return rows

    def generate_manager_row(self, team_id, manager_id, nationality_code):
        """Generate a manager row with random attributes"""
        try:
            country_name = self.country_list[nationality_code - 1]
            country_data = self.names_data[country_name]
        except (IndexError, KeyError):
            country_name = self.country_list[0]
            country_data = self.names_data[country_name]
        
        replacements = {
            'firstname': random.choice(country_data['first_names']),
            'lastname': random.choice(country_data['last_names']),
            'eyebrowcode': random.choice(self.random_values['eyebrowcodes']),
            'facialhairtypecode': random.choice(self.random_values['facialhairtypecodes']),
            'managerid': manager_id,
            'hairtypecode': random.choice(self.random_values['hairtypecodes']),
            'skinsurfacepack': random.choice(self.random_values['skinsurfacepacks']),
            'headtypecode': random.choice(self.random_values['headtypecodes']),
            'height': random.choice(self.random_values['heights']),
            'seasonaloutfitid': random.choice(self.random_values['seasonaloutfitids']),
            'weight': random.choice(self.random_values['weights']),
            'ethnicity': random.choice(self.random_values['ethnicities']),
            'personalityid': random.choice(self.random_values['personalityids']),
            'nationality': nationality_code,
            'skintonecode': random.choice(self.random_values['skintonecodes']),
            'outfitid': random.choice(self.random_values['outfitids']),
            'bodytypecode': random.choice(self.random_values['bodytypecodes']),
            'facialhaircolorcode': random.choice(self.random_values['facialhaircolorcodes']),
            'teamid': team_id
        }
        
        template = self.templates['managers']['template']
        for key, value in replacements.items():
            template = template.replace(f'{{{key}}}', str(value))
        
        return template.split(',')

    def generate_language_strings(self, team_id, team_name):
        """Generate language strings with 3-letter abbreviation and full names for others"""
        strings = []
        template = self.templates['language_strings']['template']
        
        common_abbreviations = {
            "manchester united": "MUN",
            "manchester city": "MCI",
            "real madrid": "RMA",
            "barcelona": "FCB",
            "bayern munich": "FCB",
            "paris saint-germain": "PSG",
            "liverpool": "LIV",
            "chelsea": "CHE",
            "tottenham hotspur": "TOT",
            "arsenal": "ARS"
        }
        
        team_lower = team_name.lower()
        abbr3 = common_abbreviations.get(team_lower, None)
        
        if not abbr3:
            words = [w for w in team_name.split() if w]
            if len(words) == 2:
                abbr3 = f"{words[0][0].upper()}{words[1][:2].upper()}"
            elif len(words) >= 3:
                abbr3 = ''.join([w[0].upper() for w in words[:3]])[:3]
            else:
                abbr3 = team_name[:3].upper()
        
        variations = [
            ("TeamName_{teamid}", team_name),
            ("TeamName_Abbr3_{teamid}", abbr3),
            ("TeamName_Abbr7_{teamid}", team_name),
            ("TeamName_Abbr10_{teamid}", team_name),
            ("TeamName_Abbr15_{teamid}", team_name),
            ("CT_TeamName_{teamid}", team_name)
        ]
        
        for string_id, string_value in variations:
            hash_value = self._calculate_localization_hash(string_id.format(teamid=team_id))
            
            filled = template.replace('{stringid}', string_id.format(teamid=team_id))
            filled = filled.replace('{stringvalue}', string_value)
            filled = filled.replace('{hash}', str(hash_value))
            
            strings.append(filled.split(','))
        
        return strings

    def _calculate_localization_hash(self, text):
        """Calculate FIFA-style localization hash for string IDs"""
        hash_value = 0
        for char in text:
            hash_value = (hash_value * 31 + ord(char)) & 0xFFFFFFFF
        if hash_value & 0x80000000:
            hash_value = -0x100000000 + hash_value
        return hash_value