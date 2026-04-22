function defaultentrytgl(table) {
    switch(table){
      case "players":
        document.getElementById("playermaker_uploadplayertblcontainer").style.display = document.getElementById("playermaker_usedefaultplayers").checked ? "none" : "block";
      break;
      case "playernames":
        document.getElementById("playermaker_uploadplayernamestblcontainer").style.display = document.getElementById("playermaker_usedefaultplayernames").checked ? "none" : "block";
      break;
      case "dcplayernames":
        document.getElementById("playermaker_uploaddcplayernamestblcontainer").style.display = document.getElementById("playermaker_usedefaultdcplayernames").checked ? "none" : "block";
      break;
    }
  }

function guishow(){
    loggerupdate("• Startup complete");
    document.getElementById("div_playermaker").style = "display:block";
    loggerupdate("• Awaiting template upload");
}

function loggerupdate(newtext){
	let oldtext = document.getElementById("logger").value;
	document.getElementById("logger").value = newtext + "\n" + oldtext.trim() ;
}
