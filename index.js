"use strict";
/**
 * @typedef {{ type: "begin"|"end", time: number }} HeartbeatData
 * @typedef {{ isOpen: boolean }} DevtoolsOpenness
 * @typedef {{
 * 	secondsBetweenHeartbeats: number,
 * 	maxMillisWithinHeartbeat: number,
 * 	numExtraAnnoyingDebuggers: number,
 * 	onOpen: () => void,
 * 	onClose: () => void,
 * }} Config
 */

(function() {
/**
 * Used to stop the previous detector if reinitializing.
 * @type {number}
 */
let _stopDetectionToken = undefined;

/** @type {Config} */
const defaultConfig = {
	secondsBetweenHeartbeats: 1.0,
	maxMillisWithinHeartbeat: 100,
	numExtraAnnoyingDebuggers: 0,
};

/**
 * @param {Config} config
 * @returns {DevtoolsOpenness}
 */
function initDevtoolsDetector(config) {
	clearTimeout(_stopDetectionToken);
	config = Object.freeze(Object.assign({}, defaultConfig, config));

	function detectorWorkerIife() {
		"use strict";
		// =========================
		onmessage = function (e) {
			postMessage({ type: "begin", time: Date.now() });
			debugger;
			for (let i = 0; i < config.numExtraAnnoyingDebuggers; i++) {
				debugger;
			}
			postMessage({ type: "end", time: Date.now() });
		}
		// =========================
	}
	const detectorWorker = new Worker(URL.createObjectURL(new Blob(
		[detectorWorkerIife.toString()
			.split("\n").slice(1, -2).join("\n")
			.replace(/config\.([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, field) => config[field])
		],
		{ type: "text/javascript" }
	)));

	let _isDevtoolsOpen = false;
	{
		/** @type number */
		let startTime;
		detectorWorker.onmessage = (/** @type {MessageEvent<HeartbeatData>}*/ msg) => {
			console.log(msg.data);
			if (msg.data.type === "begin") {
				startTime = msg.data.time;
				return;
			}
			const pulseLength = msg.data.time - startTime;
			console.log(pulseLength);
			if (pulseLength > config.maxMillisWithinHeartbeat) {
				if (!_isDevtoolsOpen) {
					_isDevtoolsOpen = true;
					if (typeof config.onOpen === "function") { config.onOpen(); }
				}
			} else {
				if (_isDevtoolsOpen) {
					_isDevtoolsOpen = false;
					if (typeof config.onClose === "function") { config.onClose(); }
				}
			}
			_stopDetectionToken = setTimeout(() => {
				_stopDetectionToken = undefined;
				detectorWorker.postMessage({});
			}, config.secondsBetweenHeartbeats * 1000);
		};

		// Begin communications loop:
		detectorWorker.postMessage({});
	}
	return Object.freeze({
		get isOpen() { return _isDevtoolsOpen; },
	});
};

window.initDevtoolsDetector = initDevtoolsDetector;
})();