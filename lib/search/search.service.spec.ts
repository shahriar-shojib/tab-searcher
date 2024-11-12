import { SearchService } from './search.service';

describe('SearchService', () => {
	let service: SearchService;

	beforeEach(async () => {
		service = await SearchService.create();
	});

	it('should create a new SearchService', async () => {
		expect(service).toBeInstanceOf(SearchService);
	});

	it('should add documents to the search index', async () => {
		const docs = [
			{
				title: 'Example',
				url: 'https://example.com',
				content: 'Hello, world!',
				id: '1',
				favicon: 'https://example.com/favicon.ico'
			}
		];

		await service.addDocuments(docs);

		const result = await service.search('Hello');
		expect(result).toEqual(docs);
	});

	it('should remove a document from the search index', async () => {
		const docs = [
			{
				title: 'Example',
				url: 'https://example.com',
				content: 'Hello, world!',
				id: '1',
				favicon: 'https://example.com/favicon.ico'
			}
		];

		await service.addDocuments(docs);
		await service.removeDocument('1');

		const result = await service.search('Hello');
		expect(result).toEqual([]);
	});

	it('should return an empty array when no documents match the search query', async () => {
		const docs = [
			{
				title: 'Example',
				url: 'https://example.com',
				content: 'Hello, world!',
				id: '1',
				favicon: 'https://example.com/favicon.ico'
			}
		];

		await service.addDocuments(docs);

		const result = await service.search('Goodbye');
		expect(result).toEqual([]);
	});
});
