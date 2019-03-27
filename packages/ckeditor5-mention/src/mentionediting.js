/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mentionediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

import MentionCommand from './mentioncommand';

import '../theme/mentionediting.css';

/**
 * The mention editing feature.
 *
 * It introduces the {@link module:mention/mentioncommand~MentionCommand command} and the `mention`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span class="mention" data-mention="name">`.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MentionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MentionEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const model = editor.model;
		const doc = model.document;

		// Allow mention attribute on all text nodes.
		model.schema.extend( '$text', { allowAttributes: 'mention' } );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				key: 'data-mention',
				classes: 'mention'
			},
			model: {
				key: 'mention',
				value: parseMentionViewItemAttributes
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: 'mention',
			view: createViewMentionElement
		} );

		doc.registerPostFixer( writer => removePartialMentionPostFixer( writer, doc ) );
		doc.registerPostFixer( writer => selectionMentionAttributePostFixer( writer, doc ) );

		editor.commands.add( 'mention', new MentionCommand( editor ) );
	}
}

// Parses matched view element to mention attribute value.
//
// @param {module:engine/view/element} viewElement
// @returns {Object} Mention attribute value
function parseMentionViewItemAttributes( viewElement ) {
	const dataMention = viewElement.getAttribute( 'data-mention' );

	const textNode = viewElement.getChild( 0 );

	// Do not parse empty mentions.
	if ( !textNode || !textNode.is( 'text' ) ) {
		return;
	}

	const mentionString = textNode.data;

	// Assume that mention is set as marker + mention name.
	const marker = mentionString.slice( 0, 1 );
	const name = mentionString.slice( 1 );

	// Do not upcast partial mentions - might come from copy-paste of partially selected mention.
	if ( name != dataMention ) {
		return;
	}

	// Set UID for mention to not merge mentions in the same block that are next to each other.
	return { name: dataMention, _marker: marker, _id: uid() };
}

// Creates mention element from mention data.
//
// @param {Object} mention
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {module:engine/view/attributeelement~AttributeElement}
function createViewMentionElement( mention, viewWriter ) {
	if ( !mention ) {
		return;
	}

	const attributes = {
		class: 'mention',
		'data-mention': mention.name
	};

	const options = {
		id: mention._id
	};

	return viewWriter.createAttributeElement( 'span', attributes, options );
}

// Model post-fixer that disallows typing with selection when selection is placed after the text node with mention attribute.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/document~Document} doc
// @returns {Boolean} Returns true if selection was fixed.
function selectionMentionAttributePostFixer( writer, doc ) {
	const selection = doc.selection;
	const focus = selection.focus;

	if ( selection.isCollapsed && selection.hasAttribute( 'mention' ) && isNodeBeforeAText( focus ) ) {
		writer.removeSelectionAttribute( 'mention' );

		return true;
	}

	function isNodeBeforeAText( position ) {
		return position.nodeBefore && position.nodeBefore.is( 'text' );
	}
}

// Model post-fixer that removes mention attribute from modified text node.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/document~Document} doc
// @returns {Boolean} Returns true if selection was fixed.
function removePartialMentionPostFixer( writer, doc ) {
	const changes = doc.differ.getChanges();

	let wasChanged = false;

	for ( const change of changes ) {
		// Check if user edited part of a mention.
		if ( change.type == 'insert' || change.type == 'remove' ) {
			const textNode = change.position.textNode;

			if ( change.name == '$text' && textNode && textNode.hasAttribute( 'mention' ) ) {
				writer.removeAttribute( 'mention', textNode );
				wasChanged = true;
			}
		}

		// Additional check for deleting last character of a text node.
		if ( change.type == 'remove' ) {
			const nodeBefore = change.position.nodeBefore;

			if ( nodeBefore && nodeBefore.hasAttribute( 'mention' ) ) {
				const text = nodeBefore.data;
				const mention = nodeBefore.getAttribute( 'mention' );

				const expectedText = mention._marker + mention.name;

				if ( text != expectedText ) {
					writer.removeAttribute( 'mention', nodeBefore );
					wasChanged = true;
				}
			}
		}
	}

	return wasChanged;
}
