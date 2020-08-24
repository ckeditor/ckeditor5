/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import List from '@ckeditor/ckeditor5-list/src/list';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';

import PasteFromOffice from '../../src/pastefromoffice';
import { generateTests } from '../_utils/utils';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';

const browsers = [ 'chrome', 'firefox', 'safari', 'edge' ];

describe( 'PasteFromOffice - integration', () => {
	generateTests( {
		input: 'basic-styles',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, PasteFromOffice ]
		},
		skip: {
			safari: [ 'italicStartingText', 'multipleStylesSingleLine', 'multipleStylesMultiline' ] // Skip due to spacing issue (#13).
		}
	} );

	generateTests( {
		input: 'image',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Image, Table, PasteFromOffice ]
		},
		skip: {
			chrome: [],
			firefox: [],
			safari: [],
			edge: [ 'adjacentGroups' ]
		}
	} );

	generateTests( {
		input: 'link',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Heading, Bold, Link, ShiftEnter, PasteFromOffice ]
		},
		skip: {
			safari: [ 'combined' ] // Skip due to spacing issue (#13).
		}
	} );

	generateTests( {
		input: 'list',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Link, List, PasteFromOffice ]
		},
		skip: {
			safari: [ 'heading3Styled' ] // Skip due to spacing issue (#13).
		}
	} );

	generateTests( {
		input: 'spacing',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, Italic, Underline, PasteFromOffice ]
		}
	} );

	generateTests( {
		input: 'google-docs-bold-wrapper',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, PasteFromOffice ]
		}
	} );

	generateTests( {
		input: 'google-docs-list',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, List, PasteFromOffice ]
		}
	} );

	generateTests( {
		input: 'generic-list-in-table',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, List, Table, Bold, PasteFromOffice ]
		}
	} );

	generateTests( {
		input: 'table',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Table, TableProperties, TableCellProperties, Bold, PasteFromOffice,
				FontColor, FontBackgroundColor ]
		}
	} );

	// See: https://github.com/ckeditor/ckeditor5/issues/7684.
	generateTests( {
		input: 'font-without-table-properties',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Table, Bold, PasteFromOffice, FontColor, FontBackgroundColor ]
		}
	} );

	generateTests( {
		input: 'page-break',
		type: 'integration',
		browsers,
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, PasteFromOffice, PageBreak ]
		}
	} );
} );
