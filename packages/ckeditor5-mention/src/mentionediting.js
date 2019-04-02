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

		doc.registerPostFixer( writer => removePartialMentionPostFixer( writer, doc, model.schema ) );
		doc.registerPostFixer( writer => extendAttributeOnMentionPostFixer( writer, doc ) );
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
function removePartialMentionPostFixer( writer, doc, schema ) {
	const changes = doc.differ.getChanges();

	let wasChanged = false;

	for ( const change of changes ) {
		// Check text node on current position;
		const position = change.position;

		if ( change.name == '$text' ) {
			const nodeAfterInsertedTextNode = position.textNode && position.textNode.nextSibling;

			// Check textNode where the change occurred.
			wasChanged = checkAndFix( position.textNode, writer ) || wasChanged;

			// Occurs on paste occurs inside a text node with mention.
			wasChanged = checkAndFix( nodeAfterInsertedTextNode, writer ) || wasChanged;
			wasChanged = checkAndFix( position.nodeBefore, writer ) || wasChanged;
			wasChanged = checkAndFix( position.nodeAfter, writer ) || wasChanged;
		}

		// Check text nodes in inserted elements (might occur when splitting paragraph or pasting content inside text with mention).
		if ( change.name != '$text' && change.type == 'insert' && schema.checkChild( change.name, '$text' ) ) {
			const insertedNode = position.nodeAfter;

			for ( const child of insertedNode.getChildren() ) {
				wasChanged = checkAndFix( child, writer ) || wasChanged;
			}
		}

		// Inserted inline elements might break mention.
		if ( change.type == 'insert' && schema.isInline( change.name ) ) {
			const nodeAfterInserted = position.nodeAfter && position.nodeAfter.nextSibling;

			wasChanged = checkAndFix( position.nodeBefore, writer ) || wasChanged;
			wasChanged = checkAndFix( nodeAfterInserted, writer ) || wasChanged;
		}
	}

	return wasChanged;
}

// This post-fixer will extend attribute applied on part of a mention so a whole text node of a mention will have added attribute.
//
// @param {module:engine/model/writer~Writer} writer
// @param {module:engine/model/document~Document} doc
// @returns {Boolean} Returns true if selection was fixed.
function extendAttributeOnMentionPostFixer( writer, doc ) {
	const changes = doc.differ.getChanges();

	let wasChanged = false;

	for ( const change of changes ) {
		if ( change.type === 'attribute' && change.attributeKey != 'mention' ) {
			// Check all mentions in changed range - attribute change may span over multiple text node.
			for ( const textNode of getBrokenMentionsFromRange( change.range ) ) {
				if ( textNode.getAttribute( change.attributeKey ) !== change.attributeNewValue ) {
					writer.setAttribute( change.attributeKey, change.attributeNewValue, textNode );
					wasChanged = true;
				}
			}
		}
	}

	return wasChanged;
}

// Checks if node has correct mention attribute if present.
// Returns true if node is text and has a mention attribute which text does not match expected mention text.
//
// @param {module:engine/model/node~Node} node a node to check
// @returns {Boolean}
function isBrokenMentionNode( node ) {
	if ( !node || !( node.is( 'text' ) || node.is( 'textProxy' ) ) || !node.hasAttribute( 'mention' ) ) {
		return false;
	}

	const text = node.data;
	const mention = node.getAttribute( 'mention' );

	const expectedText = mention._marker + mention.name;

	return text != expectedText;
}

// Yields all text nodes with broken mentions from a range - even if mention sticks out of the range boundary.
//
// @param {module:engine/range~Range} range
function* getBrokenMentionsFromRange( range ) {
	// Check node at the left side of a range.
	if ( isBrokenMentionNode( range.start.nodeBefore ) ) {
		yield range.start.nodeBefore;
	}

	// Yield text nodes with broken mention from the range.
	for ( const textProxy of range.getItems() ) {
		if ( isBrokenMentionNode( textProxy ) ) {
			yield textProxy.textNode;
		}
	}

	// Check node at the right side of a range.
	if ( isBrokenMentionNode( range.end.nodeAfter ) ) {
		yield range.end.nodeAfter;
	}
}

// Fixes mention on text node it needs a fix.
//
// @param {module:engine/model/text~Text} textNode
// @param {module:engine/model/writer~Writer} writer
// @returns {Boolean}
function checkAndFix( textNode, writer ) {
	if ( isBrokenMentionNode( textNode ) ) {
		writer.removeAttribute( 'mention', textNode );

		return true;
	}

	return false;
}
