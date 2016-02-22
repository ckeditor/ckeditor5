/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ToolbarView from '/ckeditor5/ui/toolbar/toolbarview.js';

export default class FloatingToolbarView extends ToolbarView {
	constructor( model ) {
		super( model );

		const bind = this.attributeBinder;

		this.template.attributes.class.push(
			bind.to( 'isVisible', value => value ? 'ck-visible' : 'ck-hidden' )
		);

		// This has a high chance to break if someone defines "on" in the parent template.
		// See https://github.com/ckeditor/ckeditor5-core/issues/219
		this.template.on = {
			// Added just for fun, but needed to keep the focus in the editable.
			mousedown: ( evt ) => evt.preventDefault()
		};
	}
}
