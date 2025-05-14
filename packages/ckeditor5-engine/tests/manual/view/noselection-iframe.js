/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '../../../src/view/view.js';
import { setData } from '../../../src/dev-utils/view.js';
import createViewRoot from '../../view/_utils/createroot.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

const iframe = document.getElementById( 'iframe' );
iframe.srcdoc = '<div contenteditable="true" id="editor"></div>';

iframe.addEventListener( 'load', () => {
	const view = new View( new StylesProcessor() );
	const viewDocument = view.document;
	createViewRoot( viewDocument );

	view.attachDomRoot( iframe.contentWindow.document.getElementById( 'editor' ) );

	setData( view,
		'<container:p>foo</container:p>' +
		'<container:p>bar</container:p>'
	);
} );
