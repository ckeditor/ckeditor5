/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersnavigationview
 */

import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import {
	createDropdown,
	addListToDropdown
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';

/**
 * A class representing the navigation part of the special characters UI. It is responsible
 * for describing the feature and allowing the user to select a particular character group.
 *
 * @extends module:ui/formheader/formheaderview~FormHeaderView
 */
export default class SpecialCharactersNavigationView extends FormHeaderView {
	/**
	 * Creates an instance of the {@link module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView}
	 * class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {Iterable.<String>} groupNames The names of the character groups.
	 */
	constructor( locale, groupNames ) {
		super( locale );

		const t = locale.t;

		this.set( 'class', 'ck-special-characters-navigation' );

		/**
		 * A dropdown that allows selecting a group of special characters to be displayed.
		 *
		 * @member {module:ui/dropdown/dropdownview~DropdownView}
		 */
		this.groupDropdownView = this._createGroupDropdown( groupNames );
		this.groupDropdownView.panelPosition = locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw';

		/**
		 * @inheritDoc
		 */
		this.label = t( 'Special characters' );

		/**
		 * @inheritDoc
		 */
		this.children.add( this.groupDropdownView );
	}

	/**
	 * Returns the name of the character group currently selected in the {@link #groupDropdownView}.
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
	 * @param {Iterable.<String>} groupNames The names of the character groups.
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
			tooltip: t( 'Character categories' ),
			class: [ 'ck-dropdown__button_label-width_auto' ]
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
	 * @param {Iterable.<String>} groupNames The names of the character groups.
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
