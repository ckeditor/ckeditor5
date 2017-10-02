/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/heading
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEngine from './headingengine';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import createListDropdown from '@ckeditor/ckeditor5-ui/src/dropdown/list/createlistdropdown';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Template from '@ckeditor/ckeditor5-ui/src/template';

import '../theme/theme.scss';

/**
 * The headings feature. It introduces the `headings` drop-down and the `heading1`-`headingN` commands which allow
 * to convert paragraphs into headings.
 *
 * For a detailed overview, check the {@glink features/headings Headings feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Heading extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph, HeadingEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Heading';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dropdownItems = new Collection();
		const options = this._getLocalizedOptions();
		const commands = [];
		const t = editor.t;
		const defaultTitle = t( 'Choose heading' );
		const dropdownTooltip = t( 'Heading' );

		for ( const option of options ) {
			const command = editor.commands.get( option.modelElement );
			const itemModel = new Model( {
				commandName: option.modelElement,
				label: option.title,
				class: option.class
			} );

			itemModel.bind( 'isActive' ).to( command, 'value' );

			// Add the option to the collection.
			dropdownItems.add( itemModel );

			commands.push( command );
		}

		// Create dropdown model.
		const dropdownModel = new Model( {
			withText: true,
			items: dropdownItems,
			tooltip: dropdownTooltip
		} );

		dropdownModel.bind( 'isEnabled' ).to(
			// Bind to #isEnabled of each command...
			...getCommandsBindingTargets( commands, 'isEnabled' ),
			// ...and set it true if any command #isEnabled is true.
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		dropdownModel.bind( 'label' ).to(
			// Bind to #value of each command...
			...getCommandsBindingTargets( commands, 'value' ),
			// ...and chose the title of the first one which #value is true.
			( ...areActive ) => {
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display default title.
				return options[ index ] ? options[ index ].title : defaultTitle;
			}
		);

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', locale => {
			const dropdown = createListDropdown( dropdownModel, locale );

			Template.extend( dropdown.template, {
				attributes: {
					class: [
						'ck-heading-dropdown'
					]
				}
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdown, 'execute', evt => {
				editor.execute( evt.source.commandName );
				editor.editing.view.focus();
			} );

			return dropdown;
		} );
	}

	/**
	 * Returns heading options as defined in `config.heading.options` but processed to consider
	 * editor localization, i.e. to display {@link module:heading/heading~HeadingOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:heading/heading~HeadingOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;
		const localizedTitles = {
			Paragraph: t( 'Paragraph' ),
			'Heading 1': t( 'Heading 1' ),
			'Heading 2': t( 'Heading 2' ),
			'Heading 3': t( 'Heading 3' )
		};

		return editor.config.get( 'heading.options' ).map( option => {
			const title = localizedTitles[ option.title ];

			if ( title && title != option.title ) {
				// Clone the option to avoid altering the original `config.heading.options`.
				option = Object.assign( {}, option, { title } );
			}

			return option;
		} );
	}
}

// Returns an array of binding components for
// {@link module:utils/observablemixin~Observable#bind} from a set of iterable
// commands.
//
// @private
// @param {Iterable.<module:core/command~Command>} commands
// @param {String} attribute
// @returns {Array.<String>}
function getCommandsBindingTargets( commands, attribute ) {
	return Array.prototype.concat( ...commands.map( c => [ c, attribute ] ) );
}

/**
 * Heading option descriptor.
 *
 * @typedef {Object} module:heading/heading~HeadingOption
 * @property {String} modelElement Element's name in the model.
 * @property {String} viewElement The name of the view element that will be used to represent the model element in the view.
 * @property {String} title The user-readable title of the option.
 * @property {String} class The class which will be added to the dropdown item representing this option.
 */

/**
 * The configuration of the heading feature. Introduced by the {@link module:heading/headingengine~HeadingEngine} feature.
 *
 * Read more in {@link module:heading/heading~HeadingConfig}.
 *
 * @member {module:heading/heading~HeadingConfig} module:core/editor/editorconfig~EditorConfig#heading
 */

/**
 * The configuration of the heading feature.
 * The option is used by the {@link module:heading/headingengine~HeadingEngine} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				heading: ... // Heading feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HeadingConfig
 */

/**
 * The available heading options.
 *
 * The default value is:
 *
 *		const headingConfig = {
 *			options: [
 *				{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *				{ modelElement: 'heading1', viewElement: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *				{ modelElement: 'heading2', viewElement: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *				{ modelElement: 'heading3', viewElement: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *			]
 *		};
 *
 * It defines 3 levels of headings. In the editor model they will use `heading1`, `heading2`, and `heading3` elements.
 * Their respective view elements (so the elements output by the editor) will be: `h2`, `h3`, and `h4`. This means that
 * if you choose "Heading 1" in the headings dropdown the editor will turn the current block to `<heading1>` in the model
 * which will result in rendering (and outputting to data) the `<h2>` element.
 *
 * The `title` and `class` properties will be used by the `headings` dropdown to render available options.
 * Usually, the first option in the headings dropdown is the "Paragraph" option, hence it's also defined on the list.
 * However, you don't need to define its view representation because it's handled by
 * the {@link module:paragraph/paragraph~Paragraph} feature (which is required by
 * the {@link module:heading/headingengine~HeadingEngine} feature).
 *
 * Note: In the model you should always start from `heading1`, regardless of how the headings are represented in the view.
 * That's assumption is used by features like {@link module:autoformat/autoformat~Autoformat} to know which element
 * they should use when applying the first level heading.
 *
 * The defined headings are also available in {@link module:core/commandcollection~CommandCollection} under their model names.
 * For example, the below code will apply `<heading1>` to the current selection:
 *
 *		editor.execute( 'heading1' );
 *
 * @member {Array.<module:heading/heading~HeadingOption>} module:heading/heading~HeadingConfig#options
 */
