export const clearMarkedElements = () => {
	// Remove <mark> elements
	document.querySelectorAll('mark').forEach((mark) => {
		const parent = mark.parentNode;
		if (parent) {
			while (mark.firstChild) {
				parent.insertBefore(mark.firstChild, mark);
			}
			parent.removeChild(mark);
		}
	});
	// Remove <span class="highlighted"> elements
	document.querySelectorAll('span.highlighted').forEach((span) => {
		const parent = span.parentNode;
		if (parent) {
			while (span.firstChild) {
				parent.insertBefore(span.firstChild, span);
			}
			parent.removeChild(span);
		}
	});
	return 'ok';
};
