/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { EditingView } from '../../../src/view/view.js';
import { _setViewData } from '../../../src/dev-utils/view.js';
import { createViewRoot } from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const iframe = document.getElementById( 'iframe' );
iframe.srcdoc = '<div contenteditable="true" id="editor"></div>';

iframe.addEventListener( 'load', () => {
	const view = new EditingView( new StylesProcessor() );
	const viewDocument = view.document;
	createViewRoot( viewDocument );

	view.attachDomRoot( iframe.contentWindow.document.getElementById( 'editor' ) );

	_setViewData( view,
		'<container:p>foo</container:p>' +
		'<container:p>bar</container:p>'
	);
} );
