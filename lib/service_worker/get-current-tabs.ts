import type { FuseDoc } from '~lib/search/search.service';

export const getCurrentTabs = async (): Promise<{ docs: FuseDoc[]; needsReload: boolean }> => {
	const tabs = await chrome.tabs.query({});

	const fuseDocs: Array<FuseDoc | 'error' | null> = [];

	for (const tab of tabs) {
		if (!tab.url?.startsWith('http')) {
			fuseDocs.push(null);
			continue;
		}

		const tabContent = await new Promise<chrome.scripting.InjectionResult<string>[]>(
			(resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Timeout'));
				}, 1000);

				chrome.scripting
					.executeScript({
						target: {
							tabId: tab.id!
						},
						func: () => {
							return document.body.innerText;
						},
						injectImmediately: true,
						world: 'MAIN'
					})
					.then((res) => {
						clearTimeout(timeout);
						resolve(res);
					})
					.catch((e) => {
						clearTimeout(timeout);
						reject(e);
					});
			}
		).catch((e) => {
			if (e.message === 'Timeout') {
				fuseDocs.push(null);
			} else {
				// https://stackoverflow.com/questions/74318853/chrome-scripting-executescript-fails-to-run-on-preexisting-tabs-with-tabs-and#:~:text=chrome.scripting%20seems%20to%20throw%20this%20error%20for%20tabs%20that%20existed%20prior%20to%20installing%20the%20extension.
				fuseDocs.push('error');
			}
		});

		if (!tabContent) {
			continue;
		}

		fuseDocs.push({
			content: tabContent[0]!.result!,
			id: tab.id!.toString(),
			title: tab.title!,
			url: tab.url!,
			favicon: tab.favIconUrl!
		});
	}

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
