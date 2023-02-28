/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import ImageStyleEditing from './imagestyleediting';
import utils from './utils';
import { isObject, identity } from 'lodash-es';

import '../../theme/imagestyle.css';

/**
 * The image style UI plugin.
 *
 * It registers buttons corresponding to the {@link module:image/image~ImageConfig#styles} configuration.
 * It also registers the {@link module:image/imagestyle/utils~DEFAULT_DROPDOWN_DEFINITIONS default drop-downs} and the
 * custom drop-downs defined by the developer in the {@link module:image/image~ImageConfig#toolbar} configuration.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageStyleEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageStyleUI';
	}

	/**
	 * Returns the default localized style titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:image/imagestyle/utils~DEFAULT_OPTIONS} are available:
	 *
	 * * `'Wrap text'`,
	 * * `'Break text'`,
	 * * `'In line'`,
	 * * `'Full size image'`,
	 * * `'Side image'`,
	 * * `'Left aligned image'`,
	 * * `'Centered image'`,
	 * * `'Right aligned image'`
	 *
	 * @returns {Object.<String,String>}
	 */
	get localizedDefaultStylesTitles() {
		const t = this.editor.t;

		return {
			'Wrap text': t( 'Wrap text' ),
			'Break text': t( 'Break text' ),
			'In line': t( 'In line' ),
			'Full size image': t( 'Full size image' ),
			'Side image': t( 'Side image' ),
			'Left aligned image': t( 'Left aligned image' ),
			'Centered image': t( 'Centered image' ),
			'Right aligned image': t( 'Right aligned image' )
		};
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const plugins = this.editor.plugins;
		const toolbarConfig = this.editor.config.get( 'image.toolbar' ) || [];

		const definedStyles = translateStyles(
			plugins.get( 'ImageStyleEditing' ).normalizedStyles,
			this.localizedDefaultStylesTitles
		);

		for ( const styleConfig of definedStyles ) {
			this._createButton( styleConfig );
		}

		const definedDropdowns = translateStyles(
			[ ...toolbarConfig.filter( isObject ), ...utils.getDefaultDropdownDefinitions( plugins ) ],
			this.localizedDefaultStylesTitles
		);

		for ( const dropdownConfig of definedDropdowns ) {
			this._createDropdown( dropdownConfig, definedStyles );
		}
	}

	/**
	 * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition} dropdownConfig
	 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} definedStyles
	 */
	_createDropdown( dropdownConfig, definedStyles ) {
		const factory = this.editor.ui.componentFactory;

		factory.add( dropdownConfig.name, locale => {
			let defaultButton;

			const { defaultItem, items, title } = dropdownConfig;
			const buttonViews = items
				.filter( itemName => definedStyles.find( ( { name } ) => getUIComponentName( name ) === itemName ) )
				.map( buttonName => {
					const button = factory.create( buttonName );

					if ( buttonName === defaultItem ) {
						defaultButton = button;
					}

					return button;
				} );

			if ( items.length !== buttonViews.length ) {
				utils.warnInvalidStyle( { dropdown: dropdownConfig } );
			}

			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;
			const splitButtonViewArrow = splitButtonView.arrowView;

			addToolbarToDropdown( dropdownView, buttonViews, { enableActiveItemFocusOnDropdownOpen: true } );

			splitButtonView.set( {
				label: getDropdownButtonTitle( title, defaultButton.label ),
				class: null,
				tooltip: true
			} );

			splitButtonViewArrow.unbind( 'label' );
			splitButtonViewArrow.set( {
				label: title
			} );

			splitButtonView.bind( 'icon' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
				const index = areOn.findIndex( identity );

				return ( index < 0 ) ? defaultButton.icon : buttonViews[ index ].icon;
			} );

			splitButtonView.bind( 'label' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
				const index = areOn.findIndex( identity );

				return getDropdownButtonTitle( title, ( index < 0 ) ? defaultButton.label : buttonViews[ index ].label );
			} );

			splitButtonView.bind( 'isOn' ).toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) );

			splitButtonView.bind( 'class' )
				.toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) ? 'ck-splitbutton_flatten' : null );

			splitButtonView.on( 'execute', () => {
				if ( !buttonViews.some( ( { isOn } ) => isOn ) ) {
					defaultButton.fire( 'execute' );
				} else {
					dropdownView.isOpen = !dropdownView.isOpen;
				}
			} );

			dropdownView.bind( 'isEnabled' )
				.toMany( buttonViews, 'isEnabled', ( ...areEnabled ) => areEnabled.some( identity ) );

			// Focus the editable after executing the command.
			// Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
			this.listenTo( dropdownView, 'execute', () => {
				this.editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle~ImageStyleOptionDefinition} buttonConfig
	 */
	_createButton( buttonConfig ) {
		const buttonName = buttonConfig.name;

		this.editor.ui.componentFactory.add( getUIComponentName( buttonName ), locale => {
			const command = this.editor.commands.get( 'imageStyle' );
			const view = new ButtonView( locale );

			view.set( {
				label: buttonConfig.title,
				icon: buttonConfig.icon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', value => value === buttonName );
			view.on( 'execute', this._executeCommand.bind( this, buttonName ) );

			return view;
		} );
	}

	_executeCommand( name ) {
		this.editor.execute( 'imageStyle', { value: name } );
		this.editor.editing.view.focus();
	}
}

// Returns the translated `title` from the passed styles array.
//
// @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition|
// module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition>} styles
// @param {Object.<String,String>} titles
//
// @returns {Array.<module:image/imagestyle~ImageStyleOptionDefinition|module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition>}
function translateStyles( styles, titles ) {
	for ( const style of styles ) {
		// Localize the titles of the styles, if a title corresponds with
		// a localized default provided by the plugin.
		if ( titles[ style.title ] ) {
			style.title = titles[ style.title ];
		}
	}

	return styles;
}

// Returns the image style component name with the "imageStyle:" prefix.
//
// @param {String} name
// @returns {String}
function getUIComponentName( name ) {
	return `imageStyle:${ name }`;
}

// Returns title for the splitbutton containing the dropdown title and default action item title.
//
// @param {String|undefined} dropdownTitle
// @param {String} buttonTitle
// @returns {String}
function getDropdownButtonTitle( dropdownTitle, buttonTitle ) {
	return ( dropdownTitle ? dropdownTitle + ': ' : '' ) + buttonTitle;
}

/**
 * # **The image style custom drop-down definition descriptor**
 *
 * This definition can be implemented in the {@link module:image/image~ImageConfig#toolbar image toolbar configuration}
 * to define a completely custom drop-down in the image toolbar.
 *
 *		ClassicEditor.create( editorElement, {
 *			image: { toolbar: [
 *	 			// One of the predefined drop-downs
 *	 			'imageStyle:wrapText',
 *				// Custom drop-down
 *				{
 *					name: 'imageStyle:customDropdown',
 *					title: Custom drop-down title,
 *					items: [ 'imageStyle:alignLeft', 'imageStyle:alignRight' ],
 *					defaultItem: 'imageStyle:alignLeft'
 *				}
 *			] }
 *		} );
 *
 * **Note:** At the moment it is possible to populate the custom drop-down with only the buttons registered by the `ImageStyle` plugin.
 *
 * The defined drop-down will be registered
 * as the {@link module:ui/dropdown/dropdownview~DropdownView}
 * with the {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} under the provided name in the
 * {@link module:ui/componentfactory~ComponentFactory}
 *
 * @property {String} name The unique name of the drop-down. It is recommended to precede it with the "imageStyle:" prefix
 * to avoid collision with the components' names registered by other plugins.
 *
 * @property {String} [title] The drop-down's title. It will be used as the split button label along with the title of the default item
 * in the following manner: "Custom drop-down title: Default item title".
 *
 * Setting `title` to one of
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * @property {Array.<String>} items The list of the names of the buttons that will be placed in the drop-down's toolbar.
 * Each of the buttons has to be one of the {@link module:image/image~ImageConfig#styles default image style buttons}
 * or to be defined as the {@link module:image/imagestyle~ImageStyleOptionDefinition image styling option}.
 *
 * @property {String} defaultItem The name of one of the buttons from the items list,
 * which will be used as a default button for the drop-down's split button.
 *
 * @typedef {Object} module:image/imagestyle/imagestyleui~ImageStyleDropdownDefinition
 */
