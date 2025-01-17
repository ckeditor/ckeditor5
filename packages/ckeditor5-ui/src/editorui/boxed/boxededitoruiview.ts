/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editorui/boxed/boxededitoruiview
 */

import EditorUIView from '../editoruiview.js';
import LabelView from '../../label/labelview.js';
import type ViewCollection from '../../viewcollection.js';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The boxed editor UI view class. This class represents an editor interface
 * consisting of a toolbar and an editable area, enclosed within a box.
 */
export default abstract class BoxedEditorUIView extends EditorUIView {
	/**
	 * Collection of the child views located in the top (`.ck-editor__top`)
	 * area of the UI.
	 */
	public readonly top: ViewCollection;

	/**
	 * Collection of the child views located in the main (`.ck-editor__main`)
	 * area of the UI.
	 */
	public readonly main: ViewCollection;

	/**
	 * Voice label of the UI.
	 */
	private readonly _voiceLabelView: LabelView;

	/**
	 * Creates an instance of the boxed editor UI view class.
	 *
	 * @param locale The locale instance..
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.top = this.createCollection();
		this.main = this.createCollection();
		this._voiceLabelView = this._createVoiceLabel();

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-editor',
					'ck-rounded-corners'
				],
				role: 'application',
				dir: locale.uiLanguageDirection,
				lang: locale.uiLanguage,
				'aria-labelledby': this._voiceLabelView.id
			},

			children: [
				this._voiceLabelView,
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-editor__top',
							'ck-reset_all'
						],
						role: 'presentation'
					},
					children: this.top
				},
				{
					tag: 'div',
					attributes: {
						class: [
							'ck',
							'ck-editor__main'
						],
						role: 'presentation'
					},
					children: this.main
				}
			]
		} );
	}

	/**
	 * Creates a voice label view instance.
	 */
	private _createVoiceLabel() {
		const t = this.t;
		const voiceLabel = new LabelView();

		voiceLabel.text = t( 'Rich Text Editor' );

		voiceLabel.extendTemplate( {
			attributes: {
				class: 'ck-voice-label'
			}
		} );

		return voiceLabel;
	}
}
