import { MessagingEvents } from '~lib/messaging/messaging.service';

type MessageTypes = MessagingEvents['type'];

type ExtractData<Type extends MessageTypes, DataKey extends keyof MessagingEvents> = Extract<
	MessagingEvents,
	{ type: Type }
>[DataKey];

type ParametersType<T extends MessageTypes> =
	ExtractData<T, 'payload'> extends never ? [] : [ExtractData<T, 'payload'>];

/**
 * ### Local abstraction for sending messages to the background script
 *
 * ### payload and returns are strongly typed based on the event type and handles timeouts
 *
 * @example
 * ```tsx
 * const indexStatus = await sendMessage('GET_INDEX_STATUS')
 * //    ^? boolean
 * ```
 *
 */
export const sendMessage = <T extends MessageTypes>(
	type: T,
	...payload: ParametersType<T>
): Promise<ExtractData<T, 'returns'>> => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return new Promise<any>((resolve, reject) => {
		let rejected = false;
		const timeout = setTimeout(() => {
			reject(new Error('There are no listeners for this event, or the event timed out'));
			rejected = true;
		}, 1000);

		chrome.runtime
			.sendMessage({
				type,
				payload: payload[0]
			})
			.then((response) => {
				if (rejected) return;
				clearTimeout(timeout);
				resolve(response);
			})
			.catch((error) => {
				if (rejected) return;
				clearTimeout(timeout);
				reject(error);
			});
	});
};
