/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharacterscategoriesview
 */

import { type Locale, Collection } from 'ckeditor5/src/utils.js';
import {
	type DropdownView, type ListDropdownItemDefinition,
	type ButtonView,
	View,
	addListToDropdown,
	ViewModel,
	LabeledFieldView,
	createLabeledDropdown
} from 'ckeditor5/src/ui.js';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 *
 * @extends module:ui/formheader/formheaderview~FormHeaderView
 */
export default class SpecialCharactersCategoriesView extends View {
	/**
	 * TODO
	 */
	declare public currentGroupName: string;

	/**
	 * TODO
	 */
	private _groupNames: Map<string, string>;

	/**
	 * TODO
	 */
	public dropdownView: LabeledFieldView<DropdownView>;

	/**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharacterscategoriesview~SpecialCharactersNavigationView}
	 * class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {Iterable.<String>} groupNames The names of the character groups.
	 */
	constructor( locale: Locale, groupNames: Map<string, string> ) {
		super( locale );

		this.set( 'currentGroupName', Array.from( groupNames.entries() )[ 0 ][ 0 ] );

		/**
		 * TODO
		 */
		this._groupNames = groupNames;

		/**
		 * TODO
		 */
		this.dropdownView = new LabeledFieldView( locale, createLabeledDropdown );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-character-categories' ]
			},
			children: [
				this.dropdownView
			]
		} );
	}

	/**
	 * TODO
	 */
	public override render(): void {
		super.render();

		this._setupDropdown();
	}

	/**
	 * TODO
	 */
	public focus(): void {
		this.dropdownView.focus();
	}

	/**
	 * TODO
	 */
	private _setupDropdown(): void {
		const items = new Collection<ListDropdownItemDefinition>();

		for ( const [ name, label ] of this._groupNames ) {
			const item: ListDropdownItemDefinition = {
				type: 'button',
				model: new ViewModel( {
					label,
					withText: true
				} )
			};

			item.model.bind( 'isOn' ).to( this, 'currentGroupName', value => {
				return value === name;
			} );

			items.add( item );
		}

		const t = this.locale!.t;
		const accessibleLabel = t( 'Category' );

		this.dropdownView.label = accessibleLabel;
		this.dropdownView.bind( 'isEmpty' ).to( this, 'currentGroupName', value => !value );

		this.dropdownView.fieldView.buttonView.set( {
			withText: true,
			tooltip: true,
			ariaLabel: accessibleLabel,
			isOn: false
		} );
		this.dropdownView.fieldView.buttonView.bind( 'label' ).to( this, 'currentGroupName' );
		this.dropdownView.fieldView.on( 'execute', ( { source } ) => {
			this.currentGroupName = ( source as ButtonView ).label!;
		} );

		addListToDropdown( this.dropdownView.fieldView, items );
	}
}
