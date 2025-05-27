/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../../src/view/view.js';
import { setData } from '../../../src/dev-utils/view.js';
import createViewRoot from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

setData( view,
	'<container:p><attribute:b>foo</attribute:b>bar</container:p>' +
	'<container:p>bom</container:p>' );

viewDocument.on( 'selectionChange', ( evt, data ) => {
	console.log( 'selectionChange', data );
	view.change( writer => writer.setSelection( data.newSelection ) );
} );

viewDocument.on( 'selectionChangeDone', ( evt, data ) => {
	console.log( '%c selectionChangeDone ', 'background: #222; color: #bada55', data );
	view.change( writer => writer.setSelection( data.newSelection ) );
} );
