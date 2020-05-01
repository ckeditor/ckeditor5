/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '../../src/pastefromoffice';

import { generateTests } from '../_utils/utils';

const browsers = [ 'chrome', 'firefox', 'safari', 'edge' ];

const editorConfig = {
	plugins: [ Clipboard, PasteFromOffice, Paragraph ]
};

describe( 'PasteFromOffice - normalization', () => {
	generateTests( {
		input: 'basic-styles',
		type: 'normalization',
		browsers,
		editorConfig
	} );

	generateTests( {
		input: 'image',
		type: 'normalization',
		browsers,
		editorConfig
	} );

	generateTests( {
		input: 'link',
		type: 'normalization',
		browsers,
		editorConfig
	} );

	generateTests( {
		input: 'list',
		type: 'normalization',
		browsers,
		editorConfig
	} );

	generateTests( {
		input: 'spacing',
		type: 'normalization',
		browsers,
		editorConfig
	} );

	generateTests( {
		input: 'google-docs-bold-wrapper',
		type: 'normalization',
		browsers,
		editorConfig
	} );

	generateTests( {
		input: 'generic-list-in-table',
		type: 'normalization',
		browsers,
		editorConfig
	} );
} );
