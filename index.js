"use strict";
/// <reference types="./index.d.ts"/>
/**
 * @typedef {{ type: "begin"|"end", time: number }} HeartbeatData
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
function _initDevtoolsDetector(config) {
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

	let _cycleId = 0;
	let _isDevtoolsOpen = false;
	{
		/** @type number */
		let startTime;
		detectorWorker.onmessage = (/** @type {MessageEvent<HeartbeatData>}*/ msg) => {
			if (msg.data.type === "begin") {
				startTime = msg.data.time;
				const _oldCycleId = _cycleId;
				setTimeout(() => {
					// if "end" is not received by now, debugger was probably triggered.
					if (_oldCycleId === _cycleId) {
						if (!_isDevtoolsOpen) {
							_isDevtoolsOpen = true;
							if (typeof config.onOpen === "function") { config.onOpen(); }
						}
					}
				}, config.maxMillisWithinHeartbeat + Math.min(200, config.secondsBetweenHeartbeats * 1000));
				// ^ Note: 200ms just for safety to avoid false positives. Not sure if truly needed.
				return;
			}
			// If "end":
			if (_isDevtoolsOpen) {
				_isDevtoolsOpen = false;
				if (typeof config.onClose === "function") { config.onClose(); }
			}
			_stopDetectionToken = setTimeout(() => {
				_stopDetectionToken = undefined;
				detectorWorker.postMessage({});
			}, config.secondsBetweenHeartbeats * 1000);
			_cycleId++;
		};

		// Begin communications loop:
		detectorWorker.postMessage({});
	}
	return Object.freeze({
		get isOpen() { return _isDevtoolsOpen; },
	});
};

window.initDevtoolsDetector = _initDevtoolsDetector;
})();