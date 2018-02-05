/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import View from '../../../src/view/view';
import Position from '../../../src/view/position';
import { parse } from '../../../src/dev-utils/view';
import createViewRoot from '../_utils/createroot';

const view = new View();
const viewDocument = view.document;
const viewRoot = createViewRoot( viewDocument, 'div' );
view.attachDomRoot( document.getElementById( 'editor' ) );

view.change( writer => {
	const { selection, view: data } = parse(
		'<container:p><attribute:strong>foo</attribute:strong>[]<attribute:strong>bar</attribute:strong></container:p>' +
		'<container:p></container:p>' +
		'<container:p><attribute:strong></attribute:strong></container:p>' +
		'<container:p>bom</container:p>'
	);

	writer.insert( Position.createAt( viewRoot ), data );
	writer.setSelection( selection );
} );

viewDocument.on( 'selectionChange', () => {
	// Re-render view selection each time selection is changed.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/796.
	view.render();
} );

view.focus();
