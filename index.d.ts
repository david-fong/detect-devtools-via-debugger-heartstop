
type DevtoolsDetectorConfig = {

   /** @default 1.0 */
	pollingIntervalSeconds: number;

   /** @default 100 */
	maxMillisBeforeAckWhenClosed: number;

   /** @default 0 */
	moreAnnoyingDebuggerStatements: number;

	onDetectOpen?(): void;
	onDetectClose?(): void;

	/** @default "asap" */
	startup: "manual" | "asap" | "domContentLoaded";

	/** @default "returnStaleValue" */
	onCheckOpennessWhilePaused: "returnStaleValue" | "throw";
}

type DevtoolsDetector = {
	readonly config: DevtoolsDetectorConfig;

	/** Retains last read value while paused. */
	get isOpen(): boolean;

	get paused(): boolean;
	set paused(_: boolean);
}

declare const devtoolsDetector: DevtoolsDetector;
