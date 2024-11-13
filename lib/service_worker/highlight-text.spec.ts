import { searchAndHighlight } from './highlight-text';

describe('searchAndHighlight', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		//https://stackoverflow.com/a/53294906/2703813
		window.HTMLSpanElement.prototype.scrollIntoView = () => {};
	});

	it('highlights a single occurrence of the keyword', () => {
		document.body.innerHTML = '<p>This is a test paragraph.</p>';
		searchAndHighlight('test');
		const highlighted = document.querySelectorAll('.highlighted');
		expect(highlighted.length).toBe(1);
		expect(highlighted[0]?.textContent).toBe('test');
	});

	it('highlights multiple occurrences of the keyword', () => {
		// ...existing code...
		document.body.innerHTML = '<p>Test this test case with Test keyword.</p>';
		searchAndHighlight('test');
		const highlighted = document.querySelectorAll('.highlighted');
		expect(highlighted.length).toBe(3);
	});

	it('is case-insensitive when highlighting', () => {
		document.body.innerHTML = '<p>Testing case sensitivity.</p>';
		searchAndHighlight('TESTING');
		const highlighted = document.querySelector('.highlighted');
		expect(highlighted).not.toBeNull();
		expect(highlighted?.textContent).toBe('Testing');
	});

	it('does not highlight when keyword is not found', () => {
		document.body.innerHTML = '<p>No matching keyword here.</p>';
		searchAndHighlight('absent');
		const highlighted = document.querySelector('.highlighted');
		expect(highlighted).toBeNull();
	});

	it('highlights keywords spanning multiple text nodes', () => {
		document.body.innerHTML = '<div>Multi<span>ple</span> nodes test.</div>';
		searchAndHighlight('multi');
		const highlighted = document.querySelector('.highlighted');
		expect(highlighted).not.toBeNull();
		expect(highlighted?.textContent).toBe('Multi');
	});
});
