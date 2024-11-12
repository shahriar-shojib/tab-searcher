import { useCallback, useEffect, useState } from 'react';
import { type IndexStatus } from '~lib/messaging/messaging.service';
import { sendMessage } from '~lib/messaging/sendMessage';

/**
 * Custom hook to manage the index status and provide functions to reload tabs or continue without reload.
 * @returns {Object} - An object containing the index status, reloadAll function, and continueWithoutReload function.
 */
export const useIndexStatus = () => {
	const [indexStatus, setIndexed] = useState<IndexStatus>('indexing');

	useEffect(() => {
		// Set an interval to check the index status every 100ms
		const interval = setInterval(async () => {
			const response = await sendMessage('GET_INDEX_STATUS');

			if (response) {
				setIndexed(response);
				if (response === 'indexed') {
					clearInterval(interval);
				}
			}
		}, 100);

		// Cleanup the interval on component unmount
		return () => {
			clearInterval(interval);
		};
	}, []);

	/**
	 * Reloads all open tabs and sends a message to set reload required to false.
	 */
	const reloadAll = useCallback(async () => {
		const tabs = await chrome.tabs.query({});

		await Promise.all(tabs.map((tab) => chrome.tabs.reload(tab.id!)));
		await sendMessage('SET_RELOAD_REQUIRED_FALSE');
	}, []);

	/**
	 * Sends a message to set reload required to false without reloading tabs.
	 */
	const continueWithoutReload = useCallback(async () => {
		await sendMessage('SET_RELOAD_REQUIRED_FALSE');
	}, []);

	return {
		indexStatus,
		reloadAll,
		continueWithoutReload
	};
};
