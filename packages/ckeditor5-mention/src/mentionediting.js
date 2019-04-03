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
 * as a `<span class="mention" data-mention="@mention">`.
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
				value: _toMentionAttribute
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

export function _addMentionAttributes( baseMentionData, data ) {
	return Object.assign( { _uid: uid() }, baseMentionData, data || {} );
}

/**
 * Creates mention attribute value from provided view element and optional data.
 *
 * This function is exposed as
 * {@link module:mention/mention~Mention#toWidgetAttribute `editor.plugins.get( 'Mention' ).toWidgetAttribute()`}.
 *
 * @protected
 * @param {module:engine/view/element~Element} viewElementOrMention
 * @param {String|Object} [data] Mention data to be extended.
 * @return {module:mention/mention~MentionAttribute}
 */
export function _toMentionAttribute( viewElementOrMention, data ) {
	const dataMention = viewElementOrMention.getAttribute( 'data-mention' );

	const textNode = viewElementOrMention.getChild( 0 );

	// Do not convert empty mentions.
	if ( !textNode ) {
		return;
	}

	const baseMentionData = {
		id: dataMention,
		_text: textNode.data
	};

	return _addMentionAttributes( baseMentionData, data );
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
		'data-mention': mention.id
	};

	const options = {
		id: mention._uid,
		priority: 20
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
		if ( change.name != '$text' && change.type == 'insert' ) {
			const insertedNode = position.nodeAfter;

			for ( const item of writer.createRangeIn( insertedNode ).getItems() ) {
				wasChanged = checkAndFix( item, writer ) || wasChanged;
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
			// Check node at the left side of a range...
			const nodeBefore = change.range.start.nodeBefore;
			// ... and on right side of range.
			const nodeAfter = change.range.end.nodeAfter;

			for ( const node of [ nodeBefore, nodeAfter ] ) {
				if ( isBrokenMentionNode( node ) && node.getAttribute( change.attributeKey ) != change.attributeNewValue ) {
					writer.setAttribute( change.attributeKey, change.attributeNewValue, node );

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

	const expectedText = mention._text;

	return text != expectedText;
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
