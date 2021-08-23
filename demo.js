"use strict";
/// <reference types="./index.d.ts"/>
(() => {
	const main = document.getElementsByTagName("main").item(0);
	const base = document.createElement("fieldset");
	Object.assign(base.style, {
		contain: "content", position: "relative",
		display: "flex", flexFlow: "column",
	});
	{
		const legend = document.createElement("legend");
		legend.textContent = "devtoolsDetector.config";
		base.appendChild(legend);
	}

	const fields = {
		pollingIntervalSeconds: { type: "number", default: 1.0, min: 0 },
		maxMillisBeforeAckWhenClosed: { type: "number", default: 100, min: 0 },
		moreAnnoyingDebuggerStatements: { type: "number", default: 0, min: 0 },

		onDetectOpen: { type: "eval-js", demoDefault: () => { alert("devtools are now open"); } },
		onDetectClose: { type: "eval-js", demoDefault: () => { alert("devtools are now closed"); } },

		startup: {
			type: "select", options: ["manual", "asap", "domContentLoaded"], default: "asap",
		},
		onCheckOpennessWhilePaused: {
			type: "select", options: ["returnStaleValue", "throw"], default: "returnStaleValue",
		},
	};
	Object.keys(fields).forEach((field) => {
		// @ts-expect-error
		const desc = fields[field];
		const label = document.createElement("label");
		label.textContent = field + ": ";

		if (desc.type === "select") {
			const sel = document.createElement("select");
			for (const optName of desc.options) {
				const opt = document.createElement("option");
				opt.value = optName;
				opt.text = optName;
				sel.appendChild(opt);
			}
			sel.value = desc.default;
			sel.onchange = (ev) => {
				devtoolsDetector.config[field] = sel.value || desc.default;
			};
			label.appendChild(sel);

		} else if (desc.type === "eval-js") {
			const area = document.createElement("textarea");
			area.style.display = "grid";
			area.placeholder = "< something to eval() >";
			area.onchange = (ev) => {
				devtoolsDetector.config[field] = area.value ? () => {
					try {
						eval(area.value);
					} catch (err) {
						alert(err.message + "\n\n " + err.stack);
					}
				} : desc.default;
			};
			devtoolsDetector.config[field] = desc.demoDefault;
			label.appendChild(area);

		} else {
			const input = document.createElement("input");
			input.type = desc.type;
			input.min = desc.min;
			input.placeholder = desc.default;
			input.value = desc.default;
			input.onchange = (ev) => {
				devtoolsDetector.config[field] = input.value ?? desc.default;
			};
			label.appendChild(input);
		}
		base.appendChild(label);
	});

	main?.appendChild(base);
})();