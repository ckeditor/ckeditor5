/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import {
	modelElementToViewContainerElement,
	viewToModelElement
} from '@ckeditor/ckeditor5-engine/src/conversion/configurationdefinedconverters';

import HeadingCommand from './headingcommand';

const defaultModelElement = 'paragraph';

/**
 * The headings engine feature. It handles switching between block formats &ndash; headings and paragraph.
 * This class represents the engine part of the heading feature. See also {@link module:heading/heading~Heading}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'heading', {
			options: [
				{
					model: 'paragraph',
					title: 'Paragraph',
					class: 'ck-heading_paragraph'
				},
				{
					model: 'heading1',
					title: 'Heading 1',
					class: 'ck-heading_heading1',
					view: {
						name: 'h2'
					}
				},
				{
					model: 'heading2',
					title: 'Heading 2',
					view: {
						name: 'h3'
					},
					class: 'ck-heading_heading2'
				},
				{
					model: 'heading3',
					title: 'Heading 3',
					class: 'ck-heading_heading3',
					view: {
						name: 'h4'
					}
				}
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
		const data = editor.data;
		const editing = editor.editing;
		const options = editor.config.get( 'heading.options' );

		for ( const option of options ) {
			// Skip paragraph - it is defined in required Paragraph feature.
			if ( option.model !== defaultModelElement ) {
				// Schema.
				editor.document.schema.registerItem( option.model, '$block' );

				// Build converter from model to view for data and editing pipelines.
				modelElementToViewContainerElement( option, [ data.modelToView, editing.modelToView ] );

				// Build converter from view to model for data pipeline.
				viewToModelElement( option, [ data.viewToModel ] );

				// Register the heading command for this option.
				editor.commands.add( option.model, new HeadingCommand( editor, option.model ) );
			}
		}
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
				const positionParent = editor.document.selection.getFirstPosition().parent;
				const batch = data.batch;
				const isHeading = options.some( option => positionParent.is( option.model ) );

				if ( isHeading && !positionParent.is( defaultModelElement ) && positionParent.childCount === 0 ) {
					batch.rename( positionParent, defaultModelElement );
				}
			} );
		}
	}
}
