type DevtoolsOpenness = { isOpen: boolean };

type Config = {
   /** @default 100 */
	secondsBetweenHeartbeats: number,

   /** @default 1.0 */
	maxMillisWithinHeartbeat: number,

   /** @default 0 */
	numExtraAnnoyingDebuggers: number,

	onOpen: () => void,
	onClose: () => void,
};

/**
 * Calling this again will stop the previously started heartbeat loop
 * and start a new one.
 */
function initDevtoolsDetector(config: Config): DevtoolsOpenness;