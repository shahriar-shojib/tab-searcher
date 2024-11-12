import { Tab } from '~popup/components/Tab/Tab';
import { fireEvent, render } from '~test-utils';

describe('Tab Component', () => {
	it('should render the Tab component', () => {
		const result = render(
			<Tab
				tab={{
					content: 'content',
					id: 'id',
					title: 'title',
					url: 'https://tixio.io',
					favicon: ''
				}}
			/>
		);

		expect(result.container.querySelector('.truncate.text-lg')?.textContent).toBe('title');
		expect(result.container.querySelector('.text-blue-400')?.textContent).toBe('https://tixio.io');

		const img = result.container.querySelector('img');
		expect(img?.getAttribute('src')).toBe(
			'https://www.google.com/s2/favicons?domain_url=https://tixio.io'
		);
	});

	it('should call setActiveTab when the tab is clicked', () => {
		const setActiveTabMock = jest.fn();
		jest.spyOn(chrome.tabs, 'update').mockImplementation(setActiveTabMock);

		const { getByText } = render(
			<Tab
				tab={{
					content: 'content',
					id: 'id',
					title: 'title',
					url: 'https://tixio.io',
					favicon: ''
				}}
			/>
		);

		fireEvent.click(getByText('title'));
		expect(setActiveTabMock).toHaveBeenCalledWith(parseInt('id'), { active: true });
	});
});
