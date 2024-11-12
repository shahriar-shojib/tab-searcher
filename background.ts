import { IndexStatus, messagingService } from '~lib/messaging/messaging.service';
import { SearchService } from '~lib/search/search.service';
import { getCurrentTabs } from '~lib/service_worker/get-current-tabs';
import { onTabUpdate } from '~lib/service_worker/handleTabUpdates';

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
		});

	/**
	 * Event listeners
	 */

	chrome.tabs.onUpdated.addListener(onTabUpdate(searchService));

	chrome.tabs.onRemoved.addListener((tabId) => searchService.removeDocument(tabId.toString()));

	messagingService.on('SEARCH', (payload) => searchService.search(payload.query));
	messagingService.on('GET_INDEX_STATUS', () => indexStatus);
	messagingService.on('SET_RELOAD_REQUIRED_FALSE', () => {
		indexStatus = 'indexed';
	});
};

main();

export {};
