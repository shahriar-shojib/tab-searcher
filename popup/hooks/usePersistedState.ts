import { useEffect, useState } from 'react';

export const usePersistedState = <T>(
	key: string,
	defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const [state, setState] = useState<T>(defaultValue);

	useEffect(() => {
		chrome.storage.local.get(key).then((data) => {
			if (data[key]) {
				setState(data[key]);
			}
		});
	}, [key]);

	useEffect(() => {
		chrome.storage.local.set({ [key]: state });
	}, [key, state]);

	return [state, setState];
};
