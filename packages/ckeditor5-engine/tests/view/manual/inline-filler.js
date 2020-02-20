/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '../../../src/view/view';
import createViewRoot from '../_utils/createroot';
import { setData } from '../../../src/dev-utils/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

setData(
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

