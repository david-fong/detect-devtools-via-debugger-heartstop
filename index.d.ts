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

function initDevtoolsDetector(config: Config): DevtoolsOpenness;