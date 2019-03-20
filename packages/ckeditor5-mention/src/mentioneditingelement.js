/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';

class MentionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		// @todo implement refresh
		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @protected
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.marker='@'] The mention marker.
	 * @param {String} options.mention.
	 * @param {String} [options.range].
	 * @fires execute
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const item = options.mention;
		const range = options.range || selection.getFirstRange();

		const name = item.name || item;

		model.change( writer => {
			writer.remove( range );

			const mention = writer.createElement( 'mentionElement', { name, item } );

			model.insertContent( mention );
			writer.insertText( ' ', model.document.selection.focus );
		} );
	}
}

/**
 * The mention editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MentionElementEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MentionElementEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.model.schema.register( 'mentionElement', {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowAttributes: [ 'name', 'item' ]
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'mentionElement',
			view: ( modelItem, viewWriter ) => {
				const mentionElement = viewWriter.createContainerElement( 'span', { class: 'mention' } );

				const viewText = viewWriter.createText( modelItem.getAttribute( 'name' ) );

				viewWriter.insert( viewWriter.createPositionAt( mentionElement, 0 ), viewText );

				return mentionElement;
			}
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			view: 'mentionElement',
			model: ( viewElement, modelWriter ) => {
				let name = 'general';

				if ( viewElement.childCount ) {
					const text = viewElement.getChild( 0 );

					if ( text.is( 'text' ) ) {
						name = text;
					}
				}

				return modelWriter.createElement( 'mentionElement', { name } );
			}
		} );

		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( editor.model, viewElement => viewElement.name == 'mentionElement' )
		);

		editor.commands.add( 'mention', new MentionCommand( editor ) );
	}
}
