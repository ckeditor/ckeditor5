/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '../../../src/view/view';
import { setData } from '../../../src/dev-utils/view';
import createViewRoot from '../_utils/createroot';
import { StylesProcessor } from '../../../src/view/stylesmap';

const view = new View( new StylesProcessor() );
const viewDocument = view.document;
createViewRoot( viewDocument );
view.attachDomRoot( document.getElementById( 'editor' ) );

viewDocument.on( 'selectionChange', () => {
	// Re-render view selection each time selection is changed.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/796.
	view.forceRender();
} );

setData( view,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>' );
