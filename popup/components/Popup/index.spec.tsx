jest.mock('../../../lib/messaging/sendMessage');
import '@testing-library/jest-dom';
import { sendMessage } from '~lib/messaging/sendMessage';
import { fireEvent, render, waitFor } from '~test-utils';
import { Popup } from '.';

const mockedSendMessage = sendMessage as jest.Mock;

describe('IndexPopup Component', () => {
	it('should render the IndexPopup component', () => {
		const { getByText } = render(<Popup />);
		expect(getByText('Search for something')).toBeInTheDocument();
	});

	it('should submit the search form and trigger the search', async () => {
		mockedSendMessage.mockImplementation(
			() =>
				new Promise(() => {
					return [];
				})
		);
		const { getByRole, getByPlaceholderText } = render(<Popup />);
		const input = getByPlaceholderText('Search');
		const button = getByRole('button', { name: /search/i });

		fireEvent.change(input, { target: { value: 'test query' } });
		fireEvent.click(button);

		await waitFor(() =>
			expect(sendMessage).toHaveBeenCalledWith('SEARCH', { query: 'test query' })
		);
	});

	it('should display loading state', async () => {
		mockedSendMessage.mockImplementation(
			() =>
				new Promise(() => {
					return [];
				})
		);
		const { getByRole, getByPlaceholderText, container } = render(<Popup />);
		const input = getByPlaceholderText('Search');
		const button = getByRole('button', { name: /search/i });

		fireEvent.change(input, { target: { value: 'test query' } });
		fireEvent.click(button);

		await waitFor(() => expect(container.querySelectorAll('.animate-pulse').length).toBe(3));
	});

	it('should display error state', async () => {
		mockedSendMessage.mockRejectedValue(new Error('Search failed'));
		const { getByRole, getByPlaceholderText, getByText } = render(<Popup />);
		const input = getByPlaceholderText('Search');
		const button = getByRole('button', { name: /search/i });

		fireEvent.change(input, { target: { value: 'test query' } });
		fireEvent.click(button);

		await waitFor(() => expect(getByText('Search failed')).toBeInTheDocument());
	});

	it('should display loaded state with search results', async () => {
		const mockResults = [{ id: '1', title: 'Result 1', url: 'https://example.com', favicon: '' }];
		mockedSendMessage.mockResolvedValue(mockResults);
		const { getByRole, getByPlaceholderText, getByText } = render(<Popup />);
		const input = getByPlaceholderText('Search');
		const button = getByRole('button', { name: /search/i });

		fireEvent.change(input, { target: { value: 'test query' } });
		fireEvent.click(button);

		await waitFor(() => expect(getByText('Result 1')).toBeInTheDocument());
	});
});
