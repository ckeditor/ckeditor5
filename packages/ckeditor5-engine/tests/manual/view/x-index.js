/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EditingView } from '../../../src/view/view.js';
import { _setViewData } from '../../../src/dev-utils/view.js';
import { createViewRoot } from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const view = new EditingView( new StylesProcessor() );
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

_setViewData( view,
	'<container:p>fo{}o</container:p>' +
	'<container:p></container:p>' +
	'<container:p><attribute:strong></attribute:strong></container:p>' +
	'<container:p>bar</container:p>' );

view.focus();

viewDocument.on( 'selectionChange', ( evt, data ) => {
	const node = data.newSelection.getFirstPosition().parent;
	console.log( node.name ? node.name : node._data );

	view.change( writer => writer.setSelection( data.newSelection ) );
} );
