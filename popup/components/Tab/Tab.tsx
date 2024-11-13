import type { FC } from 'react';
import type { FuseDoc } from '~lib/search/search.service';

const truncateText = (text: string, maxLength: number) => {
	if (text.length > maxLength) {
		return text.slice(0, maxLength) + '...';
	}
	return text;
};

/**
 * Tab component that displays information about a browser tab.
 * @param tab - The tab object containing information to display.
 */
export const Tab: FC<{ tab: FuseDoc; onClick?: (tab: FuseDoc) => void }> = ({ tab, onClick }) => {
	// Construct the favicon URL, using a default if none is provided
	const faviconURL = tab.favicon || `https://www.google.com/s2/favicons?domain_url=${tab.url}`;
	const parsedURL = new URL(tab.url);

	return (
		<div
			className="cursor-pointer hover:bg-slate-200 transition duration-200 ease-in-out p-2 rounded-md"
			onClick={() => onClick?.(tab)}>
			<div className="flex gap-2 items-center">
				<img src={faviconURL} alt="favicon" className="w-6 h-6" />
				<div className="flex flex-col">
					<div className="text-lg">{truncateText(tab.title, 60)}</div>
					<div className="text-blue-400 truncate">{parsedURL.hostname}</div>
				</div>
			</div>
		</div>
	);
};
