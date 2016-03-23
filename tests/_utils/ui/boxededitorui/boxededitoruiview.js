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
				class: 'ck-reset ck-editor'
			},

			children: [
				{
					tag: 'div',
					attributes: {
						class: 'ck-editor-top ck-reset-all'
					}
				},

				{
					tag: 'div',
					attributes: {
						class: 'ck-editor-editable ck-reset-all'
					}
				}
			]
		};

		this.register( 'top', '.ck-editor-top' );
		this.register( 'editable', '.ck-editor-editable' );
	}
}
