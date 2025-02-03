/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak.js';
import Bookmark from '@ckeditor/ckeditor5-bookmark/src/bookmark.js';

import PasteFromOffice from '../../src/pastefromoffice.js';
import { generateTests } from '../_utils/utils.js';
import * as fixtures from '../_utils/fixtures.js';

import stubUid from '@ckeditor/ckeditor5-list/tests/list/_utils/uid.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

const browsers = [ 'chrome', 'firefox', 'safari', 'edge' ];

describe( 'PasteFromOffice - integration', () => {
	testUtils.createSinonSandbox();

	beforeEach( () => {
		stubUid();
	} );

	generateIntegrationTests( {
		input: 'basic-styles',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, PasteFromOffice ]
		},
		skip: {
			safari: [ 'italicStartingText', 'multipleStylesSingleLine', 'multipleStylesMultiline' ] // Skip due to spacing issue (#13).
		}
	} );

	generateIntegrationTests( {
		input: 'image',
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

	generateIntegrationTests( {
		input: 'link',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Heading, Bold, Link, ShiftEnter, PasteFromOffice ]
		},
		skip: {
			safari: [ 'combined' ] // Skip due to spacing issue (#13).
		}
	} );

	generateIntegrationTests( {
		input: 'list',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Heading, Bold, Italic, Underline, Link, List, ListProperties, PasteFromOffice ]
		},
		skip: {
			safari: [ 'heading3Styled' ] // Skip due to spacing issue (#13).
		}
	} );

	generateIntegrationTests( {
		input: 'spacing',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, Italic, Underline, PasteFromOffice ]
		}
	} );

	generateIntegrationTests( {
		input: 'google-docs-bold-wrapper',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, ShiftEnter, PasteFromOffice ]
		}
	} );

	generateIntegrationTests( {
		input: 'google-docs-list',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, List, PasteFromOffice ]
		}
	} );

	generateIntegrationTests( {
		input: 'generic-list-in-table',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, List, Table, Bold, PasteFromOffice ]
		}
	} );

	generateIntegrationTests( {
		input: 'table',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Table, TableProperties, TableCellProperties, Bold, PasteFromOffice,
				FontColor, FontBackgroundColor ]
		}
	} );

	// See: https://github.com/ckeditor/ckeditor5/issues/7684.
	generateIntegrationTests( {
		input: 'font-without-table-properties',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Table, Bold, PasteFromOffice, FontColor, FontBackgroundColor ]
		}
	} );

	generateIntegrationTests( {
		input: 'page-break',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, PasteFromOffice, PageBreak ]
		}
	} );

	generateIntegrationTests( {
		input: 'google-docs-br-paragraphs',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, ShiftEnter, PasteFromOffice ]
		}
	} );

	generateIntegrationTests( {
		input: 'smart-tags',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bold, PasteFromOffice, FontColor ]
		}
	} );

	generateIntegrationTests( {
		input: 'bookmark',
		editorConfig: {
			plugins: [ Clipboard, Paragraph, Bookmark, Table, TableProperties, TableCellProperties, Bold, Image, PasteFromOffice ]
		}
	} );

	function generateIntegrationTests( config ) {
		const commonIntegrationConfig = {
			type: 'integration',
			fixtures,
			browsers
		};

		return generateTests( Object.assign( {}, config, commonIntegrationConfig ) );
	}
} );
