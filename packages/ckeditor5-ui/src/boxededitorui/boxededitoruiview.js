/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUIView from '/ckeditor5/ui/editorui/editoruiview.js';
import utils from '/ckeditor5/utils/utils.js';

export default class BoxedEditorUIView extends EditorUIView {
	constructor( model, locale ) {
		super( model, locale );

		const t = this.t;
		const ariaLabelUid = utils.uid();

		this.template = {
			tag: 'div',

			attributes: {
				class: 'ck-reset ck-editor',
				role: 'application',
				dir: 'ltr',
				lang: locale.lang,
				'aria-labelledby': `cke-editor__ariaLabel_${ ariaLabelUid }`
			},

			children: [
				{
					tag: 'span',
					attributes: {
						id: `cke-editor__ariaLabel_${ ariaLabelUid }`,
						class: 'cke-voice-label',
						children: [
							// TODO: Editor name?
							t( 'Rich Text Editor' )
						]
					}
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-editor-top ck-reset-all',
						role: 'presentation'
					}
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-editor-main',
						role: 'presentation'
					}
				}
			]
		};

		this.register( 'top', '.ck-editor-top' );
		this.register( 'main', '.ck-editor-main' );
	}
}
