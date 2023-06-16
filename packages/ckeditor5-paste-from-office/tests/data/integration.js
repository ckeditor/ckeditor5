/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
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
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';

import PasteFromOffice from '../../src/pastefromoffice';
import { generateTests } from '../_utils/utils';
import * as fixtures from '../_utils/fixtures';

const browsers = [ 'chrome', 'firefox', 'safari', 'edge' ];

describe( 'PasteFromOffice - integration', () => {
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

	function generateIntegrationTests( config ) {
		const commonIntegrationConfig = {
			type: 'integration',
			fixtures,
			browsers
		};

		return generateTests( Object.assign( {}, config, commonIntegrationConfig ) );
	}
} );
