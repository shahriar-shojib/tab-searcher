import { FC } from 'react';
import { FuseDoc } from '~lib/search/search.service';

const setActiveTab = async (tabId: string) => {
	await chrome.tabs.update(parseInt(tabId), { active: true });
};

export const Tab: FC<{ tab: FuseDoc }> = ({ tab }) => {
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
			<div className="text-blue-400 truncate">{tab.url}</div>
		</div>
	);
};
