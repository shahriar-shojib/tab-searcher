import { X } from 'lucide-react';
import { type FormEventHandler, useCallback, useMemo } from 'react';
import { Button } from '~components/ui/button';
import { Input } from '~components/ui/input';
import { Skeleton } from '~components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~components/ui/tooltip';
import { sendMessage } from '~lib/messaging/sendMessage';
import type { FuseDoc } from '~lib/search/search.service';
import { useHighlight } from '~popup/hooks/useHighlight';
import { usePersistedState } from '~popup/hooks/usePersistedState';
import { Tab } from '../Tab/Tab';

// Define the different states the component can be in
type LoadedState = {
	type: 'loaded';
	data: FuseDoc[];
};

type LoadingState = {
	type: 'loading';
};

type ErrorState = {
	type: 'error';
	error: string;
};

type InitState = {
	type: 'init';
};

type State = LoadedState | LoadingState | ErrorState | InitState;

export const Popup = () => {
	const [query, setQuery] = usePersistedState<string>('SEARCH_INPUT_VALUE', '');
	const [data, setData] = usePersistedState<State>('SEARCH_RESULTS', { type: 'init' });
	const [lastHighlightedTabId, setLastHighlightedTabId] = usePersistedState<number | null>(
		'LAST_HIGHLIGHTED_TAB_ID',
		null
	);

	const { highlightWordsInTab, removeHighlightsInTab } = useHighlight();

	// Function to handle search queries
	const handleSearch = useCallback(
		async (query: string) => {
			if (!query) {
				return;
			}
			setData({ type: 'loading' });

			try {
				const results = await sendMessage('SEARCH', { query });
				setData({ type: 'loaded', data: results });
			} catch (error) {
				setData({ type: 'error', error: error.message });
			}
		},
		[setData]
	);

	// Form submission handler
	const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		(e) => {
			e.preventDefault();
			handleSearch(query);
		},
		[handleSearch, query]
	);

	const onReset = useCallback(() => {
		setData({ type: 'init' });
		setQuery('');
		if (lastHighlightedTabId) {
			removeHighlightsInTab(lastHighlightedTabId);
			setLastHighlightedTabId(null);
		}
	}, [lastHighlightedTabId, removeHighlightsInTab, setData, setLastHighlightedTabId, setQuery]);

	// Disable the search button while a search is in progress
	const isButtonDisabled = useMemo(
		() => data.type === 'loading' || data.type === 'loaded',
		[data.type]
	);

	const onTabClick = useCallback(
		(tab: FuseDoc) => {
			{
				if (lastHighlightedTabId) {
					removeHighlightsInTab(lastHighlightedTabId);
				}
				setLastHighlightedTabId(parseInt(tab.id));
				highlightWordsInTab(parseInt(tab.id), query);
			}
		},
		[
			highlightWordsInTab,
			lastHighlightedTabId,
			query,
			removeHighlightsInTab,
			setLastHighlightedTabId
		]
	);

	return (
		<div className="h-[600px] w-[600px] px-2 mt-2">
			<form className="flex gap-2 justify-between mb-4" onSubmit={onSubmit}>
				<Input
					autoComplete="off"
					type="text"
					onChange={(e) => setQuery(e.target.value)}
					value={query}
					disabled={data.type === 'loaded'}
					placeholder="Search"
				/>
				{data.type === 'loaded' && (
					<div className="absolute right-24 top-4 cursor-pointer">
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<TooltipTrigger>
									<X onClick={onReset} />
								</TooltipTrigger>
								<TooltipContent>Reset search</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				)}
				<Button disabled={isButtonDisabled} type="submit">
					Search
				</Button>
			</form>

			{data.type === 'init' && (
				<div className="text-lg justify-center items-center">Search for something</div>
			)}

			{data.type === 'loading' && (
				<div className="gap-2 flex flex-col">
					<Skeleton className="h-10" />
					<Skeleton className="h-10" />
					<Skeleton className="h-10" />
				</div>
			)}

			{data.type === 'error' && <div>{data.error}</div>}

			{data.type === 'loaded' && (
				<div className="flex flex-col gap-2">
					{data.data.map((tab) => (
						<Tab tab={tab} key={tab.id} onClick={onTabClick} />
					))}

					{data.data.length === 0 && (
						<div>
							<div className="text-lg">No results found, try searching for a different term?</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
