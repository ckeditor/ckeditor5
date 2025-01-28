/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '../../src/pastefromoffice.js';

import { generateTests } from '../_utils/utils.js';
import * as fixtures from '../_utils/fixtures.js';

const browsers = [ 'chrome', 'firefox', 'safari', 'edge' ];

const editorConfig = {
	plugins: [ ClipboardPipeline, PasteFromOffice, Paragraph ]
};

describe( 'PasteFromOffice - normalization', () => {
	generateNormalizationTests( {
		input: 'basic-styles'
	} );

	generateNormalizationTests( {
		input: 'image'
	} );

	generateNormalizationTests( {
		input: 'link'
	} );

	generateNormalizationTests( {
		input: 'list'
	} );

	generateNormalizationTests( {
		input: 'spacing'
	} );

	generateNormalizationTests( {
		input: 'google-docs-bold-wrapper'
	} );

	generateNormalizationTests( {
		input: 'generic-list-in-table'
	} );

	generateNormalizationTests( {
		input: 'google-docs-br-paragraphs'
	} );

	function generateNormalizationTests( config ) {
		const commonIntegrationConfig = {
			type: 'normalization',
			fixtures,
			editorConfig,
			browsers
		};

		return generateTests( Object.assign( {}, config, commonIntegrationConfig ) );
	}
} );
