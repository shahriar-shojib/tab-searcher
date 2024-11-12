import type { FC } from 'react';
import type { FuseDoc } from '~lib/search/search.service';

/**
 * Sets the specified tab as the active tab in the browser.
 * @param tabId - The ID of the tab to activate.
 */
const setActiveTab = async (tabId: string) => {
	await chrome.tabs.update(parseInt(tabId), { active: true });
};

/**
 * Tab component that displays information about a browser tab.
 * @param tab - The tab object containing information to display.
 */
export const Tab: FC<{ tab: FuseDoc }> = ({ tab }) => {
	// Construct the favicon URL, using a default if none is provided
	const faviconURL = tab.favicon || `https://www.google.com/s2/favicons?domain_url=${tab.url}`;

	return (
		<div
			className="cursor-pointer hover:bg-slate-100 transition duration-200 ease-in-out p-2 rounded-md"
			onClick={() => setActiveTab(tab.id)}>
			<div>
				<div className="flex gap-2 items-center">
					<img src={faviconURL} alt="favicon" className="w-6 h-6" />
					<div className="truncate text-lg">{tab.title}</div>
				</div>
			</div>
			{/* Display the tab URL */}
			<div className="text-blue-400 truncate">{tab.url}</div>
		</div>
	);
};
