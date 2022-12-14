// Modules to control application life and create native browser window
const {app, BrowserWindow,shell,BrowserView} = require('electron')

const path = require('path')

//...
var mainWindow;
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
		preload: path.join(__dirname, 'preload.js'),
		nodeIntegration: true,
		contextIsolation: false,
		enableRemoteModule: true
    }
	  
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  require('@electron/remote/main').initialize()
  require('@electron/remote/main').enable(mainWindow.webContents)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
	


  //BrowserWindow.webContents.openDevTools();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const {Menu, MenuItem,dialog} = require('electron')
const appMenu = new Menu()
appMenu.append(new MenuItem({
	label: '文件',
	submenu:[
	{
		label: '退出',
		accelerator: 'CmdOrCtrl+Q',
		click: () =>{
			app.quit()
		}
	},
	{
		label: 'DevTools',
		accelerator: 'CmdOrCtrl+D',
		click: () =>{
			mainWindow.webContents.openDevTools()
		}
	}
	]
	
}));
appMenu.append(new MenuItem({
	label: '关于',
	submenu:[
	{
		label: '捐助',
		click: () =>{
			var donateWin = new BrowserView();
			mainWindow.setBrowserView(donateWin);
			donateWin.setBounds({
				x:0,
				y:0,
				width:400,
				height:300
			});
			donateWin.webContents.loadURL("donate.html");
		}
	},
	{
		label: '关于',
		accelerator: 'CmdOrCtrl+A',
		click: () =>{
			dialog.showMessageBox(mainWindow,{
				type:"none",title:"关于",message:"Umbreyta 0.1\n由perryzhoupy编写\nUnder GPL 3.0 License"
				});
		}
	}
	]
	
}))
Menu.setApplicationMenu(appMenu)

