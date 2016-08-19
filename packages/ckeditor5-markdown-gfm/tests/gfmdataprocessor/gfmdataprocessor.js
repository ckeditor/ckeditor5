/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import MarkdownDataProcessor from '/ckeditor5/markdown-gfm/gfmdataprocessor.js';
import { stringify } from '/tests/engine/_utils/view.js';

// Fixtures
import tidynes from '/tests/markdown-gfm/gfmdataprocessor/_fixtures/tidyness.js';
import tabs from '/tests/markdown-gfm/gfmdataprocessor/_fixtures/tabs.js';
import strongAndEmphasis from '/tests/markdown-gfm/gfmdataprocessor/_fixtures/strong_and_emphasis.js';
import lists from '/tests/markdown-gfm/gfmdataprocessor/_fixtures/lists.js';
import blockquotes from '/tests/markdown-gfm/gfmdataprocessor/_fixtures/blockquotes.js';
import codeBlocks from '/tests/markdown-gfm/gfmdataprocessor/_fixtures/code_blocks.js';

const fixturesSets = {
	'strong and emphasis': strongAndEmphasis,
	'lists': lists,
	'block quotes': blockquotes,
	'code blocks': codeBlocks,
	'tabs': tabs,
	'tidyness': tidynes
};

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		dataProcessor = new MarkdownDataProcessor();
	} );

	describe( 'toView', () => {
		for ( let fixtureSetName in fixturesSets ) {
			const fixtureSet = fixturesSets[ fixtureSetName ];

			describe( fixtureSetName, () => {
				for ( let fixture of fixtureSet ) {
					it( fixture.name, () => {
						const viewFragment = dataProcessor.toView( fixture.md );

						expect( stringify( viewFragment ) ).to.equal( fixture.html );
					} );
				}
			} );
		}
	} );
} );
