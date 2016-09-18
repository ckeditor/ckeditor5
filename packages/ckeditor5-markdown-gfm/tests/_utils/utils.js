import { stringify } from '/tests/engine/_utils/view.js';
import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';

export function testDataProcessor( markdown, viewString, normalizedMd ) {
	const dataProcessor = new MarkdownDataProcessor();
	const viewFragment = dataProcessor.toView( markdown );

	// Check if view has correct data.
	expect( stringify( viewFragment ) ).to.equal( viewString );

	// Check if converting back gives the same result.
	const normalized = typeof normalizedMd !== 'undefined' ? normalizedMd : markdown;

	expect( dataProcessor.toData( viewFragment ) ).to.equal( normalized );
}
