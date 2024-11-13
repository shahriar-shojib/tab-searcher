import { clearMarkedElements } from './remove-highlight';

describe('clearMarkedElements', () => {
	beforeEach(() => {
		document.body.innerHTML = `
			<div>
				<mark>Highlighted text 1</mark>
				<span class="highlighted">Highlighted text 2</span>
				<p>Normal text</p>
			</div>
		`;
	});

	it('should remove all <mark> elements and keep their content', () => {
		clearMarkedElements();
		expect(document.querySelectorAll('mark').length).toBe(0);
		expect(document.body.textContent).toContain('Highlighted text 1');
	});

	it('should remove all <span class="highlighted"> elements and keep their content', () => {
		clearMarkedElements();
		expect(document.querySelectorAll('span.highlighted').length).toBe(0);
		expect(document.body.textContent).toContain('Highlighted text 2');
	});

	it('should not remove or alter other elements', () => {
		clearMarkedElements();
		expect(document.querySelectorAll('p').length).toBe(1);
		expect(document.body.textContent).toContain('Normal text');
	});
});
