/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '../../../_utils/utils.js';
import StickyPanelView from '../../../../src/panel/sticky/stickypanelview.js';

const ui = testUtils.createTestUIView( {
	stickyToTheTop: '.ck-sticky_to-the-top .ck-editor__top',
	stickyToTheBox: '.ck-sticky_to-the-box .ck-editor__top',
	stickyWithScrollableAncestors: '.ck-sticky_with-scrollable-ancestors .ck-editor__top'
} );

createStickyPanel( ui.stickyToTheTop );
createStickyPanel( ui.stickyToTheBox ).viewportTopOffset = 100;
createStickyPanel( ui.stickyWithScrollableAncestors ).viewportTopOffset = 100;

function createStickyPanel( collection ) {
	const panel = new StickyPanelView();

	panel.limiterElement = collection._parentElement.parentNode;

	collection.add( panel );
	panel.isActive = true;

	return panel;
}
