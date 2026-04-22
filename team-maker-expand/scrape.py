import sys
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
from fake_useragent import UserAgent
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
                             QLabel, QLineEdit, QPushButton, QTextEdit, 
                             QWidget, QFileDialog, QProgressBar, QMessageBox, QComboBox)
from PyQt5.QtCore import Qt, QThread, pyqtSignal
import time
import random
import math
import re
from collections import defaultdict

class ScraperThread(QThread):
    update_signal = pyqtSignal(str)
    progress_signal = pyqtSignal(int)
    # Changed to emit a dictionary containing both DataFrames
    finished_signal = pyqtSignal(dict) 
    error_signal = pyqtSignal(str)

    def __init__(self, url, mode):
        super().__init__()
        self.url = url
        self.mode = mode  # 'league', 'worldcup', or 'cup'
        self.running = True
        self.max_retries = 3
        self.error_teams = defaultdict(int)
        self.successful_team_names = set() # Track teams that successfully yielded players
        self.headers = {
            'User-Agent': UserAgent().random,
            'Accept-Language': 'en-US,en;q=0.9',
        }

    def run(self):
        try:
            self.update_signal.emit("Starting team collection...")
            teams = self.get_teams()
            
            if not teams:
                raise ValueError("No teams found on the page. Check the URL and Mode.")
            
            self.update_signal.emit(f"Found {len(teams)} teams to process")
            
            all_players = []
            total_teams = len(teams)
            
            for i, (team_name, team_url) in enumerate(teams.items()):
                if not self.running:
                    break
                
                players = self.process_team(team_name, team_url)
                if players:
                    all_players.extend(players)
                    self.successful_team_names.add(team_name) # Mark as successful
                    if team_name in self.error_teams:
                        del self.error_teams[team_name]
                else:
                    self.error_teams[team_name] = team_url
                
                progress = int((i + 1) / total_teams * 85)
                self.progress_signal.emit(progress)
                self.update_signal.emit(f"Processed {team_name} ({i+1}/{total_teams})")
            
            if self.running and self.error_teams:
                self.retry_failed_teams(all_players)
            
            if all_players:
                df_players = pd.DataFrame(all_players)
                
                # Create the Teams DataFrame based on successfully scraped teams
                teams_list = []
                # Sort alphabetically and assign IDs starting from 1001
                for idx, team_name in enumerate(sorted(list(self.successful_team_names)), start=1001):
                    teams_list.append({'teamid': idx, 'teamname': team_name})
                df_teams = pd.DataFrame(teams_list)
                
                # Emit both DataFrames
                self.finished_signal.emit({"teams": df_teams, "players": df_players})
                self.update_signal.emit(f"\nScraping completed! {len(all_players)} players from {len(self.successful_team_names)} teams")
            else:
                self.error_signal.emit("No player data collected")
            
        except Exception as e:
            self.error_signal.emit(f"Scraping failed: {str(e)}")

    def get_teams(self):
        if self.mode == 'worldcup':
            return self.get_worldcup_teams()
        elif self.mode == 'cup':
            return self.get_cup_competition_teams()
        else:
            return self.get_league_teams()

    def get_league_teams(self):
        teams = {}
        try:
            response = self.safe_request(self.url)
            if not response: return teams
            soup = BeautifulSoup(response.content, 'html.parser')
            table = soup.find('table', {'class': 'items'})
            if not table: return teams
            tbody = table.find('tbody')
            if not tbody: return teams
            
            rows = tbody.find_all('tr', class_=['odd', 'even'])
            for row in rows:
                name_cell = row.find('td', class_='hauptlink no-border-links')
                if name_cell:
                    a_tag = name_cell.find('a', title=True)
                    if a_tag and a_tag['title'] and a_tag.get('href'):
                        teams[a_tag['title']] = a_tag['href']
            return teams
        except Exception as e:
            self.update_signal.emit(f"Error getting league teams: {str(e)}")
            return teams

    def get_worldcup_teams(self):
        teams = {}
        try:
            response = self.safe_request(self.url)
            if not response: return teams
            soup = BeautifulSoup(response.content, 'html.parser')
            
            match_boxes = soup.find_all('div', class_='box pokalWettbewerbSpieltagsbox')
            match_box = match_boxes[-1] if match_boxes else None
            if not match_box: return teams
            
            match_rows = match_box.find_all('tr', class_='begegnungZeile')
            for row in match_rows:
                for side in ['heim', 'gast']:
                    team_cell = row.find('td', class_=f'verein-{side}')
                    if team_cell:
                        span = team_cell.find('span', class_='vereinsname')
                        if span:
                            a_tag = span.find('a')
                            if a_tag and a_tag.get('title') and a_tag.get('href'):
                                teams[a_tag['title']] = a_tag['href']
            return teams
        except Exception as e:
            self.update_signal.emit(f"Error getting WC teams: {str(e)}")
            return teams

    def get_cup_competition_teams(self):
        teams = {}
        try:
            response = self.safe_request(self.url)
            if not response: return teams
            soup = BeautifulSoup(response.content, 'html.parser')
            
            columns = soup.find_all(class_=['large-6 columns', 'large-12 columns'])
            for col in columns:
                table = col.find('table', class_='items')
                if not table: continue
                tbody = table.find('tbody')
                if not tbody: continue
                
                rows = tbody.find_all('tr', limit=4)
                for row in rows:
                    td = row.find('td', class_='no-border-links hauptlink')
                    if td:
                        a_tag = td.find('a')
                        if a_tag and a_tag.get('title') and a_tag.get('href'):
                            teams[a_tag['title']] = a_tag['href']
            return teams
        except Exception as e:
            self.update_signal.emit(f"Error getting Cup teams: {str(e)}")
            return teams

    def build_squad_url(self, team_url):
        """Forces 2026 Squad Details"""
        match = re.match(r'^(\/[^/]+)\/[^/]+\/verein\/(\d+)', team_url)
        if match:
            slug, vid = match.groups()
            return f"https://www.transfermarkt.com{slug}/kader/verein/{vid}/saison_id/2026/plus/1"
        
        fallback = team_url
        fallback = re.sub(r'\/spielplan\/', '/kader/', fallback)
        fallback = re.sub(r'\/startseite\/', '/kader/', fallback)
        fallback = re.sub(r'\/saison_id\/\d+', '', fallback)
        return f"https://www.transfermarkt.com{fallback}/saison_id/2026/plus/1"

    def process_team(self, team_name, team_url):
        try:
            self.update_signal.emit(f"\nProcessing {team_name}...")
            
            squad_url = self.build_squad_url(team_url)
            response = self.safe_request(squad_url)
            
            if not response:
                self.update_signal.emit(f"⚠️ Failed to fetch {team_name}")
                return []
            
            players = self.parse_players(response.content, team_name)
            self.update_signal.emit(f"✓ Found {len(players)} players in {team_name}")
            return players
            
        except Exception as e:
            self.update_signal.emit(f"⚠️ Error processing {team_name}: {str(e)}")
            return []

    def parse_players(self, html_content, team_name):
        players = []
        soup = BeautifulSoup(html_content, 'html.parser')
        items_table = soup.find('table', {'class': 'items'})
        if not items_table: return players
        tbody = items_table.find('tbody')
        if not tbody: return players
        
        for row in tbody.find_all('tr', class_=['odd', 'even']):
            player_data = {
                'Nationality': '', 'Firstname': '', 'Lastname': '', 'Jerseyname': '',
                'Commonname': '', 'MarketValue': '', 'OVR': '', 'Position1': '',
                'Position2': '', 'Position3': '', 'Position4': '', 'PreferredFoot': '',
                'WeakFoot': str(random.randint(1, 4)), 'Birthdate': '', 'Height': '',
                'Weight': str(random.randint(55, 90)), 'SkillMoves': str(random.randint(1, 4)),
                'Team': team_name
            }
            
            self.extract_name_position(row, player_data)
            self.process_player_names(player_data)
            self.extract_nationality(row, player_data)
            self.extract_attributes(row, player_data)
            self.calculate_ovr(player_data)
            self.generate_secondary_positions(player_data)
            
            if player_data['Firstname'] or player_data['Lastname'] or player_data['Commonname']:
                players.append(player_data)
        return players

    def extract_name_position(self, row, player_data):
        inline_table = row.find('table', class_='inline-table')
        if inline_table:
            trs = inline_table.find_all('tr')
            if len(trs) > 0:
                name_td = trs[0].find('td', class_='hauptlink')
                if name_td:
                    name_a = name_td.find('a')
                    if name_a:
                        player_data['Name'] = re.sub(r'\s+', ' ', name_a.text.strip())
            if len(trs) > 1:
                position_td = trs[1].find('td')
                if position_td:
                    player_data['Position1'] = self.convert_position(position_td.text.strip())

    def convert_position(self, position):
        p = position.strip().lower()
        if 'goalkeeper' in p: return 'GK'
        if 'centre-back' in p or 'center back' in p: return 'CB'
        if 'left-back' in p: return 'LB'
        if 'right-back' in p: return 'RB'
        if 'defensive midfield' in p: return 'CDM'
        if 'central midfield' in p: return 'CM'
        if 'attacking midfield' in p: return 'CAM'
        if 'left winger' in p: return 'LW'
        if 'right winger' in p: return 'RW'
        if 'second striker' in p: return random.choice(['CAM', 'ST'])
        if 'centre-forward' in p or 'center forward' in p: return 'ST'
        return p.upper() if len(p) <= 3 else p.title()

    def generate_secondary_positions(self, player_data):
        main_pos = player_data['Position1']
        if not main_pos: return
        
        position_groups = {
            'GK': [], 'CB': ['CDM', 'RB', 'LB'], 'RB': ['CB', 'RM', 'CDM'],
            'LB': ['CB', 'LM', 'CDM'], 'CDM': ['CB', 'CM'], 'CM': ['CDM', 'CAM', 'RM', 'LM'],
            'CAM': ['CM', 'CF', 'LW', 'RW'], 'LM': ['LW', 'CM', 'CAM'], 'RM': ['RW', 'CM', 'CAM'],
            'LW': ['LM', 'ST', 'CAM'], 'RW': ['RM', 'ST', 'CAM'], 'ST': ['CF', 'LW', 'RW', 'CAM'],
            'CF': ['ST', 'CAM']
        }
        
        possible_positions = position_groups.get(main_pos, [])
        random.shuffle(possible_positions)
        
        if possible_positions and random.random() < 0.2:
            player_data['Position2'] = possible_positions[0]
            if len(possible_positions) > 1 and random.random() < 0.1:
                player_data['Position3'] = possible_positions[1]
                if len(possible_positions) > 2 and random.random() < 0.05:
                    player_data['Position4'] = possible_positions[2]

    def process_player_names(self, player_data):
        full_name = player_data.get('Name', '')
        if not full_name: return
        full_name = re.sub(r'\s+', ' ', full_name.strip())
        name_parts = full_name.split()
        
        if len(name_parts) == 1:
            player_data['Firstname'] = full_name
            player_data['Lastname'] = ''
            player_data['Commonname'] = full_name
            player_data['Jerseyname'] = full_name
            return
            
        player_data['Commonname'] = ''
        if len(name_parts) == 2:
            player_data['Firstname'] = name_parts[0]
            player_data['Lastname'] = name_parts[1]
        elif len(name_parts) == 3:
            if random.random() < 0.5:
                player_data['Firstname'] = name_parts[0]
                player_data['Lastname'] = ' '.join(name_parts[1:])
            else:
                player_data['Firstname'] = ' '.join(name_parts[:2])
                player_data['Lastname'] = name_parts[2]
        else:
            player_data['Firstname'] = ' '.join(name_parts[:2])
            player_data['Lastname'] = ' '.join(name_parts[2:])
        
        variants = []
        if player_data['Firstname'] and player_data['Lastname']:
            variants.append(full_name)
            if f"{player_data['Firstname']} {player_data['Lastname']}" != full_name:
                variants.append(f"{player_data['Firstname']} {player_data['Lastname']}")
            initial = player_data['Firstname'][0] + '.'
            variants.append(f"{initial} {player_data['Lastname']}")
            if len(player_data['Lastname']) > 1: variants.append(player_data['Lastname'])
            if len(player_data['Firstname']) > 1: variants.append(player_data['Firstname'])
        
        player_data['Jerseyname'] = random.choice(variants) if variants else full_name

    def extract_nationality(self, row, player_data):
        flag_img = row.find('img', class_='flaggenrahmen')
        if flag_img and flag_img.has_attr('title'):
            player_data['Nationality'] = flag_img['title']

    def extract_attributes(self, row, player_data):
        zentriert_tds = row.find_all('td', class_='zentriert')
        
        for td in zentriert_tds:
            text = td.text.strip()
            if re.match(r'^\d{2}\/\d{2}\/\d{4}', text):
                try:
                    date_str = text.split('(')[0].strip()
                    date_obj = datetime.strptime(date_str, '%d/%m/%Y')
                    player_data['Birthdate'] = date_obj.strftime('%Y-%m-%d')
                except: pass
                break

        for td in zentriert_tds:
            text = td.text.strip()
            if re.match(r'^\d[,.]?\d+m$', text):
                try:
                    h = float(text.replace('m', '').replace(',', '.'))
                    player_data['Height'] = str(int(h * 100))
                except: pass
                break

        for td in zentriert_tds:
            text = td.text.strip().lower()
            if text in ['right', 'left', 'both']:
                player_data['PreferredFoot'] = text.capitalize()
                break
        
        if not player_data['PreferredFoot']:
            player_data['PreferredFoot'] = 'Left' if random.random() < 0.15 else 'Right'
        
        market_value_td = row.find('td', class_='rechts hauptlink')
        if market_value_td:
            market_value_a = market_value_td.find('a')
            if market_value_a:
                player_data['MarketValue'] = market_value_a.text.strip()

    def calculate_ovr(self, player_data):
        if not player_data['MarketValue']:
            player_data['OVR'] = str(50 + random.randint(0, 14))
            return
        
        try:
            value_str = player_data['MarketValue'].replace('€', '').replace(',', '').strip()
            multiplier = 1
            if 'k' in value_str.lower():
                value_str = value_str.lower().replace('k', '')
                multiplier = 1000
            elif 'm' in value_str.lower():
                value_str = value_str.lower().replace('m', '')
                multiplier = 1000000
            
            value = float(value_str) * multiplier
            
            min_value = 10000
            max_value = 200000000
            value = max(min_value, min(value, max_value))
            
            log_min = math.log10(min_value)
            log_max = math.log10(max_value)
            log_value = math.log10(value)
            
            scaled = 50 + 35 * ((log_value - log_min) / (log_max - log_min))
            ovr = round(scaled)
            ovr = min(85, max(50, ovr))
            
            ovr += random.randint(-2, 2)
            ovr = min(85, max(50, ovr))
            
            player_data['OVR'] = str(ovr)
        except Exception:
            player_data['OVR'] = str(50 + random.randint(0, 14))
            
    def retry_failed_teams(self, all_players):
        retry_count = 1
        while self.running and self.error_teams and retry_count <= self.max_retries:
            self.update_signal.emit(f"\n⚡ Retry pass {retry_count} for {len(self.error_teams)} failed teams")
            teams_to_retry = list(self.error_teams.items())
            self.error_teams.clear()
            
            for team_name, team_url in teams_to_retry:
                if not self.running: break
                players = self.process_team(team_name, team_url)
                if players:
                    all_players.extend(players)
                    self.successful_team_names.add(team_name) # Mark retried teams as successful too
                else:
                    self.error_teams[team_name] = team_url
            retry_count += 1
        
        if self.error_teams:
            self.update_signal.emit(f"\n⚠️ Could not process {len(self.error_teams)} teams after {self.max_retries} retries")

    def safe_request(self, url, retry_count=0):
        if retry_count >= 3: return None
        try:
            delay = random.uniform(1, 4)
            time.sleep(delay)
            self.headers['User-Agent'] = UserAgent().random
            
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 503:
                time.sleep(5 * (retry_count + 1))
                return self.safe_request(url, retry_count + 1)
                
            if "Checking your browser" in response.text or "cf-browser-verification" in response.text:
                time.sleep(4)
                return self.safe_request(url, retry_count + 1)
                
            response.raise_for_status()
            return response
            
        except requests.exceptions.RequestException:
            time.sleep(5 * (retry_count + 1))
            return self.safe_request(url, retry_count + 1)

    def stop(self):
        self.running = False


class TransfermarktScraper(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Transfermarkt Team Scraper (2026 Forced)")
        self.setGeometry(100, 100, 850, 650)
        self.init_ui()
        self.scraper_thread = None
        self.player_data = None
        self.teams_data = None  # New variable to hold teams DataFrame

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout()
        
        mode_layout = QHBoxLayout()
        mode_layout.addWidget(QLabel("Scraping Mode:"))
        self.mode_combo = QComboBox()
        self.mode_combo.addItem("League Mode", "league")
        self.mode_combo.addItem("World Cup Mode", "worldcup")
        self.mode_combo.addItem("Cup Competition Mode", "cup")
        mode_layout.addWidget(self.mode_combo)
        layout.addLayout(mode_layout)
        
        url_layout = QHBoxLayout()
        url_layout.addWidget(QLabel("Transfermarkt URL:"))
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("https://www.transfermarkt.com/...")
        url_layout.addWidget(self.url_input)
        layout.addLayout(url_layout)
        
        button_layout = QHBoxLayout()
        self.scrape_button = QPushButton("Start Scraping")
        self.scrape_button.clicked.connect(self.start_scraping)
        self.stop_button = QPushButton("Stop")
        self.stop_button.clicked.connect(self.stop_scraping)
        self.stop_button.setEnabled(False)
        self.export_button = QPushButton("Export to Excel")
        self.export_button.clicked.connect(self.export_to_excel)
        self.export_button.setEnabled(False)
        button_layout.addWidget(self.scrape_button)
        button_layout.addWidget(self.stop_button)
        button_layout.addWidget(self.export_button)
        layout.addLayout(button_layout)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.progress_bar)
        
        self.console = QTextEdit()
        self.console.setReadOnly(True)
        self.console.setStyleSheet("""
            QTextEdit {
                background-color: #f5f5f5;
                font-family: Consolas, monospace;
                font-size: 12px;
                border: 1px solid #ddd;
            }
        """)
        layout.addWidget(self.console)
        
        main_widget.setLayout(layout)

    def start_scraping(self):
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "Error", "Please enter a valid URL")
            return
        
        mode = self.mode_combo.currentData()
        
        self.console.clear()
        self.progress_bar.setValue(0)
        self.scrape_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.export_button.setEnabled(False)
        self.player_data = None
        self.teams_data = None
        
        self.scraper_thread = ScraperThread(url, mode)
        self.scraper_thread.update_signal.connect(self.update_console)
        self.scraper_thread.progress_signal.connect(self.update_progress)
        self.scraper_thread.finished_signal.connect(self.scraping_finished)
        self.scraper_thread.error_signal.connect(self.scraping_error)
        self.scraper_thread.start()

    def stop_scraping(self):
        if self.scraper_thread:
            self.scraper_thread.stop()
            self.stop_button.setEnabled(False)
            self.console.append("\nStopping process...")

    def update_console(self, message):
        self.console.append(message)
        cursor = self.console.textCursor()
        cursor.movePosition(cursor.End)
        self.console.setTextCursor(cursor)

    def update_progress(self, value):
        self.progress_bar.setValue(value)

    def scraping_finished(self, data):
        # Unpack the dictionary into the two separate DataFrames
        self.teams_data = data.get("teams")
        self.player_data = data.get("players")
        
        self.scrape_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.export_button.setEnabled(True)
        
        if self.player_data is not None:
            self.console.append("\n✓ Ready to export data!")
            QMessageBox.information(self, "Success", 
                                  f"Scraped {len(self.player_data)} players from {len(self.teams_data)} teams")

    def scraping_error(self, error_message):
        self.scrape_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.export_button.setEnabled(False)
        QMessageBox.critical(self, "Error", error_message)

    def export_to_excel(self):
        if self.player_data is None or self.player_data.empty:
            QMessageBox.warning(self, "Error", "No data to export")
            return
            
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getSaveFileName(
            self, "Save Excel File", "transfermarkt_data.xlsx",
            "Excel Files (*.xlsx);;All Files (*)", options=options
        )
        
        if file_name:
            if not file_name.endswith('.xlsx'):
                file_name += '.xlsx'
                
            try:
                # Reorder player columns
                player_columns = [
                    'Nationality', 'Firstname', 'Lastname', 'Jerseyname', 'Commonname',
                    'MarketValue', 'OVR', 'Position1', 'Position2',
                    'Position3', 'Position4', 'PreferredFoot', 'WeakFoot',
                    'Birthdate', 'Height', 'Weight', 'SkillMoves', 'Team'
                ]
                self.player_data = self.player_data[player_columns]
                
                # Use ExcelWriter to write multiple sheets
                with pd.ExcelWriter(file_name, engine='openpyxl') as writer:
                    # Sheet 1: Teams
                    self.teams_data.to_excel(writer, sheet_name='Teams', index=False)
                    
                    # Sheet 2: Players
                    self.player_data.to_excel(writer, sheet_name='Players', index=False)
                
                self.console.append(f"\nData exported to: {file_name}")
                QMessageBox.information(self, "Success", f"Data saved to:\n{file_name}\n\n(Contains 2 sheets: Teams & Players)")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Export failed:\n{str(e)}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = TransfermarktScraper()
    window.show()
    sys.exit(app.exec_())