/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FuseDoc } from '~lib/search/search.service';
import type { ExtractData } from './sendMessage';

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

type SWITCH_TAB_EVENT = {
	type: 'SWITCH_TAB';
	payload: {
		tabId: number;
		keyword: string;
	};
	returns: void;
};

type REMOVE_MARK_EVENT = {
	type: 'REMOVE_MARK';
	payload: {
		tabId: number;
	};
	returns: void;
};

export type MessagingEvents =
	| SEARCH_EVENT
	| GET_INDEX_STATUS_EVENT
	| SET_RELOAD_REQUIRED_FALSE_EVENT
	| SWITCH_TAB_EVENT
	| REMOVE_MARK_EVENT;

/**
 * Strongly typed Messaging service to communicate between background and popup
 *
 */

export class MessagingService {
	private listeners = new Map<MessagingEvents['type'], (payload: any) => any>();

	async handleMessage(request: Omit<MessagingEvents, 'returns'>, _: chrome.runtime.MessageSender) {
		const listener = this.listeners.get(request.type);

		if (!listener) {
			console.log('no listener found for', request.type);
			return;
		}

		const response = await listener(request.payload);
		return response;
	}

	on<T extends MessagingEvents['type']>(
		type: T,
		listener: (
			payload: Extract<MessagingEvents, { type: T }>['payload']
		) => Promise<ExtractData<T, 'returns'>>
	) {
		this.listeners.set(type, listener);

		return () => {
			this.listeners.delete(type);
		};
	}
}

export const messagingService = new MessagingService();
