type DevtoolsOpenness = { isOpen: boolean };
type Config = {
	secondsBetweenHeartbeats: number,
	maxMillisWithinHeartbeat: number,
	numExtraAnnoyingDebuggers: number,
	onOpen: () => void,
	onClose: () => void,
};

function initDevtoolsDetector(config: Config): DevtoolsOpenness;