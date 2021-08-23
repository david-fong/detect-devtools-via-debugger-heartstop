"use strict";
/// <reference types="./index.d.ts"/>
/** @typedef {{ moreDebugs: number }} PulseCall */
/** @typedef {{ }} PulseAck */

(() => {
	/** @type {DevtoolsDetectorConfig} */
	const config = {
		pollingIntervalSeconds: 0.25,
		maxMillisBeforeAckWhenClosed: 100,
		moreAnnoyingDebuggerStatements: 0,

		onDetectOpen: undefined,
		onDetectClose: undefined,

		startup: "asap",
		onCheckOpennessWhilePaused: "returnStaleValue",
	};
	Object.seal(config);

	const ackThread = new Worker(URL.createObjectURL(new Blob([
		(function ackThreadFunction() {
			"use strict";
			onmessage = (ev) => {
				debugger;
				for (let i = 0; i < ev.data.moreDebugs; i++) { debugger; }
				// @ts-expect-error
				postMessage({});
			};
		})
		.toString()
		.split("\n").slice(1, -1) // strip function wrapper
		.map((l) => l.substring(3)).join("\n") // useless prettify 😊
	], { type: "text/javascript" })));

	let _isDevtoolsOpen = false;
	let _isDetectorPaused = true;

	/** @type {number} */
	let pulseCallTime = NaN;

	/** @type {number} */
	let nextPulseTimeoutToken = NaN;

	/** @type {number} */
	let mainThreadAckTimeoutToken = NaN;

	const ACK_TYPE_MAIN_THREAD = "devtoolsOpen";

	const onPulseAck = (/** @type {MessageEvent<PulseAck>}*/ pulseAck) => {
		nextPulseTimeoutToken = NaN;
		if (pulseCallTime === NaN) {
			// main thread timeout callback came after onMessage callback.
			return;
		}
		const newIsDevtoolsOpen = ((pulseAck.timeStamp - pulseCallTime) > config.maxMillisBeforeAckWhenClosed);
		if (newIsDevtoolsOpen !== _isDevtoolsOpen) {
			_isDevtoolsOpen = newIsDevtoolsOpen;
			const callback = { true: config.onDetectOpen, false: config.onDetectClose }[_isDevtoolsOpen+""];
			if (callback) { callback(); }
		}
		if (pulseAck.type === ACK_TYPE_MAIN_THREAD) { return; }
		clearTimeout(mainThreadAckTimeoutToken);
		mainThreadAckTimeoutToken = NaN;
		pulseCallTime = NaN;
		nextPulseTimeoutToken = setTimeout(() => doOnePulse(), config.pollingIntervalSeconds * 1000);
	};

	const doOnePulse = () => {
		pulseCallTime = performance.now();
		ackThread.postMessage({ moreDebugs: config.moreAnnoyingDebuggerStatements });
		mainThreadAckTimeoutToken = setTimeout(() => {
			// wrap in another setTimeout to ensure coming after the onMessage
			// callback if it has been queued up after the outer setTimeout here.
			setTimeout(() => {
				mainThreadAckTimeoutToken = NaN;
				onPulseAck(new MessageEvent(ACK_TYPE_MAIN_THREAD));
			}, 0)},
			config.maxMillisBeforeAckWhenClosed + 1,
		);
	}

	/** @type {DevtoolsDetector} */
	const detector = {
		config,
		get isOpen() {
			if (_isDetectorPaused && config.onCheckOpennessWhilePaused === "throw") {
				throw new Error("`onCheckOpennessWhilePaused` is set to `\"throw\"`.")
			}
			return _isDevtoolsOpen;
		},
		get paused() { return _isDetectorPaused; },
		set paused(pause) {
			// Note: a simpler implementation is to skip updating results in the
			// ack callback. The current implementation conserves resources when
			// paused.
			if (_isDetectorPaused === pause) { return; }
			_isDetectorPaused = pause;
			if (pause) {
				ackThread.removeEventListener("message", onPulseAck);
				clearTimeout(nextPulseTimeoutToken);
				pulseCallTime = NaN;
				nextPulseTimeoutToken = NaN;
			} else {
				ackThread.addEventListener("message", onPulseAck);
				doOnePulse();
			}
		}
	};
	Object.freeze(detector);
	// @ts-expect-error
	globalThis.devtoolsDetector = detector;

	switch (config.startup) {
		case "manual": break;
		case "asap": detector.paused = false; break;
		case "domContentLoaded": {
			if (document.readyState !== "loading") {
				detector.paused = false;
			} else {
				document.addEventListener("DOMContentLoaded", (ev) => {
					detector.paused = false;
				}, { once: true });
			}
			break;
		}
	}
})();