import type { Orama, TypedDocument } from '@orama/orama';
import * as orama from '@orama/orama';
import { pluginQPS } from '@orama/plugin-qps';

const { create, insertMultiple, remove, search } = orama;
export type FuseDoc = {
	title: string;
	url: string;
	content: string;
	id: string;
	favicon: string;
};

type SchemaType = {
	url: 'string';
	title: 'string';
	favicon: 'string';
	content: 'string';
	id: 'string';
};

export type SearchDocument = TypedDocument<Orama<SchemaType>>;

export class SearchService {
	constructor(private db: Orama<SchemaType>) {}

	async search(query: string) {
		const result = await search(this.db, {
			limit: 10,
			term: query,
			properties: ['content', 'title'],
			boost: {
				content: 2
			},
			mode: 'fulltext'
		});

		return result.hits.map((e) => e.document);
	}

	async addDocuments(docs: FuseDoc[]) {
		await insertMultiple(this.db, docs);
	}

	async removeDocument(id: string) {
		await remove(this.db, id);
	}

	static async create() {
		const db = create({
			schema: {
				url: 'string',
				title: 'string',
				favicon: 'string',
				content: 'string',
				id: 'string'
			},
			sort: {
				enabled: true
			},
			components: {
				tokenizer: {
					stemming: true
				}
			},
			plugins: [pluginQPS()]
		});

		return new SearchService(db);
	}
}
