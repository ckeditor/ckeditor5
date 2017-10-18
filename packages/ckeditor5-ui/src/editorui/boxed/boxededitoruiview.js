/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/editorui/boxed/boxededitoruiview
 */

import EditorUIView from '../../editorui/editoruiview';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

/**
 * The boxed editor UI view class. This class represents an editor interface
 * consisting of a toolbar and an editable area, enclosed within a box.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class BoxedEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the boxed editor UI view class.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance..
	 */
	constructor( locale ) {
		super( locale );

		const t = this.t;
		const ariaLabelUid = uid();

		/**
		 * Collection of the child views located in the top (`.ck-editor__top`)
		 * area of the UI.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.top = this.createCollection();

		/**
		 * Collection of the child views located in the main (`.ck-editor__main`)
		 * area of the UI.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.main = this.createCollection();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck-reset',
					'ck-editor',
					'ck-rounded-corners'
				],
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
						class: 'cke-voice-label'
					},
					children: [
						// TODO: Editor name?
						t( 'Rich Text Editor' )
					]
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-editor__top ck-reset_all',
						role: 'presentation'
					},
					children: this.top
				},
				{
					tag: 'div',
					attributes: {
						class: 'ck-editor__main',
						role: 'presentation'
					},
					children: this.main
				}
			]
		} );
	}
}
