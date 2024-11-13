import { type IndexStatus, messagingService } from '~lib/messaging/messaging.service';
import { SearchService } from '~lib/search/search.service';
import { getCurrentTabs } from '~lib/service_worker/get-current-tabs';
import { onTabUpdate } from '~lib/service_worker/handleTabUpdates';
import { searchAndHighlight } from '~lib/service_worker/highlight-text';
import { clearMarkedElements } from '~lib/service_worker/remove-highlight';

const main = async () => {
	let indexStatus: IndexStatus = 'indexing';

	/**
	 * Initialization
	 */

	const searchService = await SearchService.create();

	//build index in background
	getCurrentTabs()
		.then(async ({ docs, needsReload }) => {
			await searchService.addDocuments(docs);
			return needsReload;
		})
		.then((needsReload) => {
			if (needsReload) {
				indexStatus = 'needs_reload';
				return;
			}

			indexStatus = 'indexed';
		})
		.catch((error) => {
			console.log(error);
			indexStatus = 'error';
		})
		.finally(() => {
			console.log('Indexing status', indexStatus);
		});

	/**
	 * Event listeners
	 */

	chrome.tabs.onUpdated.addListener(onTabUpdate(searchService));
	chrome.tabs.onRemoved.addListener((tabId) => searchService.removeDocument(tabId.toString()));

	chrome.runtime.onMessage.addListener((req, _, sendResponse) => {
		// https://stackoverflow.com/a/56483156/2703813
		messagingService.handleMessage(req, _).then((res) => sendResponse(res));
		return true;
	});

	messagingService.on('SEARCH', (payload) => searchService.search(payload.query));
	messagingService.on('GET_INDEX_STATUS', async () => {
		return indexStatus;
	});

	messagingService.on('SET_RELOAD_REQUIRED_FALSE', async () => {
		indexStatus = 'indexed';
	});

	messagingService.on('SWITCH_TAB', async ({ tabId, keyword }) => {
		await chrome.tabs.update(tabId, { active: true });

		const result = await chrome.scripting.executeScript({
			target: { tabId },
			args: [keyword],
			func: searchAndHighlight
		});

		console.log('Switch tab result', result);
	});

	messagingService.on('REMOVE_MARK', async ({ tabId }) => {
		const result = await chrome.scripting.executeScript({
			target: { tabId },
			func: clearMarkedElements
		});

		console.log('Remove mark result', result);
	});

	console.log('Background script initialized');
};

main();

export {};
