import { type FuseDoc, SearchService } from '~lib/search/search.service';

export const onTabUpdate = (searchService: SearchService) => {
	return async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (!tab.url?.startsWith('http')) {
			return;
		}

		if (changeInfo.status === 'complete') {
			try {
				const tabContent = await chrome.scripting.executeScript({
					target: {
						tabId: tabId!
					},
					func: () => {
						return document.body.innerText;
					}
				});

				const fuseDoc: FuseDoc = {
					content: tabContent[0]!.result!,
					id: tab.id!.toString(),
					title: tab.title!,
					url: tab.url!,
					favicon: tab.favIconUrl!
				};

				await searchService.addDocuments([fuseDoc]);
			} catch (error) {
				console.log(error);
			}
		}
	};
};
