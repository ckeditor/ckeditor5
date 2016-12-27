/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false */

import testUtils from 'ckeditor5-ui/tests/_utils/utils';
import StickyToolbarView from 'ckeditor5-ui/src/toolbar/sticky/stickytoolbarview';

testUtils.createTestUIView( {
	top: '.ck-editor__top'
} )
.then( ui => {
	createToolbar( ui.top );
} )
.catch( err => {
	console.error( err.stack );
} );

function createToolbar( collection ) {
	const toolbar = new StickyToolbarView();

	toolbar.limiterElement = collection._parentElement.parentNode;

	collection.add( toolbar ).then( () => {
		toolbar.isActive = true;
	} );
}
