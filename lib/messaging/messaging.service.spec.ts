import { MessagingService } from '~lib/messaging/messaging.service';

describe('MessagingService', () => {
	let messagingService: MessagingService;

	beforeEach(() => {
		messagingService = new MessagingService();
	});

	it('should register a listener correctly', () => {
		const listener = jest.fn();
		messagingService.on('SEARCH', listener);

		expect(messagingService['listeners'].get('SEARCH')).toBe(listener);
	});

	it('should return a function to unregister the listener', () => {
		const listener = jest.fn();
		const unregister = messagingService.on('SEARCH', listener);

		unregister();

		expect(messagingService['listeners'].get('SEARCH')).toBeUndefined();
	});

	it('should call the correct listener with the correct payload', async () => {
		const listener = jest.fn().mockResolvedValue([{ id: '1', title: 'Test' }]);
		messagingService.on('SEARCH', listener);

		const res = await messagingService.handleMessage(
			{ type: 'SEARCH', payload: { query: 'test' } },
			{} as chrome.runtime.MessageSender
		);

		expect(listener).toHaveBeenCalledWith({ query: 'test' });
		expect(res).toBe([{ id: '1', title: 'Test' }]);
	});

	it('should send the correct response', async () => {
		const listener = jest.fn().mockResolvedValue('indexing');
		messagingService.on('GET_INDEX_STATUS', listener);

		const res = await messagingService.handleMessage(
			{ type: 'GET_INDEX_STATUS', payload: {} as never },
			{} as chrome.runtime.MessageSender
		);

		expect(listener).toHaveBeenCalledWith({});
		expect(res).toBe('indexing');
	});
});
