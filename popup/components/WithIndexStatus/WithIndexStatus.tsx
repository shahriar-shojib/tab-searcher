import { LoaderIcon } from 'lucide-react';
import { FC, PropsWithChildren } from 'react';
import { Button } from '~components/ui/button';
import { useIndexStatus } from '~popup/hooks/useIndexStatus';

export const WithIndexStatus: FC<PropsWithChildren<{}>> = ({ children }) => {
	const { indexStatus, reloadAll, continueWithoutReload } = useIndexStatus();

	if (indexStatus === 'indexing') {
		return (
			<div className="h-[600px] w-[600px] px-2 mt-2 justify-center items-center flex">
				<LoaderIcon className="animate-spin" />
				<div className="text-lg text-center">Indexing...</div>
			</div>
		);
	}

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

	if (indexStatus === 'error') {
		return (
			<div className="h-[600px] w-[600px] px-2 mt-2">
				<div className="text-lg justify-center items-center">
					An error occurred while indexing, please try re installing the extension
				</div>
			</div>
		);
	}

	return <>{children}</>;
};
