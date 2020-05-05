/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document */

import View from '../../../src/view/view';
import createViewRoot from '../_utils/createroot';
import { setData } from '../../../src/dev-utils/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

viewDocument.on( 'mutations', ( evt, mutations ) => console.log( mutations ) );
viewDocument.on( 'selectionChange', ( evt, data ) => {
	view.change( writer => writer.setSelection( data.newSelection ) );
} );

setData( view,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>'
);
