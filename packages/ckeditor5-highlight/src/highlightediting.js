/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module highlight/highlightediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';

import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';

import HighlightCommand from './highlightcommand';
import RemoveHighlightCommand from './removehighlightcommand';

/**
 * The highlight editing feature. It introduces `highlight` command which allow to highlight selected text with defined 'marker' or 'pen'.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HighlightEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'highlight', [
			{ name: 'marker', class: 'marker', title: 'Marker', color: '#ffff66', type: 'marker' },
			{ name: 'greenMarker', class: 'marker-green', title: 'Green Marker', color: '#66ff00', type: 'marker' },
			{ name: 'pinkMarker', class: 'marker-pink', title: 'Pink Marker', color: '#ff6fff', type: 'marker' },
			{ name: 'redPen', class: 'pen-red', title: 'Red Pen', color: '#ff0000', type: 'pen' },
			{ name: 'bluePen', class: 'pen-blue', title: 'Blue Pen', color: '#0000ff', type: 'pen' }
		] );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow highlight attribute on all elements
		editor.document.schema.allow( { name: '$inline', attributes: 'highlight', inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.document.schema.allow( { name: '$inline', attributes: 'highlight', inside: '$clipboardHolder' } );

		// Convert highlight attribute to a mark element with associated class.
		buildModelConverter()
			.for( data.modelToView, editing.modelToView )
			.fromAttribute( 'highlight' )
			.toElement( data => new AttributeElement( 'mark', { class: data } ) );

		const configuredClasses = editor.config.get( 'highlight' ).map( config => config.class );

		// Convert `mark` attribute with class name to model's highlight attribute.
		buildViewConverter()
			.for( data.viewToModel )
			.fromElement( 'mark' )
			.toAttribute( viewElement => {
				for ( const className of viewElement.getClassNames() ) {
					if ( configuredClasses.indexOf( className ) > -1 ) {
						return { key: 'highlight', value: className };
					}
				}
			} );

		editor.config
			.get( 'highlight' )
			.map( highlighter => editor.commands.add( highlighter.name, new HighlightCommand( editor, highlighter.class ) ) );

		editor.commands.add( 'removeHighlight', new RemoveHighlightCommand( editor ) );
	}
}

/**
 * Highlight option descriptor.
 *
 * @typedef {Object} module:highlight/highlightediting~HeadingOption
 * @property {String} class The class which is used to differentiate highlighters.
 * @property {String} title The user-readable title of the option.
 * @property {String} color Color used for highlighter. Should be coherent with CSS class definition.
 * @property {'marker'|'pen'} type The type of highlighter:
 * - "marker" - will use #color as background,
 * - "pen" - will use #color as font color.
 */

/**
 * The configuration of the {@link module:highlight/highlightediting~HighlightEditing Highlight feature}.
 *
 * Read more in {@link module:highlight/highlightediting~HighlightEditingConfig}.
 *
 * @member {module:highlight/highlightediting~HighlightEditingConfig} module:core/editor/editorconfig~EditorConfig#highlight
 */

/**
 * The configuration of the {@link module:highlight/highlightediting~HighlightEditing Highlight feature}.
 *
 *        ClassicEditor
 *            .create( editorElement, {
 * 				highlight:  ... // Highlight feature config.
 *			} )
 *            .then( ... )
 *            .catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HighlightEditingConfig
 */

/**
 * Available highlighters options.
 *
 * There are two types of highlighters:
 * - 'marker' - rendered as `<mark>` element with defined background color.
 * - 'pen' - rendered as `<mark>` element with defined foreground (font) color.
 *
 * Note: Each highlighter must have it's own CSS class defined to properly match content data. Also it is advised
 * that color value should match the values defined in content CSS stylesheet.
 *
 * @member {Array.<module:heading/heading~HeadingOption>} module:heading/heading~HeadingConfig#options
 */
