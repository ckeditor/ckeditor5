/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUIView from '/ckeditor5/ui/editorui/editoruiview.js';

export default class BoxedEditorUIView extends EditorUIView {
	constructor( model, locale ) {
		super( model, locale );

		this.template = {
			tag: 'div',

			attributes: {
				class: 'ck-box'
			},

			children: [
				{
					tag: 'div',
					attributes: {
						class: 'ck-box-region ck-top'
					}
				},

				{
					tag: 'div',
					attributes: {
						class: 'ck-box-region ck-main'
					}
				}
			]
		};

		this.register( 'top', '.ck-top' );
		this.register( 'main', '.ck-main' );
	}
}
