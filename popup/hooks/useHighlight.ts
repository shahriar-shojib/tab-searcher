import { useCallback } from 'react';
import { sendMessage } from '~lib/messaging/sendMessage';

export const useHighlight = () => {
	const removeHighlightsInTab = useCallback(async (tabId: number) => {
		await sendMessage('REMOVE_MARK', { tabId });
	}, []);

	const highlightWordsInTab = useCallback(async (tabId: number, keyword: string) => {
		await sendMessage('SWITCH_TAB', { tabId, keyword });
	}, []);

	return {
		removeHighlightsInTab,
		highlightWordsInTab
	};
};
