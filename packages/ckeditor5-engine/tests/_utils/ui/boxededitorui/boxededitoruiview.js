/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import View from '/ckeditor5/core/ui/view.js';

export default class BoxedEditorUIView extends View {
	constructor( model ) {
		super( model );

		this.template = {
			tag: 'div',
			attrs: {
				'class': [ 'ck-chrome' ]
			}
		};

		this.register( 'main', el => el );
	}
}
