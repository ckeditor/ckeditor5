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

viewDocument.on( 'selectionChange', () => {
	// Re-render view selection each time selection is changed.
	// See https://github.com/ckeditor/ckeditor5-engine/issues/796.
	view.forceRender();
} );

_setViewData( view,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>' );
