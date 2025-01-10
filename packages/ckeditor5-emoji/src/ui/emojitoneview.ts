/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojitoneview
 */

import '../../theme/emojitone.css';

import {
	type Locale
} from 'ckeditor5/src/utils.js';

import {
	createDropdown,
	addToolbarToDropdown,
	ListItemButtonView,

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

	private _mainDropdownButton: DropdownButtonView;
	private _dropdownButtons: ViewCollection<ListItemButtonView>;

	/**
	 * @inheritDoc
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

		this._mainDropdownButton = new DropdownButtonView();
		const dropdownView = createDropdown( locale, this._mainDropdownButton );
		this._dropdownButtons = new ViewCollection(
			this._skinTones.map( ( { id, example, tooltip } ) => this._createButton( locale, id, example, tooltip ) )
		);

		this._mainDropdownButton.withText = true;
		this._mainDropdownButton.label = this._skinTones[ this.selectedSkinTone ].example;
		this._mainDropdownButton.tooltip = 'Select skin tone';

		addToolbarToDropdown(
			dropdownView,
			this._dropdownButtons,
			{
				isVertical: true,
				isCompact: true,
				enableActiveItemFocusOnDropdownOpen: true,
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
		this._mainDropdownButton.focus();
	}

	/**
	 * Helper method for creating the button view element.
	 */
	private _createButton( locale: Locale, buttonSkinToneId: SkinToneId, example: string, tooltip: string ): ListItemButtonView {
		const buttonView = new ListItemButtonView( locale );

		buttonView.set( {
			label: example,
			withText: true,
			tooltip,
			tooltipPosition: 'e',
			hasCheckSpace: true,
			isToggleable: true
		} );

		buttonView.bind( 'isOn' ).to( this, 'selectedSkinTone', newSkinToneId => newSkinToneId === buttonSkinToneId );

		// Execute command.
		this.listenTo( buttonView, 'execute', () => {
			this.selectedSkinTone = buttonSkinToneId;

			this._mainDropdownButton.label = this._skinTones[ buttonSkinToneId ].example;
		} );

		return buttonView;
	}
}
