const { app, Menu } = require("electron");
const is = require("electron-is");

const { getAllPlugins } = require("./plugins/utils");
const config = require("./config");

const mainMenuTemplate = (win) => [
	{
		label: "Plugins",
		submenu: [
			...getAllPlugins().map((plugin) => {
				return {
					label: plugin,
					type: "checkbox",
					checked: config.plugins.isEnabled(plugin),
					click: (item) => {
						if (item.checked) {
							config.plugins.enable(plugin);
						} else {
							config.plugins.disable(plugin);
						}
					},
				};
			}),
			{ type: "separator" },
			{
				label: "Advanced options",
				click: () => {
					config.edit();
				},
			},
		],
	},
	{
		label: "Options",
		submenu: [
			{
				label: "Auto-update",
				type: "checkbox",
				checked: config.get("options.autoUpdates"),
				click: (item) => {
					config.set("options.autoUpdates", item.checked);
				},
			},
			{
				label: "Disable hardware acceleration",
				type: "checkbox",
				checked: config.get("options.disableHardwareAcceleration"),
				click: (item) => {
					config.set("options.disableHardwareAcceleration", item.checked);
				},
			},
			{
				label: "Restart on config changes",
				type: "checkbox",
				checked: config.get("options.restartOnConfigChanges"),
				click: (item) => {
					config.set("options.restartOnConfigChanges", item.checked);
				},
			},
			...(is.windows() || is.linux()
				? [
						{
							label: "Hide menu",
							type: "checkbox",
							checked: config.get("options.hideMenu"),
							click: (item) => {
								config.set("options.hideMenu", item.checked);
							},
						},
				  ]
				: []),
			...(is.windows() || is.macOS()
				? // Only works on Win/Mac
				  // https://www.electronjs.org/docs/api/app#appsetloginitemsettingssettings-macos-windows
				  [
						{
							label: "Start at login",
							type: "checkbox",
							checked: config.get("options.startAtLogin"),
							click: (item) => {
								config.set("options.startAtLogin", item.checked);
							},
						},
				  ]
				: []),
			{
				label: "Tray",
				submenu: [
					{
						label: "Disabled",
						type: "radio",
						checked: !config.get("options.tray"),
						click: () => {
							config.set("options.tray", false);
							config.set("options.appVisible", true);
						},
					},
					{
						label: "Enabled + app visible",
						type: "radio",
						checked:
							config.get("options.tray") && config.get("options.appVisible"),
						click: () => {
							config.set("options.tray", true);
							config.set("options.appVisible", true);
						},
					},
					{
						label: "Enabled + app hidden",
						type: "radio",
						checked:
							config.get("options.tray") && !config.get("options.appVisible"),
						click: () => {
							config.set("options.tray", true);
							config.set("options.appVisible", false);
						},
					},
					{ type: "separator" },
					{
						label: "Play/Pause on click",
						type: "checkbox",
						checked: config.get("options.trayClickPlayPause"),
						click: (item) => {
							config.set("options.trayClickPlayPause", item.checked);
						},
					},
				],
			},
			{ type: "separator" },
			{
				label: "Toggle DevTools",
				// Cannot use "toggleDevTools" role in MacOS
				click: () => {
					const { webContents } = win;
					if (webContents.isDevToolsOpened()) {
						webContents.closeDevTools();
					} else {
						const devToolsOptions = {};
						webContents.openDevTools(devToolsOptions);
					}
				},
			},
			{
				label: "Advanced options",
				click: () => {
					config.edit();
				},
			},
		],
	},
];

module.exports.mainMenuTemplate = mainMenuTemplate;
module.exports.setApplicationMenu = (win) => {
	const menuTemplate = [...mainMenuTemplate(win)];
	if (process.platform === "darwin") {
		const name = app.name;
		menuTemplate.unshift({
			label: name,
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideothers" },
				{ role: "unhide" },
				{ type: "separator" },
				{
					label: "Select All",
					accelerator: "CmdOrCtrl+A",
					selector: "selectAll:",
				},
				{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
				{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
				{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
				{ type: "separator" },
				{ role: "minimize" },
				{ role: "close" },
				{ role: "quit" },
			],
		});
	}

	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
};
