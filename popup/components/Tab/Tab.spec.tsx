import { Tab } from '~popup/components/Tab/Tab';
import { render } from '~test-utils';

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

		expect(result.container.querySelector('.text-lg')?.textContent).toBe('title');
		expect(result.container.querySelector('.text-blue-400')?.textContent).toBe('tixio.io');

		const img = result.container.querySelector('img');
		expect(img?.getAttribute('src')).toBe(
			'https://www.google.com/s2/favicons?domain_url=https://tixio.io'
		);
	});
});
