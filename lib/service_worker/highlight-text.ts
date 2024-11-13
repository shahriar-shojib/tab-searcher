export const searchAndHighlight = (keyword: string) => {
	const wrapText = (node: Text): boolean => {
		const regex = new RegExp(`(${keyword.replace(/\s+/g, '\\s+')})`, 'gi');
		const text = node.textContent || '';
		let lastIndex = 0;
		const fragments = [];
		let match;

		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
			}

			const span = document.createElement('span');
			span.style.backgroundColor = 'yellow';
			span.className = 'highlighted';
			span.textContent = match[0];
			fragments.push(span);

			lastIndex = regex.lastIndex;
		}

		if (lastIndex < text.length) {
			fragments.push(document.createTextNode(text.substring(lastIndex)));
		}

		if (fragments.length > 0) {
			const parent = node.parentNode;
			fragments.forEach((fragment) => parent?.insertBefore(fragment, node));
			parent?.removeChild(node);
			return true;
		}

		return false;
	};

	const highlightKeywords = (node: Node): boolean => {
		let found = false;
		if (node.nodeType === Node.TEXT_NODE) {
			found = wrapText(node as Text);
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			node.childNodes.forEach((child) => {
				if (highlightKeywords(child)) found = true;
			});
		}
		return found;
	};

	const found = highlightKeywords(document.body);
	if (found) {
		const firstHighlight = document.querySelector<HTMLElement>('.highlighted');
		if (firstHighlight) {
			firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}
	return 'ok';
};
