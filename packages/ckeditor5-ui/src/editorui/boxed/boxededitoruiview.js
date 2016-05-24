/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditorUIView from '../../editorui/editoruiview.js';
import uid from '../../../utils/uid.js';

/**
 * Boxed editor UI view.
 *
 * @member ui.editorUI.boxed
 * @extends ui.editorUI.EditorUIView
 */
export default class BoxedEditorUIView extends EditorUIView {
	/**
	 * Creates a BoxedEditorUIView instance.
	 *
	 * @param {utils.Observable} model (View)Model of this view.
	 * @param {utils.Locale} [locale] The {@link ckeditor5.Editor#locale editor's locale} instance.
	 */
	constructor( model, locale ) {
		super( model, locale );

		const t = this.t;
		const ariaLabelUid = uid();

		this.template = {
			tag: 'div',

			attributes: {
				class: 'ck-reset ck-editor',
				role: 'application',
				dir: 'ltr',
				lang: locale.lang,
				'aria-labelledby': `cke-editor__aria-label_${ ariaLabelUid }`
			},

			children: [
				{
					tag: 'span',
					attributes: {
						id: `cke-editor__aria-label_${ ariaLabelUid }`,
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
						class: 'ck-editor__top ck-reset-all',
						role: 'presentation'
					}
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-editor__main',
						role: 'presentation'
					}
				}
			]
		};

		this.register( 'top', '.ck-editor__top' );
		this.register( 'main', '.ck-editor__main' );
	}
}
