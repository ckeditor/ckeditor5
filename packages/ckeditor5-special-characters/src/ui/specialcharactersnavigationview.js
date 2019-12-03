/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersnavigationview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import {
	createDropdown,
	addListToDropdown
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 *
 * @extends module:ui/view~View
 */
export default class SpecialCharactersNavigationView extends View {
	/**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView}
	 * class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {Iterable.<String>} groupNames Names of the character groups.
	 */
	constructor( locale, groupNames ) {
		super( locale );

		const t = locale.t;

		/**
		 * Label of the navigation view describing its purpose.
		 *
		 * @member {module:ui/label/labelview~LabelView}
		 */
		this.labelView = new LabelView( locale );
		this.labelView.text = t( 'Special characters' );

		/**
		 * A dropdown that allows selecting a group of special characters to be displayed.
		 *
		 * @member {module:ui/dropdown/dropdownview~DropdownView}
		 */
		this.groupDropdownView = this._createGroupDropdown( groupNames );
		this.groupDropdownView.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-special-characters-navigation'
				]
			},
			children: [
				this.labelView,
				this.groupDropdownView
			]
		} );
	}

	/**
	 * Returns a name of the character group currently selected in the {@link #groupDropdownView}.
	 *
	 * @returns {String}
	 */
	get currentGroupName() {
		return this.groupDropdownView.value;
	}

	/**
	 * Returns a dropdown that allows selecting character groups.
	 *
	 * @private
	 * @param {Iterable.<String>} groupNames Names of the character groups.
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createGroupDropdown( groupNames ) {
		const locale = this.locale;
		const t = locale.t;
		const dropdown = createDropdown( locale );
		const groupDefinitions = this._getCharacterGroupListItemDefinitions( dropdown, groupNames );

		dropdown.set( 'value', groupDefinitions.first.model.label );

		dropdown.buttonView.bind( 'label' ).to( dropdown, 'value' );

		dropdown.buttonView.set( {
			isOn: false,
			withText: true,
			tooltip: t( 'Character categories' )
		} );

		dropdown.on( 'execute', evt => {
			dropdown.value = evt.source.label;
		} );

		dropdown.delegate( 'execute' ).to( this );

		addListToDropdown( dropdown, groupDefinitions );

		return dropdown;
	}

	/**
	 * Returns list item definitions to be used in the character group dropdown
	 * representing specific character groups.
	 *
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
	 * @param {Iterable.<String>} groupNames Names of the character groups.
	 * @returns {Iterable.<module:ui/dropdown/utils~ListDropdownItemDefinition>}
	 */
	_getCharacterGroupListItemDefinitions( dropdown, groupNames ) {
		const groupDefs = new Collection();

		for ( const name of groupNames ) {
			const definition = {
				type: 'button',
				model: new Model( {
					label: name,
					withText: true
				} )
			};

			definition.model.bind( 'isOn' ).to( dropdown, 'value', value => {
				return value === definition.model.label;
			} );

			groupDefs.add( definition );
		}

		return groupDefs;
	}
}
