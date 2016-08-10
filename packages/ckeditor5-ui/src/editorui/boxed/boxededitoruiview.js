/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import EditorUIView from '../../editorui/editoruiview.js';
import uid from '../../../utils/uid.js';
import Template from '../../template.js';

/**
 * The boxed editor UI view class. This class represents an editor interface
 * consisting of a toolbar and an editable area, enclosed within a box.
 *
 * See {@link ui.editorUI.boxed.BoxedEditorUI}.
 *
 * @member ui.editorUI.boxed
 * @extends ui.editorUI.EditorUIView
 */
export default class BoxedEditorUIView extends EditorUIView {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = this.t;
		const ariaLabelUid = uid();

		this.template = new Template( {
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
						class: 'ck-editor__top ck-reset_all',
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
		} );

		this.register( 'top', '.ck-editor__top' );
		this.register( 'main', '.ck-editor__main' );
	}
}
