import { useCallback, useEffect, useState } from 'react';
import { type IndexStatus } from '~lib/messaging/messaging.service';
import { sendMessage } from '~lib/messaging/sendMessage';

export const useIndexStatus = () => {
	const [indexStatus, setIndexed] = useState<IndexStatus>('indexing');

	useEffect(() => {
		const interval = setInterval(async () => {
			const response = await sendMessage('GET_INDEX_STATUS');

			setIndexed(response);
			if (response === 'indexed') {
				clearInterval(interval);
			}
		}, 100);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const reloadAll = useCallback(async () => {
		const tabs = await chrome.tabs.query({});

		await Promise.all(tabs.map((tab) => chrome.tabs.reload(tab.id!)));
		await sendMessage('SET_RELOAD_REQUIRED_FALSE');
	}, []);

	const continueWithoutReload = useCallback(async () => {
		await sendMessage('SET_RELOAD_REQUIRED_FALSE');
	}, []);

	return {
		indexStatus,
		reloadAll,
		continueWithoutReload
	};
};
