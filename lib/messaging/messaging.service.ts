/* eslint-disable @typescript-eslint/no-explicit-any */
import { FuseDoc } from '~lib/search/search.service';

type SEARCH_EVENT = {
	type: 'SEARCH';
	payload: {
		query: string;
	};
	returns: FuseDoc[];
};

export type IndexStatus = 'indexing' | 'indexed' | 'needs_reload' | 'error';

type GET_INDEX_STATUS_EVENT = {
	type: 'GET_INDEX_STATUS';
	payload: never;
	returns: IndexStatus;
};

type SET_RELOAD_REQUIRED_FALSE_EVENT = {
	type: 'SET_RELOAD_REQUIRED_FALSE';
	payload: never;
	returns: void;
};

export type MessagingEvents =
	| SEARCH_EVENT
	| GET_INDEX_STATUS_EVENT
	| SET_RELOAD_REQUIRED_FALSE_EVENT;

/**
 * Strongly typed Messaging service to communicate between background and popup
 *
 */

export class MessagingService {
	private listeners = new Map<MessagingEvents['type'], (payload: any) => any>();

	constructor() {
		chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
	}

	private async handleMessage(
		request: Omit<MessagingEvents, 'returns'>,
		_: chrome.runtime.MessageSender,
		sendResponse: (response: any) => void
	) {
		const listener = this.listeners.get(request.type);

		if (listener) {
			const response = await listener(request.payload);
			sendResponse(response);
		}
	}

	on<T extends MessagingEvents['type']>(
		type: T,
		listener: (
			payload: Extract<MessagingEvents, { type: T }>['payload']
		) =>
			| Extract<MessagingEvents, { type: T }>['returns']
			| Promise<Extract<MessagingEvents, { type: T }>['returns']>
	) {
		this.listeners.set(type, listener);

		return () => {
			this.listeners.delete(type);
		};
	}
}

export const messagingService = new MessagingService();
