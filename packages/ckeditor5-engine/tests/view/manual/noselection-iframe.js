/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import View from '../../../src/view/view';
import { setData } from '../../../src/dev-utils/view';
import createViewRoot from '../_utils/createroot';

const view = new View();
const viewDocument = view.document;
createViewRoot( viewDocument );
const iframe = document.getElementById( 'iframe' );
view.attachDomRoot( iframe.contentWindow.document.getElementById( 'editor' ) );

setData( view,
	'<container:p>foo</container:p>' +
	'<container:p>bar</container:p>' );
