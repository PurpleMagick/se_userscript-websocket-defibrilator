// ==UserScript==
// @name          Stack Exchange websocket defibrilator
// @description   Tries to keep socket connections alive by doing periodic pings
// @author        VLAZ
// @grant         none
// @inject-into   page
// @match         https://stackoverflow.com/*
// @match         https://serverfault.com/*
// @match         https://superuser.com/*
// @match         https://*.stackexchange.com/*
// @match         https://askubuntu.com/*
// @match         https://stackapps.com/*
// @match         https://mathoverflow.net/*
// @match         https://pt.stackoverflow.com/*
// @match         https://ja.stackoverflow.com/*
// @match         https://ru.stackoverflow.com/*
// @match         https://es.stackoverflow.com/*
// @match         https://meta.stackoverflow.com/*
// @match         https://meta.serverfault.com/*
// @match         https://meta.superuser.com/*
// @match         https://meta.askubuntu.com/*
// @match         https://meta.mathoverflow.net/*
// @match         https://pt.meta.stackoverflow.com/*
// @match         https://ja.meta.stackoverflow.com/*
// @match         https://ru.meta.stackoverflow.com/*
// @match         https://es.meta.stackoverflow.com/*
// @namespace     https://github.com/PurpleMagick/
// @run-at        document-start
// @version       1.0.0
// ==/UserScript==
(() => {
	"use strict";
	const LoggingLevel = {
		OFF     : 0,
		ERROR   : 1,
		WARNING : 2,
		INFO    : 3,
		LOG     : 3,
		DEBUG   : 4,
		TRACE   : 5,
		ALL     : 99,
	};
	const configLogLevel = readConfig("log_level");
	
	const LOG_LEVEL = LoggingLevel[configLogLevel] ?? LoggingLevel.OFF;
	const PING_INTERVAL_IN_SECONDS = readConfig("ping_interval_in_seconds") ?? 10;
		
	const sockets = new Set();

	let lastPing = Date.now();
	
	//heartbeat pulse
	setInterval(() => {
		const elapsedSecondsSinceLastPing = (Date.now() - lastPing) / 1000;
		const elapsedSecondsSinceLastPingFormatted = elapsedSecondsSinceLastPing.toFixed(2);

		if (elapsedSecondsSinceLastPing < PING_INTERVAL_IN_SECONDS){
			if (LOG_LEVEL >= LoggingLevel.TRACE)
				console.debug(`${elapsedSecondsSinceLastPingFormatted}s elapsed since last ping. The minimal interval is ${PING_INTERVAL_IN_SECONDS}s. Skipping ping.`);
			return;
		}

		if (LOG_LEVEL >= LoggingLevel.DEBUG)
			console.debug(`${elapsedSecondsSinceLastPingFormatted}s elapsed since last ping. The minimal interval is ${PING_INTERVAL_IN_SECONDS}s: pinging ${sockets.size} sockets`);

		for (const socket of sockets) {
			if(socket.readyState === 1)
				socket.send("");
			else
				if (LOG_LEVEL >= LoggingLevel.WARNING)
					console.warn(`skipping ping to websocket in readyState [${socket.readyState}]`);

		}
		lastPing = Date.now();
	}, 1000);

	const OrigWebSocket = window.WebSocket;

	//monkeypatch the websocket creation
	window.WebSocket = function () {
		const socket = new OrigWebSocket(...arguments);

		sockets.add(socket);

		if (LOG_LEVEL >= LoggingLevel.LOG)
				console.log("websocket created");

		socket.addEventListener("close", (e) => {
			if (LOG_LEVEL >= LoggingLevel.LOG)
				console.log("websocket closed", e);

			sockets.delete(socket);
		});

		return socket;
	};
	
	function readConfig(key) {
		try {
			const configValue = localStorage.getItem(`WebSocketDefibrilator:${key}`);
			return JSON.parse(configValue) ?? null;
		} catch(e) { /* ignore */ }
		return null;
	}
})();
