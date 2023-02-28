/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module heading/headingediting
 */

import { Plugin, type Editor, type PluginDependencies } from 'ckeditor5/src/core';
import { Paragraph } from 'ckeditor5/src/paragraph';
import { priorities } from 'ckeditor5/src/utils';
import type { HeadingOption } from './headingconfig';

import HeadingCommand from './headingcommand';

const defaultModelElement = 'paragraph';

/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 * It introduces `heading1`-`headingN` commands which allow to convert paragraphs into headings.
 */
export default class HeadingEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'HeadingEditing' {
		return 'HeadingEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
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
	public static get requires(): PluginDependencies {
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const options: Array<HeadingOption> = editor.config.get( 'heading.options' )!;

		const modelElements = [];

		for ( const option of options ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( option.model === 'paragraph' ) {
				continue;
			}

			// Schema.
			editor.model.schema.register( option.model, {
				inheritAllFrom: '$block'
			} );

			editor.conversion.elementToElement( option );

			modelElements.push( option.model );
		}

		this._addDefaultH1Conversion( editor );

		// Register the heading command for this option.
		editor.commands.add( 'heading', new HeadingCommand( editor, modelElements ) );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		// If the enter command is added to the editor, alter its behavior.
		// Enter at the end of a heading element should create a paragraph.
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' );
		const options: Array<HeadingOption> = editor.config.get( 'heading.options' )!;

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, data ) => {
				const positionParent = editor.model.document.selection.getFirstPosition()!.parent;
				const isHeading = options.some( option => positionParent.is( 'element', option.model ) );

				if ( isHeading && !positionParent.is( 'element', defaultModelElement ) && positionParent.childCount === 0 ) {
					data.writer.rename( positionParent, defaultModelElement );
				}
			} );
		}
	}

	/**
	 * Adds default conversion for `h1` -> `heading1` with a low priority.
	 *
	 * @param editor Editor instance on which to add the `h1` conversion.
	 */
	private _addDefaultH1Conversion( editor: Editor ) {
		editor.conversion.for( 'upcast' ).elementToElement( {
			model: 'heading1',
			view: 'h1',
			// With a `low` priority, `paragraph` plugin autoparagraphing mechanism is executed. Make sure
			// this listener is called before it. If not, `h1` will be transformed into a paragraph.
			converterPriority: priorities.get( 'low' ) + 1
		} );
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ HeadingEditing.pluginName ]: HeadingEditing;
	}
}
