/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '../../../tests/_utils/utils';
import StickyToolbarView from '../../../src/toolbar/sticky/stickytoolbarview';

import '@ckeditor/ckeditor5-theme-lark/theme/theme.scss';

const ui = testUtils.createTestUIView( {
	top: '.ck-editor__top'
} );

createToolbar( ui.top );

function createToolbar( collection ) {
	const toolbar = new StickyToolbarView();

	toolbar.limiterElement = collection._parentElement.parentNode;

	collection.add( toolbar );
	toolbar.isActive = true;
}
