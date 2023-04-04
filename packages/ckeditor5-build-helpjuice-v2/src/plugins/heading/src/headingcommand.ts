/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/headingcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

import type { Element, Schema } from 'ckeditor5/src/engine';

/**
 * The heading command. It is used by the {@link module:heading/heading~Heading heading feature} to apply headings.
 */
export default class HeadingCommand extends Command {
	/**
	 * If the selection starts in a heading (which {@link #modelElements is supported by this command})
	 * the value is set to the name of that heading model element.
	 * It is  set to `false` otherwise.
	 *
	 * @observable
	 * @readonly
	 */
	declare public value: false | string;

	/**
	 * Set of defined model's elements names that this command support.
	 * See {@link module:heading/headingconfig~HeadingOption}.
	 */
	public readonly modelElements: Array<string>;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor Editor instance.
	 * @param modelElements Names of the element which this command can apply in the model.
	 */
	constructor( editor: Editor, modelElements: Array<string> ) {
		super( editor );

		this.modelElements = modelElements;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const block = first( this.editor.model.document.selection.getSelectedBlocks() );

		this.value = !!block && this.modelElements.includes( block.name ) && block.name;
		this.isEnabled = !!block && this.modelElements.some( heading => checkCanBecomeHeading( block, heading, this.editor.model.schema ) );
	}

	/**
	 * Executes the command. Applies the heading to the selected blocks or, if the first selected
	 * block is a heading already, turns selected headings (of this level only) to paragraphs.
	 *
	 * @param options.value Name of the element which this command will apply in the model.
	 * @fires execute
	 */
	public override execute( options: { value: string } ): void {
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

/**
 * Checks whether the given block can be replaced by a specific heading.
 *
 * @param block A block to be tested.
 * @param heading Command element name in the model.
 * @param schema The schema of the document.
 */
function checkCanBecomeHeading( block: Element, heading: string, schema: Schema ) {
	return schema.checkChild( block.parent as Element, heading ) && !schema.isObject( block );
}
