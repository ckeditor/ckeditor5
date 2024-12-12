/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import '../../theme/emojitone.css';

import {
	type Locale
} from 'ckeditor5/src/utils.js';

import {
	createDropdown,
	addToolbarToDropdown,
	ButtonView,

	View,
	ViewCollection,
	DropdownButtonView
} from 'ckeditor5/src/ui.js';

export type SkinToneId = 0 | 1 | 2 | 3 | 4 | 5;

export default class EmojiToneView extends View {
	declare public selectedSkinTone: SkinToneId;

	private _skinTones: Array<{
		id: SkinToneId;
		example: string;
		tooltip: string;
	}>;

	private _dropdownButton: DropdownButtonView;

	/**
	 * Creates an instance of the {@link module:emoji/ui/specialcharacterscategoriesview~EmojiCategoriesView}
	 * class.
	 *
	 * @param locale The localization services instance.
	 * @param groupNames The names of the character groups.
	 */
	constructor( locale: Locale, defaultSkinTone: SkinToneId ) {
		super( locale );

		this.set( 'selectedSkinTone', defaultSkinTone );

		this._skinTones = [
			{ id: 0, example: '👋', tooltip: 'Default skin tone' },
			{ id: 1, example: '👋🏻', tooltip: 'Light skin tone' },
			{ id: 2, example: '👋🏼', tooltip: 'Medium Light skin tone' },
			{ id: 3, example: '👋🏽', tooltip: 'Medium skin tone' },
			{ id: 4, example: '👋🏾', tooltip: 'Medium Dark skin tone' },
			{ id: 5, example: '👋🏿', tooltip: 'Dark skin tone' }
		];

		this._dropdownButton = new DropdownButtonView();
		const dropdownView = createDropdown( locale, this._dropdownButton );
		const dropdownButtons = new ViewCollection(
			this._skinTones.map( ( { id, example, tooltip } ) => this._createButton( locale, id, example, tooltip ) )
		);

		this._dropdownButton.withText = true;
		this._dropdownButton.label = this._skinTones[ this.selectedSkinTone ].example;
		this._dropdownButton.tooltip = 'Select skin tone';

		addToolbarToDropdown(
			dropdownView,
			dropdownButtons,
			{
				isVertical: true,
				ariaLabel: locale.t( 'Text alignment toolbar' )
			}
		);

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-emoji-tone' ]
			},
			children: [ dropdownView ]
		} );
	}

	public focus(): void {
		this._dropdownButton.focus();
	}

	/**
	 * Helper method for creating the button view element.
	 */
	private _createButton( locale: Locale, skinToneId: SkinToneId, example: string, tooltip: string ): ButtonView {
		const buttonView = new ButtonView( locale );

		buttonView.set( {
			label: example,
			withText: true,
			tooltip,
			tooltipPosition: 'e'
		} );

		// Execute command.
		this.listenTo( buttonView, 'execute', () => {
			this.selectedSkinTone = skinToneId;

			this._dropdownButton.label = this._skinTones[ skinToneId ].example;
		} );

		return buttonView;
	}
}
