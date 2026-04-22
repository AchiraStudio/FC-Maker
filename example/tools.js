function editedplayernamesobjtostring26(obj) {
  // Define the headers for the editedplayernames table
  const headers = ['firstname', 'commonname', 'playerjerseyname', 'surname', 'playerid'];

  // Create the header row by joining headers with tabs
  const headerRow = headers.join('\t');

  // Initialize an array to hold all rows, starting with the header
  const allRows = [headerRow];

  // Assuming obj is an array of player objects for this table
  obj.forEach(player => {
      // Map the headers to the player's values, assuming all keys exist in the player object
      const valuesRow = headers.map(header => {
          if (!(header in player)) {
              throw new Error(`Missing data: the key '${header}' does not exist in the player.`);
          }
          return String(player[header]);
      }).join('\t');

      // Add the values row to the allRows array
      allRows.push(valuesRow);
  });

  // Combine all rows, separated by newline characters, into a single string
  return allRows.join('\n');
}

function playerstableobjtostring26(obj){

    const keysorder=["firstnameid","lastnameid","playerjerseynameid","commonnameid","role4","role3","gkglovetypecode","role5","role2","role1","eyebrowcode","skintypecode","haircolorcode","facialhairtypecode","curve","jerseystylecode","agility","tattooback","accessorycode4","gksavetype","positioning","tattooleftarm","hairtypecode","facepsdlayer0","standingtackle","preferredposition3","longpassing","penalties","animfreekickstartposcode","lipcolor","isretiring","longshots","gkdiving","icontrait2","interceptions","shoecolorcode2","crossing","potential","gkreflexes","finishingcode1","reactions","composure","skinsurfacepack","vision","contractvaliduntil","finishing","dribbling","slidingtackle","accessorycode3","preferredposition5","accessorycolourcode1","headtypecode","driref","sprintspeed","undershortstyle","height","hasseasonaljersey","tattoohead","preferredposition2","strength","shoetypecode","birthdate","preferredposition1","tattooleftleg","skinmakeup","ballcontrol","phypos","shotpower","trait1","socklengthcode","weight","hashighqualityhead","eyedetail","tattoorightarm","icontrait1","balance","gender","headassetid","gkkicking","defspe","internationalrep","preferredposition6","shortpassing","freekickaccuracy","skillmoves","faceposerpreset","usercaneditname","avatarpomid","finishingcode2","aggression","acceleration","paskic","headingaccuracy","iscustomized","preferredposition7","runningcode2","modifier","gkhandling","eyecolorcode","jerseysleevelengthcode","sockstylecode","accessorycolourcode3","accessorycode1","playerjointeamdate","headclasscode","tattoofront","nationality","preferredfoot","sideburnscode","weakfootabilitytypecode","jumping","personality","gkkickstyle","stamina","playerid","accessorycolourcode4","gkpositioning","headvariation","skillmoveslikelihood","trait2","shohan","skintonecode","shortstyle","overallrating","smallsidedshoetypecode","emotion","runstylecode","facepsdlayer1","muscularitycode","skincomplexion","jerseyfit","accessorycode2","shoedesigncode","shoecolorcode1","hairstylecode","bodytypecode","animpenaltiesstartposcode","pacdiv","defensiveawareness","runningcode1","preferredposition4","volleys","accessorycolourcode2","tattoorightleg","facialhaircolorcode"
];

    // Create the header row by joining keysOrder with tabs
  const headerrow = keysorder.join('\t');

  // Initialize an array to hold all rows including the header
  const allrows = [headerrow];

  // Map the keys to the object's values, throw an error if a key is missing
  Object.keys(obj).forEach(nestedobjectkey => {
    const nestedobj = obj[nestedobjectkey];

    // Create a tab-delimited string for the current nested object
    const valuesrow = keysorder.map(key => {
        if (!(key in nestedobj)) {
            throw new Error(`Missing data: the key '${key}' does not exist in the nested object.`);
        }
        return String(nestedobj[key]);
    }).join('\t');

    
    // Add the values row to the allRows array
    allrows.push(valuesrow);

    });

  // Combine all rows, separated by newline characters, into a single string
  return allrows.join('\n');
}

function findnameid(name) {
  let nameid = 0; // Default to 0 if name is not found
  defaultplayernamestable26.forEach((player) => {
      if (player.name === name) {
          nameid = player.nameid;
          return; // This return exits the current iteration but not the forEach loop
      }
  });
  defaultdcplayernamestable26.forEach((player) => {
    if (player.name === name) {
        nameid = player.nameid;
        return; // This return exits the current iteration but not the forEach loop
    }
});
  return nameid;
}

function getshoe(){
  let arr = [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,95,96,97,98,99,100,101,102,103,104,105,106,107,108,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315];
  let shoe = arr[randbetween(0,arr.length-1)];
  return shoe;
}

function getgkglove(){
  let arr = [73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,100,102,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,125,126];
  let glove = arr[randbetween(0,arr.length-1)];
  return glove;
}

function findplayerid(input){

  if(input!=0){
    if(!burnedplayerids.find(x=>input==x)){
      return input;
    }
  }

  let startpt=1;
  if(input!=0){
    let startpt=input;
  }
  
  for(i=startpt;i<500000;i++){
    if(burnedplayerids.includes(i)){continue}else{
      burnedplayerids.push(i);
      return i;
    }
  }
}
