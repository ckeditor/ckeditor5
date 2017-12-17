/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import { eventNameToConsumableType } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';

import AlignmentCommand, { commandNameFromStyle } from './alignmentcommand';

/**
 * @extends module:core/plugin~Plugin
 */
export default class AlignmentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'alignment', { styles: [ ...this.constructor.supportedStyles ] } );
	}

	/**
	 * List of supported alignment styles:
	 *
	 * - left
	 * - right
	 * - center
	 * - justify
	 *
	 * @static
	 * @readonly
	 * @member {Array.<String>} module:alignment/alignmentediting~AlignmentEditing.supportedStyles
	 */
	static get supportedStyles() {
		return [ 'left', 'right', 'center', 'justify' ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;

		const enabledStyles = editor.config.get( 'alignment.styles' );

		// Allow alignment attribute on all blocks.
		schema.allow( { name: '$block', attributes: 'alignment' } );

		data.modelToView.on( 'attribute:alignment', convertStyle() );
		editing.modelToView.on( 'attribute:alignment', convertStyle() );

		// Convert `text-align` style property from element to model attribute alignment.
		buildViewConverter()
			.for( data.viewToModel )
			.fromAttribute( 'style', /text-align/ )
			.toAttribute( viewElement => {
				const textAlign = viewElement.getStyle( 'text-align' );

				// Do not convert empty, default or unknown alignment values.
				if ( !textAlign || isDefault( textAlign ) || !enabledStyles.includes( textAlign ) ) {
					return;
				}

				return { key: 'alignment', value: textAlign };
			} );

		// Add only enabled & supported commands.
		enabledStyles
			.filter( isSupported )
			.forEach( style => {
				editor.commands.add( commandNameFromStyle( style ), new AlignmentCommand( editor, style, isDefault( style ) ) );
			} );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const schema = this.editor.model.schema;

		// Disallow alignment on caption elements.
		if ( schema.hasItem( 'caption' ) ) {
			schema.disallow( { name: 'caption', attributes: 'alignment' } );
		}
	}
}

/**
 * Checks whether passed style is supported by {@link module:alignment/alignmentediting~AlignmentEditing}.
 *
 * @param {String} style Style value to check.
 * @returns {Boolean}
 */
export function isSupported( style ) {
	return AlignmentEditing.supportedStyles.includes( style );
}

// Dispatcher handler responsible for setting style to a view element.
// @private
function convertStyle() {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, eventNameToConsumableType( evt.name ) ) ) {
			return;
		}

		if ( data.attributeNewValue ) { // Set style.
			conversionApi.mapper.toViewElement( data.item ).setStyle( { 'text-align': data.attributeNewValue } );
		} else { // Remove style.
			conversionApi.mapper.toViewElement( data.item ).removeStyle( 'text-align' );
		}
	};
}

// Check whether alignment is default one.
// @private
function isDefault( textAlign ) {
	// Right now only RTL is supported so 'left' value is always default one.
	return textAlign === 'left';
}

/**
 * The configuration of the {@link module:alignment/alignmentediting~AlignmentEditing Alignment feature}.
 *
 * Read more in {@link module:alignment/alignmentediting~AlignmentEditingConfig}.
 *
 * @member {module:alignment/alignmentediting~AlignmentEditingConfig} module:core/editor/editorconfig~EditorConfig#alignment
 */

/**
 * The configuration of the {@link module:alignment/alignmentediting~AlignmentEditing Alignment feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				alignment: {
 *					styles: [ 'left', 'right' ]
 * 				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface AlignmentEditingConfig
 */

/**
 * Enabled alignment styles from supported styles: `left`, `right`, `center` and `justify`. Other values are ignored.
 *
 * @member {String} module:alignment/alignmentediting~AlignmentEditingConfig#styles
 */
