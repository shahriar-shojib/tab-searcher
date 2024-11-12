import { getCurrentTabs } from './get-current-tabs';

describe('getCurrentTabs', () => {
	const validTab: chrome.tabs.Tab = {
		id: 1,
		url: 'https://example.com',
		title: 'Example',
		favIconUrl: 'https://example.com/favicon.ico',
		index: 0,
		pinned: false,
		highlighted: false,
		windowId: 0,
		active: false,
		incognito: false,
		selected: false,
		discarded: false,
		autoDiscardable: false,
		groupId: 0
	};

	const nonHttpTab: chrome.tabs.Tab = {
		id: 2,
		url: 'chrome://extensions',
		title: 'Extensions',
		favIconUrl: 'chrome://favicon',
		index: 0,
		pinned: false,
		highlighted: false,
		windowId: 0,
		active: false,
		incognito: false,
		selected: false,
		discarded: false,
		autoDiscardable: false,
		groupId: 0
	};

	const tabContent = 'Hello, world!';
	const tabContentResult = [{ result: tabContent }];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return an array of FuseDocs', async () => {
		jest.spyOn(chrome.tabs, 'query').mockResolvedValue([validTab, nonHttpTab]);
		jest.spyOn(chrome.scripting, 'executeScript').mockResolvedValue(tabContentResult as never);

		const result = await getCurrentTabs();

		expect(result).toEqual({
			docs: [
				{
					id: validTab.id!.toString(),
					url: validTab.url,
					title: validTab.title,
					favicon: validTab.favIconUrl,
					content: tabContent
				}
			],
			needsReload: false
		});
	});

	it('should return an empty array when no tabs are found', async () => {
		jest.spyOn(chrome.tabs, 'query').mockResolvedValue([]);
		jest.spyOn(chrome.scripting, 'executeScript').mockResolvedValue(tabContentResult as never);

		const result = await getCurrentTabs();

		expect(result).toEqual({
			docs: [],
			needsReload: false
		});
	});

	it('should return an empty array when no tabs have a valid URL', async () => {
		jest.spyOn(chrome.tabs, 'query').mockResolvedValue([nonHttpTab]);
		jest.spyOn(chrome.scripting, 'executeScript').mockResolvedValue(tabContentResult as never);

		const result = await getCurrentTabs();

		expect(result).toEqual({
			docs: [],
			needsReload: false
		});
	});

	it('should return an empty array when executeScript fails', async () => {
		jest.spyOn(chrome.tabs, 'query').mockResolvedValue([validTab]);
		jest
			.spyOn(chrome.scripting, 'executeScript')
			.mockRejectedValue(new Error('executeScript failed') as never);

		const result = await getCurrentTabs();

		expect(result).toEqual({
			docs: [],
			needsReload: true
		});
	});
});
