// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const remote = require("@electron/remote")
var childProcess = require('child_process')
var isFullScreen = 0;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
var menu = new Menu();
menu.append(new MenuItem({
	label:'Set Full Screen',
	click:function(){
		remote.BrowserWindow.setFullScreen(isFullScreen);
		isFullScreen = 1 - isFullScreen;
	}
	})
)
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.popup(remote.getCurrentWindow());
}, false);


function setDisplayWelcome(){

	var hour;
	let date=new Date();

	  if(date.getHours()>=0&&date.getHours()<12){

		hour="上午好，"

	  }else if(date.getHours()>=12&&date.getHours()<18){

		hour="下午好，"

	  }else{

		hour="晚上好，"

	  }
	$("#display-welcome").text(hour + require('os').userInfo().username);
	$("#display-welcome").fadeOut(2000);
	setTimeout('$("#display-welcome-out").addClass("mdui-hidden");$("#appMain").removeClass("mdui-hidden");',2000);
	
}
var fileCounter,fileCounterDeleted=0;
remote.app.whenReady().then(() => {
	fileCounter = 0;
  setDisplayWelcome();
})

	
	
function fileListObject(id,name,path,destType){
	this.id=id;
	this.name=name;
	this.path=path;
	this.deleted=false;
	this.destType=destType;
}
var fileList = new Array(undefined);
function addTask(file,destType){
	
	  fileList[fileCounter]=new fileListObject(fileCounter,file.name,file.path,destType)
	  
	  
	  
	  var filelistContent = "";
	  filelistContent += ("<td><button onclick=removeTask("+fileCounter+") class='mdui-btn mdui-btn-icon mdui-btn-dense mdui-color-theme-accent mdui-ripple'><i class='mdui-icon material-icons'>delete</i></button></td>");
	  //filelistContent += ("<td>" + fileCounter + "</td>");

	  filelistContent += ("<td mdui-tooltip={content:'"+(file.path).replaceAll("\\","\\\\")+"'}>" + (file.name.length>24?file.name.substr(0,21)+"...":file.name) + "</td>");
	  var fileSize = "";
	  if(file.size>=0&&file.size<1145.14) fileSize = file.size+" B";
	  else if(file.size>=1145.14&&file.size<1919810) fileSize = (file.size / 1024).toFixed(1)+" KB";
	  else if(file.size>=1919810&&file.size<1100000000) fileSize = (file.size / 1024 / 1024).toFixed(1)+" MB";
	  else fileSize = (file.size / 1024 / 1024 / 1024).toFixed(1) +" GB";
	  filelistContent += ("<td>" + fileSize + "</td>");
	  filelistContent += ("<td>" + file.name.split(".")[file.name.split(".").length-1]+ "</td>");
	  filelistContent += ("<td>" + destType + "</td>");
      $('#filelistBody').append("<tr id='tid-"+fileCounter+"' class='mdui-table-row-selected'>"+filelistContent+"</tr>")
	  mdui.updateTables("#fileSheet");
	  $("#sendBtn").attr("disabled",null);
	  fileCounter++;
}
var file;
var fs = require('fs');
  var holder = document.getElementById('holder');
  holder.ondragover = function () {
    return false;
  };
  holder.ondragleave = holder.ondragend = function () {
    return false;
  };
  holder.ondrop = function (e) {
    e.preventDefault();
    file = e.dataTransfer.files[0];
    //fs.readFile(file.path,'utf8',function(err,data){
	if(!(file.type.split("/")[0]=="video"||file.type.split("/")[0]=="audio")){
		mdui.snackbar("文件类型不受支持<br>请检查文件后再试",{
			timeout:1000,
			position:"right-top"
		});
		  return "fileTypeUnsupport";
	  }
	  new mdui.Dialog("#addTaskDialog", {
		  modal:false
	  }).open();
    //});
    return 0;
  };
  
function removeTask(id){
	$("#tid-"+id).addClass("mdui-hidden");
	fileList[id].deleted=true;
	fileCounterDeleted++;
	if(fileCounterDeleted==fileCounter){
		$("#sendBtn").attr("disabled","disabled");
	}
}


$("#holderClickUpload").on("change",function (){
	for(var i=0;i<this.files.length;i++){
		file = this.files[i];
		if(!(file.type.split("/")[0]=="video"||file.type.split("/")[0]=="audio")){
		mdui.snackbar("文件类型不受支持<br>请检查文件后再试",{
			timeout:1000,
			position:"right-top"
		});
		  return "fileTypeUnsupport";
	  }
	  var dialogStatus=new mdui.Dialog("#addTaskDialog", {
		  modal:false
	  });
	  dialogStatus.open();
	}
	
});

function process(){
	$('#processProgress').removeClass('mdui-hidden');
	$('#sendBtn').attr("disabled","disabled");
	for(var i=0;i<fileCounter;i++){
		if(fileList[i].deleted){continue;}
		processFile(fileList[i]);
	}
}

function processFile(fileObj){
	var fName = fileObj.name.substr(0,(fileObj.name.length - fileObj.name.split('.')[fileObj.name.split('.').length-1].length - 1));
	console.log("./ffmpeg.exe -i \""+fileObj.path+"\" \""+fName+"."+fileObj.destType+"\"");
	var proc = child_process.spawn("./ffmpeg.exe -i \""+fileObj.path+"\" \""+fName+"."+fileObj.destType+"\"");
}