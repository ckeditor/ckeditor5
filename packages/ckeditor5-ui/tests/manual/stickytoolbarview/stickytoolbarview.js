/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '../../../tests/_utils/utils';
import StickyToolbarView from '../../../src/toolbar/sticky/stickytoolbarview';

import '@ckeditor/ckeditor5-theme-lark/theme/theme.scss';

const ui = testUtils.createTestUIView( {
	stickyToTheTop: '.ck-sticky_to-the-top .ck-editor__top',
	stickyToTheBox: '.ck-sticky_to-the-box .ck-editor__top'
} );

createToolbar( ui.stickyToTheTop );
const stickyToTheBoxToolbar = createToolbar( ui.stickyToTheBox );

stickyToTheBoxToolbar.viewportTopOffset = 100;

function createToolbar( collection ) {
	const toolbar = new StickyToolbarView();

	toolbar.limiterElement = collection._parentElement.parentNode;

	collection.add( toolbar );
	toolbar.isActive = true;

	return toolbar;
}
