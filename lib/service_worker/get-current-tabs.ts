import { FuseDoc } from '~lib/search/search.service';

export const getCurrentTabs = async () => {
	const tabs = await chrome.tabs.query({});

	const fuseDocsPromise = tabs.map(async (tab): Promise<FuseDoc | null | 'error'> => {
		if (!tab.url?.startsWith('http')) {
			return null;
		}

		try {
			const tabContent = await chrome.scripting.executeScript({
				target: {
					tabId: tab.id!
				},
				func: () => {
					return document.body.innerText;
				}
			});

			return {
				content: tabContent[0]!.result!,
				id: tab.id!.toString(),
				title: tab.title!,
				url: tab.url!,
				favicon: tab.favIconUrl!
			};
		} catch (_) {
			// https://stackoverflow.com/questions/74318853/chrome-scripting-executescript-fails-to-run-on-preexisting-tabs-with-tabs-and#:~:text=chrome.scripting%20seems%20to%20throw%20this%20error%20for%20tabs%20that%20existed%20prior%20to%20installing%20the%20extension.
			return 'error';
		}
	});

	const fuseDocs = await Promise.all(fuseDocsPromise);

	return {
		docs: fuseDocs.filter((e): e is FuseDoc => {
			if (e === 'error') {
				return false;
			}

			if (e === null) {
				return false;
			}

			return true;
		}),
		needsReload: fuseDocs.some((doc) => doc === 'error')
	};
};
