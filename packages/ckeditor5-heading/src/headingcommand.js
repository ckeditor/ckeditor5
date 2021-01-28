/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/headingcommand
 */

import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

/**
 * The heading command. It is used by the {@link module:heading/heading~Heading heading feature} to apply headings.
 *
 * @extends module:core/command~Command
 */
export default class HeadingCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Array.<String>} modelElements Names of the element which this command can apply in the model.
	 */
	constructor( editor, modelElements ) {
		super( editor );

		/**
		 * If the selection starts in a heading (which {@link #modelElements is supported by this command})
		 * the value is set to the name of that heading model element.
		 * It is  set to `false` otherwise.
		 *
		 * @observable
		 * @readonly
		 * @member {Boolean|String} #value
		 */

		/**
		 * Set of defined model's elements names that this command support.
		 * See {@link module:heading/heading~HeadingOption}.
		 *
		 * @readonly
		 * @member {Array.<String>}
		 */
		this.modelElements = modelElements;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const block = first( this.editor.model.document.selection.getSelectedBlocks() );

		this.value = !!block && this.modelElements.includes( block.name ) && block.name;
		this.isEnabled = !!block && this.modelElements.some( heading => checkCanBecomeHeading( block, heading, this.editor.model.schema ) );
	}

	/**
	 * Executes the command. Applies the heading to the selected blocks or, if the first selected
	 * block is a heading already, turns selected headings (of this level only) to paragraphs.
	 *
	 * @param {Object} options
	 * @param {String} options.value Name of the element which this command will apply in the model.
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;
		const document = model.document;

		const modelElement = options.value;

		model.change( writer => {
			const blocks = Array.from( document.selection.getSelectedBlocks() )
				.filter( block => {
					return checkCanBecomeHeading( block, modelElement, model.schema );
				} );

			for ( const block of blocks ) {
				if ( !block.is( 'element', modelElement ) ) {
					writer.rename( block, modelElement );
				}
			}
		} );
	}
}

// Checks whether the given block can be replaced by a specific heading.
//
// @private
// @param {module:engine/model/element~Element} block A block to be tested.
// @param {module:heading/headingcommand~HeadingCommand#modelElement} heading Command element name in the model.
// @param {module:engine/model/schema~Schema} schema The schema of the document.
// @returns {Boolean}
function checkCanBecomeHeading( block, heading, schema ) {
	return schema.checkChild( block.parent, heading ) && !schema.isObject( block );
}
