/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingCommand from './headingcommand';

import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

const defaultModelElement = 'paragraph';

/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 * It introduces `heading1`-`headingN` commands which allow to convert paragraphs into headings.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'heading', {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
				{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const options = editor.config.get( 'heading.options' );

		const modelElements = [];

		for ( const option of options ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( option.model !== defaultModelElement ) {
				// Schema.
				editor.model.schema.register( option.model, {
					inheritAllFrom: '$block'
				} );

				editor.conversion.elementToElement( option );

				modelElements.push( option.model );
			}
		}

		this._addDefaultH1Conversion( editor, options );

		// Register the heading command for this option.
		editor.commands.add( 'heading', new HeadingCommand( editor, modelElements ) );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		// If the enter command is added to the editor, alter its behavior.
		// Enter at the end of a heading element should create a paragraph.
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' );
		const options = editor.config.get( 'heading.options' );

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, data ) => {
				const positionParent = editor.model.document.selection.getFirstPosition().parent;
				const isHeading = options.some( option => positionParent.is( option.model ) );

				if ( isHeading && !positionParent.is( defaultModelElement ) && positionParent.childCount === 0 ) {
					data.writer.rename( positionParent, defaultModelElement );
				}
			} );
		}
	}

	/**
	 * Adds default conversion for `h1` -> `heading1` with a low priority.
	 *
	 * The default conversion will be added only if `heading.options` configuration with `h2` -> `heading1`
	 * conversion is defined and there are no other conversion definitions for `h1` provided.
	 *
	 * @private
	 * @param {module:core/editor/editor~Editor} editor Editor instance on which to add the `h1` conversion.
	 * @param {Array.<module:engine/conversion/conversion~ConverterDefinition} definitions List of already used conversion
	 * definitions. The added default `h1` conversion is based on this list.
	 */
	_addDefaultH1Conversion( editor, definitions ) {
		// Do not add default conversions if conversion for `<h1>` is already defined.
		if ( definitions.find( option => option.view === 'h1' ) ) {
			return;
		}

		// Add `h1` -> `heading1` conversion with a low priority. This means if no other conversions were provided,
		// `h1` will be handled here. Proceed only if `h2` -> `heading1` conversion was configured.
		const heading1 = definitions.find( option => option.model === 'heading1' && option.view === 'h2' );
		if ( heading1 ) {
			const optionH1 = Object.assign( {}, heading1 );

			optionH1.view = 'h1';
			// With a `low` priority, `paragraph` plugin autoparagraphing mechanism is executed. Make sure
			// this listener is called before it. If not, `h1` will be transformed into a paragraph.
			optionH1.converterPriority = priorities.get( 'low' ) + 1;

			editor.conversion.elementToElement( optionH1 );
		}
	}
}
