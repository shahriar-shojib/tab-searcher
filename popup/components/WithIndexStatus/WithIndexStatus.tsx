import { LoaderIcon } from 'lucide-react';
import type { FC, PropsWithChildren } from 'react';
import { Button } from '~components/ui/button';
import { useIndexStatus } from '~popup/hooks/useIndexStatus';

/**
 * WithIndexStatus component
 * This component wraps its children and displays different UI based on the index status.
 * It uses the useIndexStatus hook to get the current index status and provides options to reload tabs or continue without reloading.
 */
export const WithIndexStatus: FC<PropsWithChildren<{}>> = ({ children }) => {
	const { indexStatus, reloadAll, continueWithoutReload } = useIndexStatus();

	// If the index status is 'indexing', show a loading spinner and a message
	if (indexStatus === 'indexing') {
		return (
			<div className="h-[600px] w-[600px] px-2 mt-2 justify-center items-center flex">
				<LoaderIcon className="animate-spin" />
				<div className="text-lg text-center">Indexing...</div>
			</div>
		);
	}

	// If the index status is 'needs_reload', show a message and buttons to reload all tabs or continue without reloading
	if (indexStatus === 'needs_reload') {
		return (
			<div className="h-[600px] w-[600px] px-2 mt-2 items-center justify-center flex-col flex">
				<div className="text-lg mb-2 text-center ">
					Due to a chrome bug, your existing tabs will not be indexed, would you like to reload all
					of your tabs and add them to index?
				</div>
				<div className="flex gap-2">
					<Button onClick={reloadAll}>Reload All</Button>
					<Button onClick={continueWithoutReload}>Continue</Button>
				</div>
			</div>
		);
	}

	// If the index status is 'error', show an error message
	if (indexStatus === 'error') {
		return (
			<div className="h-[600px] w-[600px] px-2 mt-2">
				<div className="text-lg justify-center items-center">
					An error occurred while indexing, please try re installing the extension
				</div>
			</div>
		);
	}

	// index status is 'indexed', show the children
	return <>{children}</>;
};
