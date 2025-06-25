/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EditingView } from '../../../src/view/view.js';
import { createViewRoot } from '../../view/_utils/createroot.js';
import { _setViewData } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const view = new EditingView( new StylesProcessor() );
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

_setViewData(
	view,
	'<container:p><attribute:strong>foo</attribute:strong>[]<attribute:strong>bar</attribute:strong></container:p>'
);

view.focus();

viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => {
		// Re-render view selection each time selection is changed.
		// See https://github.com/ckeditor/ckeditor5-engine/issues/796.
		writer.setSelection( data.newSelection );
	} );
} );

