import { type IndexStatus, messagingService } from '~lib/messaging/messaging.service';
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
			func: (keyword: string) => {
				const wrapText = (node: Text): boolean => {
					const regex = new RegExp(`(${keyword.replace(/\s+/g, '\\s+')})`, 'gi');
					const text = node.textContent || '';
					let lastIndex = 0;
					const fragments = [];
					let match;

					while ((match = regex.exec(text)) !== null) {
						if (match.index > lastIndex) {
							fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
						}

						const span = document.createElement('span');
						span.style.backgroundColor = 'yellow';
						span.className = 'highlighted';
						span.textContent = match[0];
						fragments.push(span);

						lastIndex = regex.lastIndex;
					}

					if (lastIndex < text.length) {
						fragments.push(document.createTextNode(text.substring(lastIndex)));
					}

					if (fragments.length > 0) {
						const parent = node.parentNode;
						fragments.forEach((fragment) => parent?.insertBefore(fragment, node));
						parent?.removeChild(node);
						return true;
					}

					return false;
				};

				const highlightKeywords = (node: Node): boolean => {
					let found = false;
					if (node.nodeType === Node.TEXT_NODE) {
						found = wrapText(node as Text);
					} else if (node.nodeType === Node.ELEMENT_NODE) {
						node.childNodes.forEach((child) => {
							if (highlightKeywords(child)) found = true;
						});
					}
					return found;
				};

				const found = highlightKeywords(document.body);
				if (found) {
					const firstHighlight = document.querySelector<HTMLElement>('.highlighted');
					if (firstHighlight) {
						firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
					}
				}
				return 'ok';
			}
		});

		console.log('Switch tab result', result);
	});

	messagingService.on('REMOVE_MARK', async ({ tabId }) => {
		const result = await chrome.scripting.executeScript({
			target: { tabId },
			func: () => {
				// Remove <mark> elements
				document.querySelectorAll('mark').forEach((mark) => {
					const parent = mark.parentNode;
					if (parent) {
						while (mark.firstChild) {
							parent.insertBefore(mark.firstChild, mark);
						}
						parent.removeChild(mark);
					}
				});
				// Remove <span class="highlighted"> elements
				document.querySelectorAll('span.highlighted').forEach((span) => {
					const parent = span.parentNode;
					if (parent) {
						while (span.firstChild) {
							parent.insertBefore(span.firstChild, span);
						}
						parent.removeChild(span);
					}
				});
				return 'ok';
			}
		});

		console.log('Remove mark result', result);
	});

	console.log('Background script initialized');
};

main();

export {};
