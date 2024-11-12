import { X } from 'lucide-react';
import { FormEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '~components/ui/button';
import { Input } from '~components/ui/input';
import { Skeleton } from '~components/ui/skeleton';
import { sendMessage } from '~lib/messaging/sendMessage';
import { FuseDoc } from '~lib/search/search.service';
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
	// State to manage the current state of the component
	const [data, setData] = useState<State>({ type: 'init' });

	// Function to handle search queries
	const handleSearch = useCallback(async (query: string) => {
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
	}, []);

	// Form submission handler
	const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		(e) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const search = formData.get('search') as string;

			handleSearch(search);
		},
		[handleSearch]
	);

	// Disable the search button while a search is in progress
	const isButtonDisabled = useMemo(() => data.type === 'loading', [data.type]);
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<div className="h-[600px] w-[600px] px-2 mt-2">
			<form ref={formRef} className="flex gap-2 justify-between mb-4" onSubmit={onSubmit}>
				<Input autoComplete="off" type="text" name="search" placeholder="Search" />
				{data.type === 'loaded' && (
					<div className="absolute right-24 top-4 cursor-pointer">
						<X
							onClick={() => {
								formRef?.current?.reset();
								setData({ type: 'init' });
							}}
						/>
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
						<Tab tab={tab} key={tab.id} />
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
