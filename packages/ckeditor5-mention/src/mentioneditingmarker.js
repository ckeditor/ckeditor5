/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';

export function createMentionMarkerId( someString ) {
	return 'mention:' + someString.toLowerCase().replace( ' ', '-' ) + parseInt( Math.random() * 10000 );
}

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

		const label = item.label || item;

		model.change( writer => {
			writer.remove( range );

			const text = writer.createText( '@' + label );

			writer.insert( text, selection.focus );

			// TODO dumb
			const name = createMentionMarkerId( label );

			writer.addMarker( name, {
				range: writer.createRange( selection.focus.getShiftedBy( -text.data.length ), selection.focus ),
				usingOperation: true,
				affectData: true
			} );
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

		// Allow comment on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: [ 'mention' ] } );

		// Allow comment on all objects.
		editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
			if ( attributeName == 'mention' && editor.model.schema.isObject( context.last ) ) {
				return true;
			}
		} );

		// Convert marker m->v for editing pipeline.
		editor.conversion.for( 'downcast' ).markerToHighlight( {
			model: 'mention',
			view: data => {
				const { id } = splitMarkerName( data.markerName );

				return {
					classes: [ 'mention' ],
					attributes: {
						'data-mention': id
					}
				};
			}
		} );

		// Convert marker v->m.
		editor.conversion.for( 'upcast' ).elementToMarker( {
			view: {
				name: 'mention',
				attribute: {
					id: /^\w/
				}
			},
			model: viewElement => 'mention:' + viewElement.getAttribute( 'id' )
		} );

		editor.commands.add( 'mention', new MentionCommand( editor ) );
	}
}

function splitMarkerName( name ) {
	const path = name.split( ':' );

	return { group: path[ 0 ], id: path[ 1 ] };
}
