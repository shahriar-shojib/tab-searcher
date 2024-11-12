import { sendMessage } from './sendMessage';

describe('sendMessage', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.clearAllMocks();
	});

	it('should resolve with the correct response', async () => {
		const mockResponse = Promise.resolve(true);
		jest.spyOn(chrome.runtime, 'sendMessage').mockImplementation(async (_, cb, __) => {
			(cb as any)(mockResponse);
			return true;
		});

		const result = await sendMessage('GET_INDEX_STATUS');
		expect(result).toEqual(true);
	});

	it('should reject with an error when the message times out', async () => {
		const mockResponse = Promise.resolve(true);
		jest.spyOn(chrome.runtime, 'sendMessage').mockResolvedValue(mockResponse);

		const sendMessagePromise = sendMessage('GET_INDEX_STATUS');
		jest.advanceTimersByTime(1000);

		await expect(sendMessagePromise).rejects.toThrow(
			'There are no listeners for this event, or the event timed out'
		);
	});

	it('should reject with an error when chrome.runtime.sendMessage fails', async () => {
		const mockError = new Error('sendMessage failed');
		jest.spyOn(chrome.runtime, 'sendMessage').mockImplementation((_, _cb, __) => {
			throw mockError;
		});

		expect(() => sendMessage('GET_INDEX_STATUS')).rejects.toThrow('sendMessage failed');
	});
});
