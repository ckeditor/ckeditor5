/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/definition-based-converters';

import FontFamilyCommand from './fontfamilycommand';

/**
 * The Font Family Editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamilyEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'fontFamily', {
			options: [
				'default',
				'Arial, Helvetica, sans-serif',
				'Courier New, Courier, monospace',
				'Georgia, serif',
				'Lucida Sans Unicode, Lucida Grande, sans-serif',
				'Tahoma, Geneva, sans-serif',
				'Times New Roman, Times, serif',
				'Trebuchet MS, Helvetica, sans-serif',
				'Verdana, Geneva, sans-serif'
			]
		} );
	}

	/**
	 * Returns {@link module:font/fontfamily/fontfamilyediting~FontFamilyConfig#options} array with options normalized in the
	 * {@link module:font/fontfamily/fontfamilyediting~FontFamilyOption} format, translated
	 * `title` for each style.
	 *
	 * @readonly
	 * @type {Array.<module:font/fontfamily/fontfamilyediting/imagestyleengine~ImageStyleFormat>}
	 */
	get configuredOptions() {
		// Cache value
		if ( this._cachedOptions ) {
			return this._cachedOptions;
		}

		const editor = this.editor;
		const t = editor.t;

		const options = [];
		const configuredOptions = editor.config.get( 'fontFamily.options' );

		for ( const item of configuredOptions ) {
			const itemDefinition = getItemDefinition( item );

			// Set only valid definitions.
			if ( itemDefinition ) {
				// Localize the "Default" title if set.
				if ( itemDefinition.title === 'Default' ) {
					itemDefinition.title = t( 'Default' );
				}

				options.push( itemDefinition );
			}
		}

		return ( this._cachedOptions = options );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow highlight attribute on all elements
		editor.model.schema.allow( { name: '$inline', attributes: 'fontFamily', inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.model.schema.allow( { name: '$inline', attributes: 'fontFamily', inside: '$clipboardHolder' } );

		// Get configured font family options without "default" option.
		const fontFamilyOptions = this.configuredOptions.filter( item => item.model );

		// Define view to model conversion.
		for ( const item of fontFamilyOptions ) {
			viewToModelAttribute( 'fontFamily', item, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'fontFamily', fontFamilyOptions, [ data.modelToView, editing.modelToView ] );

		editor.commands.add( 'fontFamily', new FontFamilyCommand( editor ) );
	}
}

// Returns item definition from preset
function getItemDefinition( item ) {
	// Probably it is full item definition so return it.
	if ( typeof item === 'object' ) {
		return item;
	}

	// Handle 'default' string as a special case. It will be used to remove the fontFamily attribute.
	if ( item === 'default' ) {
		return {
			title: 'Default',
			model: undefined
		};
	}

	// Ignore values that we cannot parse to a definition.
	if ( typeof item !== 'string' ) {
		return;
	}

	return generateFontPreset( item );
}

// Creates a predefined preset for pixel size. It deconstructs font-family like string into full configuration option.
// A font definition is passed as coma delimited set of font family names. Font names might be quoted.
//
// @param {String} A font definition form configuration.
function generateFontPreset( fontDefinition ) {
	// Remove quotes from font names - will be normalized later.
	const fontNames = fontDefinition.replace( /"|'/g, '' ).split( ',' );

	// The first matched font name will be used as dropdown list item title and as model value
	const firstFontName = fontNames[ 0 ];

	const cssFontNames = fontNames.map( normalizeFontName );

	// TODO: Maybe we can come with something better here?
	// TODO: Also document this behavior in engine as it uses matcher~Pattern not ViewElementDefinition.
	// TODO: Maybe a better solution will be a callback here? (also needs documentation)
	// This will match any quote type with whitespace.
	const quotesMatch = '("|\'|&qout;|\\W){0,2}';
	// Full regex will catch any style of quotation used in view.
	// Example:
	// from string: "Font Foo Foo, Font Bar"
	// it will create a regex that will match any quotation mix:
	//     - "Font Foo Foo", Font Bar
	//     - 'Font Foo Foo', "Font Bar"
	//     - ... etc.
	const regexString = `${ quotesMatch }${ fontNames.map( n => n.trim() ).join( `${ quotesMatch },${ quotesMatch }` ) }${ quotesMatch }`;

	return {
		title: firstFontName,
		model: firstFontName,
		view: {
			name: 'span',
			style: {
				'font-family': cssFontNames.join( ', ' )
			}
		},
		acceptsAlso: [
			{
				name: 'span',
				style: {
					'font-family': new RegExp( regexString )
				}
			}
		]
	};
}

// Normalizes font name for the view style attribute.
//
// @param {String} fontName
// @returns {String}
function normalizeFontName( fontName ) {
	fontName = fontName.trim();

	// Compound font names should be quoted.
	if ( fontName.indexOf( ' ' ) > 0 ) {
		fontName = `'${ fontName }'`;
	}

	return fontName;
}

/**
 * Font family option. Compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}.
 *
 * @typedef {Object} module:font/fontfamily/fontfamilyediting~FontFamilyOption
 *
 * @property {String} model The `fontFamily` attribute value in the model.
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view The view representation for that option.
 * @property {String} title The user-readable title of the option.
 * @property {String} [uiStyle] The style which will be added to the dropdown item representing this option.
 * Defaults to `view.style[ 'font-family' ]`.
 * @property {Array.<module:engine/view/viewelementdefinition~ViewElementDefinition>} acceptAlso An array with all matched elements that
 * view to model conversion should also accept.
 */

/**
 * The configuration of the font family feature.
 * Introduced by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 * Read more in {@link module:font/fontfamily/fontfamilyediting~FontFamilyConfig}.
 *
 * @member {module:font/fontfamily/fontfamilyediting~FontFamilyConfig} module:core/editor/editorconfig~EditorConfig#fontFamily
 */

/**
 * The configuration of the font family feature.
 * The option is used by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				fontFamily: ... // Font family feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontfamily/fontfamilyediting~FontFamilyConfig
 */

/**
 * Available font family options. Defined either as array of strings.
 *
 * The default value is
 *
 *		const fontFamilyConfig = {
 *			options: [
 *				'default',
 *				'Arial, Helvetica, sans-serif',
 *				'Courier New, Courier, monospace',
 *				'Georgia, serif',
 *				'Lucida Sans Unicode, Lucida Grande, sans-serif',
 *				'Tahoma, Geneva, sans-serif',
 *				'Times New Roman, Times, serif',
 *				'Trebuchet MS, Helvetica, sans-serif',
 *				'Verdana, Geneva, sans-serif'
 *			]
 *		};
 *
 * which configures 8 font family options and a default option that will remove font family to text default setting (defaulting to content
 * CSS styles).
 *
 * TODO: what 'default' does.
 * TODO: how those string are translated to configuration
 *
 * @member {Array.<String|module:font/fontfamily/fontfamilyediting~FontFamilyOption>}
 *  module:font/fontfamily/fontfamilyediting~FontFamilyConfig#options
 */
