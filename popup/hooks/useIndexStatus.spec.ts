import { sendMessage } from '~lib/messaging/sendMessage';
import { act, renderHook, waitFor } from '~test-utils';
import { useIndexStatus } from './useIndexStatus';

jest.mock('../../lib/messaging/sendMessage');
const mockedSendMessage = sendMessage as jest.Mock;

// const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('useIndexStatus', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should call reloadAll and reload all tabs', async () => {
		mockedSendMessage.mockResolvedValue('indexed');

		const queryFN = jest.spyOn(chrome.tabs, 'query').mockImplementation(async () => {
			return [{ id: 1 }, { id: 2 }] as chrome.tabs.Tab[];
		});

		const reloadFn = jest.spyOn(chrome.tabs, 'reload').mockImplementation(() => {});

		const { result } = renderHook(() => useIndexStatus());

		act(() => {
			result.current.reloadAll();
		});

		await waitFor(() => {
			expect(queryFN).toHaveBeenCalled();
			expect(reloadFn).toHaveBeenCalledTimes(2);
			expect(mockedSendMessage).toHaveBeenCalledWith('SET_RELOAD_REQUIRED_FALSE');
			expect(result.current.indexStatus).toBe('indexed');
		});
	});

	it('should call continueWithoutReload and send SET_RELOAD_REQUIRED_FALSE message', async () => {
		mockedSendMessage.mockResolvedValue('indexing');

		const { result } = renderHook(() => useIndexStatus());

		act(() => {
			result.current.continueWithoutReload();
		});

		waitFor(() => {
			expect(mockedSendMessage).toHaveBeenCalledWith('SET_RELOAD_REQUIRED_FALSE');
		});
	});

	it('should have initial indexStatus as "indexing"', () => {
		const { result } = renderHook(() => useIndexStatus());
		expect(result.current.indexStatus).toBe('indexing');
	});

	it('should update indexStatus to "indexed" after receiving response', async () => {
		mockedSendMessage.mockResolvedValueOnce('indexed');

		const { result } = renderHook(() => useIndexStatus());

		await waitFor(() => {
			expect(result.current.indexStatus).toBe('indexed');
		});
	});

	it('should keep checking index status until it is "indexed"', async () => {
		mockedSendMessage
			.mockResolvedValueOnce('indexing')
			.mockResolvedValueOnce('indexing')
			.mockResolvedValueOnce('indexed');

		const { result } = renderHook(() => useIndexStatus());

		await waitFor(() => {
			expect(result.current.indexStatus).toBe('indexed');
		});
	});
});
