/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals Node */

/**
 * @module engine/view/renderer
 */

import ViewText from './text';
import ViewPosition from './position';
import { INLINE_FILLER, INLINE_FILLER_LENGTH, startsWithFiller, isInlineFiller } from './filler';

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import diff from '@ckeditor/ckeditor5-utils/src/diff';
import insertAt from '@ckeditor/ckeditor5-utils/src/dom/insertat';
import remove from '@ckeditor/ckeditor5-utils/src/dom/remove';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import isText from '@ckeditor/ckeditor5-utils/src/dom/istext';
import isNode from '@ckeditor/ckeditor5-utils/src/dom/isnode';
import fastDiff from '@ckeditor/ckeditor5-utils/src/fastdiff';
import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * Renderer is responsible for updating the DOM structure and the DOM selection based on
 * the {@link module:engine/view/renderer~Renderer#markToSync information about updated view nodes}.
 * In other words, it renders the view to the DOM.
 *
 * Its main responsibility is to make only the necessary, minimal changes to the DOM. However, unlike in many
 * virtual DOM implementations, the primary reason for doing minimal changes is not the performance but ensuring
 * that native editing features such as text composition, autocompletion, spell checking, selection's x-index are
 * affected as little as possible.
 *
 * Renderer uses {@link module:engine/view/domconverter~DomConverter} to transform view nodes and positions
 * to and from the DOM.
 */
export default class Renderer {
	/**
	 * Creates a renderer instance.
	 *
	 * @param {module:engine/view/domconverter~DomConverter} domConverter Converter instance.
	 * @param {module:engine/view/documentselection~DocumentSelection} selection View selection.
	 */
	constructor( domConverter, selection ) {
		/**
		 * Set of DOM Documents instances.
		 *
		 * @readonly
		 * @member {Set.<Document>}
		 */
		this.domDocuments = new Set();

		/**
		 * Converter instance.
		 *
		 * @readonly
		 * @member {module:engine/view/domconverter~DomConverter}
		 */
		this.domConverter = domConverter;

		/**
		 * Set of nodes which attributes changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<module:engine/view/node~Node>}
		 */
		this.markedAttributes = new Set();

		/**
		 * Set of elements which child lists changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<module:engine/view/node~Node>}
		 */
		this.markedChildren = new Set();

		/**
		 * Set of text nodes which text data changed and may need to be rendered.
		 *
		 * @readonly
		 * @member {Set.<module:engine/view/node~Node>}
		 */
		this.markedTexts = new Set();

		/**
		 * View selection. Renderer updates DOM selection based on the view selection.
		 *
		 * @readonly
		 * @member {module:engine/view/documentselection~DocumentSelection}
		 */
		this.selection = selection;

		/**
		 * Indicates if the view document is focused and selection can be rendered. Selection will not be rendered if
		 * this is set to `false`.
		 *
		 * @member {Boolean}
		 */
		this.isFocused = false;

		/**
		 * The text node in which the inline filler was rendered.
		 *
		 * @private
		 * @member {Text}
		 */
		this._inlineFiller = null;

		/**
		 * DOM element containing fake selection.
		 *
		 * @private
		 * @type {null|HTMLElement}
		 */
		this._fakeSelectionContainer = null;
	}

	/**
	 * Marks a view node to be updated in the DOM by {@link #render `render()`}.
	 *
	 * Note that only view nodes whose parents have corresponding DOM elements need to be marked to be synchronized.
	 *
	 * @see #markedAttributes
	 * @see #markedChildren
	 * @see #markedTexts
	 *
	 * @param {module:engine/view/document~ChangeType} type Type of the change.
	 * @param {module:engine/view/node~Node} node Node to be marked.
	 */
	markToSync( type, node ) {
		if ( type === 'text' ) {
			if ( this.domConverter.mapViewToDom( node.parent ) ) {
				this.markedTexts.add( node );
			}
		} else {
			// If the node has no DOM element it is not rendered yet,
			// its children/attributes do not need to be marked to be sync.
			if ( !this.domConverter.mapViewToDom( node ) ) {
				return;
			}

			if ( type === 'attributes' ) {
				this.markedAttributes.add( node );
			} else if ( type === 'children' ) {
				this.markedChildren.add( node );
			} else {
				/**
				 * Unknown type passed to Renderer.markToSync.
				 *
				 * @error renderer-unknown-type
				 */
				throw new CKEditorError( 'view-renderer-unknown-type: Unknown type passed to Renderer.markToSync.', this );
			}
		}
	}

	/**
	 * Renders all buffered changes ({@link #markedAttributes}, {@link #markedChildren} and {@link #markedTexts}) and
	 * the current view selection (if needed) to the DOM by applying a minimal set of changes to it.
	 *
	 * Renderer tries not to break the text composition (e.g. IME) and x-index of the selection,
	 * so it does as little as it is needed to update the DOM.
	 *
	 * Renderer also handles {@link module:engine/view/filler fillers}. Especially, it checks if the inline filler is needed
	 * at the selection position and adds or removes it. To prevent breaking text composition inline filler will not be
	 * removed as long as the selection is in the text node which needed it at first.
	 */
	render() {
		let inlineFillerPosition;

		// Refresh mappings.
		for ( const element of this.markedChildren ) {
			this._updateChildrenMappings( element );
		}

		// There was inline filler rendered in the DOM but it's not
		// at the selection position any more, so we can remove it
		// (cause even if it's needed, it must be placed in another location).
		if ( this._inlineFiller && !this._isSelectionInInlineFiller() ) {
			this._removeInlineFiller();
		}

		// If we've got the filler, let's try to guess its position in the view.
		if ( this._inlineFiller ) {
			inlineFillerPosition = this._getInlineFillerPosition();
		}
		// Otherwise, if it's needed, create it at the selection position.
		else if ( this._needsInlineFillerAtSelection() ) {
			inlineFillerPosition = this.selection.getFirstPosition();

			// Do not use `markToSync` so it will be added even if the parent is already added.
			this.markedChildren.add( inlineFillerPosition.parent );
		}

		for ( const element of this.markedAttributes ) {
			this._updateAttrs( element );
		}

		for ( const element of this.markedChildren ) {
			this._updateChildren( element, { inlineFillerPosition } );
		}

		for ( const node of this.markedTexts ) {
			if ( !this.markedChildren.has( node.parent ) && this.domConverter.mapViewToDom( node.parent ) ) {
				this._updateText( node, { inlineFillerPosition } );
			}
		}

		// Check whether the inline filler is required and where it really is in the DOM.
		// At this point in most cases it will be in the DOM, but there are exceptions.
		// For example, if the inline filler was deep in the created DOM structure, it will not be created.
		// Similarly, if it was removed at the beginning of this function and then neither text nor children were updated,
		// it will not be present.
		// Fix those and similar scenarios.
		if ( inlineFillerPosition ) {
			const fillerDomPosition = this.domConverter.viewPositionToDom( inlineFillerPosition );
			const domDocument = fillerDomPosition.parent.ownerDocument;

			if ( !startsWithFiller( fillerDomPosition.parent ) ) {
				// Filler has not been created at filler position. Create it now.
				this._inlineFiller = addInlineFiller( domDocument, fillerDomPosition.parent, fillerDomPosition.offset );
			} else {
				// Filler has been found, save it.
				this._inlineFiller = fillerDomPosition.parent;
			}
		} else {
			// There is no filler needed.
			this._inlineFiller = null;
		}

		this._updateSelection();
		this._updateFocus();

		this.markedTexts.clear();
		this.markedAttributes.clear();
		this.markedChildren.clear();
	}

	/**
	 * Updates mappings of view element's children.
	 *
	 * Children that were replaced in the view structure by similar elements (same tag name) are treated as 'replaced'.
	 * This means that their mappings can be updated so the new view elements are mapped to the existing DOM elements.
	 * Thanks to that these elements do not need to be re-rendered completely.
	 *
	 * @private
	 * @param {module:engine/view/node~Node} viewElement The view element whose children mappings will be updated.
	 */
	_updateChildrenMappings( viewElement ) {
		const domElement = this.domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that it was already removed from DOM and there is no need to process it.
			return;
		}

		const actualDomChildren = this.domConverter.mapViewToDom( viewElement ).childNodes;
		const expectedDomChildren = Array.from(
			this.domConverter.viewChildrenToDom( viewElement, domElement.ownerDocument, { withChildren: false } )
		);
		const diff = this._diffNodeLists( actualDomChildren, expectedDomChildren );
		const actions = this._findReplaceActions( diff, actualDomChildren, expectedDomChildren );

		if ( actions.indexOf( 'replace' ) !== -1 ) {
			const counter = { equal: 0, insert: 0, delete: 0 };

			for ( const action of actions ) {
				if ( action === 'replace' ) {
					const insertIndex = counter.equal + counter.insert;
					const deleteIndex = counter.equal + counter.delete;
					const viewChild = viewElement.getChild( insertIndex );

					// The 'uiElement' is a special one and its children are not stored in a view (#799),
					// so we cannot use it with replacing flow (since it uses view children during rendering
					// which will always result in rendering empty element).
					if ( viewChild && !viewChild.is( 'uiElement' ) ) {
						this._updateElementMappings( viewChild, actualDomChildren[ deleteIndex ] );
					}

					remove( expectedDomChildren[ insertIndex ] );
					counter.equal++;
				} else {
					counter[ action ]++;
				}
			}
		}
	}

	/**
	 * Updates mappings of a given view element.
	 *
	 * @private
	 * @param {module:engine/view/node~Node} viewElement The view element whose mappings will be updated.
	 * @param {Node} domElement The DOM element representing the given view element.
	 */
	_updateElementMappings( viewElement, domElement ) {
		// Remap 'DomConverter' bindings.
		this.domConverter.unbindDomElement( domElement );
		this.domConverter.bindElements( domElement, viewElement );

		// View element may have children which needs to be updated, but are not marked, mark them to update.
		this.markedChildren.add( viewElement );

		// Because we replace new view element mapping with the existing one, the corresponding DOM element
		// will not be rerendered. The new view element may have different attributes than the previous one.
		// Since its corresponding DOM element will not be rerendered, new attributes will not be added
		// to the DOM, so we need to mark it here to make sure its attributes gets updated. See #1427 for more
		// detailed case study.
		// Also there are cases where replaced element is removed from the view structure and then has
		// its attributes changed or removed. In such cases the element will not be present in `markedAttributes`
		// and also may be the same (`element.isSimilar()`) as the reused element not having its attributes updated.
		// To prevent such situations we always mark reused element to have its attributes rerenderd (#1560).
		this.markedAttributes.add( viewElement );
	}

	/**
	 * Gets the position of the inline filler based on the current selection.
	 * Here, we assume that we know that the filler is needed and
	 * {@link #_isSelectionInInlineFiller is at the selection position}, and, since it is needed,
	 * it is somewhere at the selection position.
	 *
	 * Note: The filler position cannot be restored based on the filler's DOM text node, because
	 * when this method is called (before rendering), the bindings will often be broken. View-to-DOM
	 * bindings are only dependable after rendering.
	 *
	 * @private
	 * @returns {module:engine/view/position~Position}
	 */
	_getInlineFillerPosition() {
		const firstPos = this.selection.getFirstPosition();

		if ( firstPos.parent.is( 'text' ) ) {
			return ViewPosition._createBefore( this.selection.getFirstPosition().parent );
		} else {
			return firstPos;
		}
	}

	/**
	 * Returns `true` if the selection has not left the inline filler's text node.
	 * If it is `true`, it means that the filler had been added for a reason and the selection did not
	 * leave the filler's text node. For example, the user can be in the middle of a composition so it should not be touched.
	 *
	 * @private
	 * @returns {Boolean} `true` if the inline filler and selection are in the same place.
	 */
	_isSelectionInInlineFiller() {
		if ( this.selection.rangeCount != 1 || !this.selection.isCollapsed ) {
			return false;
		}

		// Note, we can't check if selection's position equals position of the
		// this._inlineFiller node, because of #663. We may not be able to calculate
		// the filler's position in the view at this stage.
		// Instead, we check it the other way – whether selection is anchored in
		// that text node or next to it.

		// Possible options are:
		// "FILLER{}"
		// "FILLERadded-text{}"
		const selectionPosition = this.selection.getFirstPosition();
		const position = this.domConverter.viewPositionToDom( selectionPosition );

		if ( position && isText( position.parent ) && startsWithFiller( position.parent ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Removes the inline filler.
	 *
	 * @private
	 */
	_removeInlineFiller() {
		const domFillerNode = this._inlineFiller;

		// Something weird happened and the stored node doesn't contain the filler's text.
		if ( !startsWithFiller( domFillerNode ) ) {
			/**
			 * The inline filler node was lost. Most likely, something overwrote the filler text node
			 * in the DOM.
			 *
			 * @error view-renderer-filler-was-lost
			 */
			throw new CKEditorError( 'view-renderer-filler-was-lost: The inline filler node was lost.', this );
		}

		if ( isInlineFiller( domFillerNode ) ) {
			domFillerNode.parentNode.removeChild( domFillerNode );
		} else {
			domFillerNode.data = domFillerNode.data.substr( INLINE_FILLER_LENGTH );
		}

		this._inlineFiller = null;
	}

	/**
	 * Checks if the inline {@link module:engine/view/filler filler} should be added.
	 *
	 * @private
	 * @returns {Boolean} `true` if the inline filler should be added.
	 */
	_needsInlineFillerAtSelection() {
		if ( this.selection.rangeCount != 1 || !this.selection.isCollapsed ) {
			return false;
		}

		const selectionPosition = this.selection.getFirstPosition();
		const selectionParent = selectionPosition.parent;
		const selectionOffset = selectionPosition.offset;

		// If there is no DOM root we do not care about fillers.
		if ( !this.domConverter.mapViewToDom( selectionParent.root ) ) {
			return false;
		}

		if ( !( selectionParent.is( 'element' ) ) ) {
			return false;
		}

		// Prevent adding inline filler inside elements with contenteditable=false.
		// https://github.com/ckeditor/ckeditor5-engine/issues/1170
		if ( !isEditable( selectionParent ) ) {
			return false;
		}

		// We have block filler, we do not need inline one.
		if ( selectionOffset === selectionParent.getFillerOffset() ) {
			return false;
		}

		const nodeBefore = selectionPosition.nodeBefore;
		const nodeAfter = selectionPosition.nodeAfter;

		if ( nodeBefore instanceof ViewText || nodeAfter instanceof ViewText ) {
			return false;
		}

		return true;
	}

	/**
	 * Checks if text needs to be updated and possibly updates it.
	 *
	 * @private
	 * @param {module:engine/view/text~Text} viewText View text to update.
	 * @param {Object} options
	 * @param {module:engine/view/position~Position} options.inlineFillerPosition The position where the inline
	 * filler should be rendered.
	 */
	_updateText( viewText, options ) {
		const domText = this.domConverter.findCorrespondingDomText( viewText );
		const newDomText = this.domConverter.viewToDom( viewText, domText.ownerDocument );

		const actualText = domText.data;
		let expectedText = newDomText.data;

		const filler = options.inlineFillerPosition;

		if ( filler && filler.parent == viewText.parent && filler.offset == viewText.index ) {
			expectedText = INLINE_FILLER + expectedText;
		}

		if ( actualText != expectedText ) {
			const actions = fastDiff( actualText, expectedText );

			for ( const action of actions ) {
				if ( action.type === 'insert' ) {
					domText.insertData( action.index, action.values.join( '' ) );
				} else { // 'delete'
					domText.deleteData( action.index, action.howMany );
				}
			}
		}
	}

	/**
	 * Checks if attribute list needs to be updated and possibly updates it.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement The view element to update.
	 */
	_updateAttrs( viewElement ) {
		const domElement = this.domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that 'viewElement' is outdated as its mapping was updated
			// in 'this._updateChildrenMappings()'. There is no need to process it as new view element which
			// replaced old 'viewElement' mapping was also added to 'this.markedAttributes'
			// in 'this._updateChildrenMappings()' so it will be processed separately.
			return;
		}

		const domAttrKeys = Array.from( domElement.attributes ).map( attr => attr.name );
		const viewAttrKeys = viewElement.getAttributeKeys();

		// Add or overwrite attributes.
		for ( const key of viewAttrKeys ) {
			domElement.setAttribute( key, viewElement.getAttribute( key ) );
		}

		// Remove from DOM attributes which do not exists in the view.
		for ( const key of domAttrKeys ) {
			if ( !viewElement.hasAttribute( key ) ) {
				domElement.removeAttribute( key );
			}
		}
	}

	/**
	 * Checks if elements child list needs to be updated and possibly updates it.
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewElement View element to update.
	 * @param {Object} options
	 * @param {module:engine/view/position~Position} options.inlineFillerPosition The position where the inline
	 * filler should be rendered.
	 */
	_updateChildren( viewElement, options ) {
		const domElement = this.domConverter.mapViewToDom( viewElement );

		if ( !domElement ) {
			// If there is no `domElement` it means that it was already removed from DOM.
			// There is no need to process it. It will be processed when re-inserted.
			return;
		}

		const inlineFillerPosition = options.inlineFillerPosition;
		const actualDomChildren = this.domConverter.mapViewToDom( viewElement ).childNodes;
		const expectedDomChildren = Array.from(
			this.domConverter.viewChildrenToDom( viewElement, domElement.ownerDocument, { bind: true, inlineFillerPosition } )
		);

		// Inline filler element has to be created as it is present in the DOM, but not in the view. It is required
		// during diffing so text nodes could be compared correctly and also during rendering to maintain
		// proper order and indexes while updating the DOM.
		if ( inlineFillerPosition && inlineFillerPosition.parent === viewElement ) {
			addInlineFiller( domElement.ownerDocument, expectedDomChildren, inlineFillerPosition.offset );
		}

		const diff = this._diffNodeLists( actualDomChildren, expectedDomChildren );

		let i = 0;
		const nodesToUnbind = new Set();

		// Handle deletions first.
		// This is to prevent a situation where an element that already exists in `actualDomChildren` is inserted at a different
		// index in `actualDomChildren`. Since `actualDomChildren` is a `NodeList`, this works like move, not like an insert,
		// and it disrupts the whole algorithm. See https://github.com/ckeditor/ckeditor5/issues/6367.
		//
		// It doesn't matter in what order we remove or add nodes, as long as we remove and add correct nodes at correct indexes.
		for ( const action of diff ) {
			if ( action === 'delete' ) {
				nodesToUnbind.add( actualDomChildren[ i ] );
				remove( actualDomChildren[ i ] );
			} else if ( action === 'equal' ) {
				i++;
			}
		}

		i = 0;

		for ( const action of diff ) {
			if ( action === 'insert' ) {
				insertAt( domElement, i, expectedDomChildren[ i ] );
				i++;
			} else if ( action === 'equal' ) {
				// Force updating text nodes inside elements which did not change and do not need to be re-rendered (#1125).
				// Do it here (not in the loop above) because only after insertions the `i` index is correct.
				this._markDescendantTextToSync( this.domConverter.domToView( expectedDomChildren[ i ] ) );
				i++;
			}
		}

		// Unbind removed nodes. When node does not have a parent it means that it was removed from DOM tree during
		// comparison with the expected DOM. We don't need to check child nodes, because if child node was reinserted,
		// it was moved to DOM tree out of the removed node.
		for ( const node of nodesToUnbind ) {
			if ( !node.parentNode ) {
				this.domConverter.unbindDomElement( node );
			}
		}
	}

	/**
	 * Shorthand for diffing two arrays or node lists of DOM nodes.
	 *
	 * @private
	 * @param {Array.<Node>|NodeList} actualDomChildren Actual DOM children
	 * @param {Array.<Node>|NodeList} expectedDomChildren Expected DOM children.
	 * @returns {Array.<String>} The list of actions based on the {@link module:utils/diff~diff} function.
	 */
	_diffNodeLists( actualDomChildren, expectedDomChildren ) {
		actualDomChildren = filterOutFakeSelectionContainer( actualDomChildren, this._fakeSelectionContainer );

		return diff( actualDomChildren, expectedDomChildren, sameNodes.bind( null, this.domConverter ) );
	}

	/**
	 * Finds DOM nodes that were replaced with the similar nodes (same tag name) in the view. All nodes are compared
	 * within one `insert`/`delete` action group, for example:
	 *
	 * 		Actual DOM:		<p><b>Foo</b>Bar<i>Baz</i><b>Bax</b></p>
	 * 		Expected DOM:	<p>Bar<b>123</b><i>Baz</i><b>456</b></p>
	 * 		Input actions:	[ insert, insert, delete, delete, equal, insert, delete ]
	 * 		Output actions:	[ insert, replace, delete, equal, replace ]
	 *
	 * @private
	 * @param {Array.<String>} actions Actions array which is a result of the {@link module:utils/diff~diff} function.
	 * @param {Array.<Node>|NodeList} actualDom Actual DOM children
	 * @param {Array.<Node>} expectedDom Expected DOM children.
	 * @returns {Array.<String>} Actions array modified with the `replace` actions.
	 */
	_findReplaceActions( actions, actualDom, expectedDom ) {
		// If there is no both 'insert' and 'delete' actions, no need to check for replaced elements.
		if ( actions.indexOf( 'insert' ) === -1 || actions.indexOf( 'delete' ) === -1 ) {
			return actions;
		}

		let newActions = [];
		let actualSlice = [];
		let expectedSlice = [];

		const counter = { equal: 0, insert: 0, delete: 0 };

		for ( const action of actions ) {
			if ( action === 'insert' ) {
				expectedSlice.push( expectedDom[ counter.equal + counter.insert ] );
			} else if ( action === 'delete' ) {
				actualSlice.push( actualDom[ counter.equal + counter.delete ] );
			} else { // equal
				newActions = newActions.concat( diff( actualSlice, expectedSlice, areSimilar ).map( x => x === 'equal' ? 'replace' : x ) );
				newActions.push( 'equal' );
				// Reset stored elements on 'equal'.
				actualSlice = [];
				expectedSlice = [];
			}
			counter[ action ]++;
		}

		return newActions.concat( diff( actualSlice, expectedSlice, areSimilar ).map( x => x === 'equal' ? 'replace' : x ) );
	}

	/**
	 * Marks text nodes to be synchronized.
	 *
	 * If a text node is passed, it will be marked. If an element is passed, all descendant text nodes inside it will be marked.
	 *
	 * @private
	 * @param {module:engine/view/node~Node} viewNode View node to sync.
	 */
	_markDescendantTextToSync( viewNode ) {
		if ( !viewNode ) {
			return;
		}

		if ( viewNode.is( 'text' ) ) {
			this.markedTexts.add( viewNode );
		} else if ( viewNode.is( 'element' ) ) {
			for ( const child of viewNode.getChildren() ) {
				this._markDescendantTextToSync( child );
			}
		}
	}

	/**
	 * Checks if the selection needs to be updated and possibly updates it.
	 *
	 * @private
	 */
	_updateSelection() {
		// If there is no selection - remove DOM and fake selections.
		if ( this.selection.rangeCount === 0 ) {
			this._removeDomSelection();
			this._removeFakeSelection();

			return;
		}

		const domRoot = this.domConverter.mapViewToDom( this.selection.editableElement );

		// Do nothing if there is no focus, or there is no DOM element corresponding to selection's editable element.
		if ( !this.isFocused || !domRoot ) {
			return;
		}

		// Render selection.
		if ( this.selection.isFake ) {
			this._updateFakeSelection( domRoot );
		} else {
			this._removeFakeSelection();
			this._updateDomSelection( domRoot );
		}
	}

	/**
	 * Updates the fake selection.
	 *
	 * @private
	 * @param {HTMLElement} domRoot A valid DOM root where the fake selection container should be added.
	 */
	_updateFakeSelection( domRoot ) {
		const domDocument = domRoot.ownerDocument;

		if ( !this._fakeSelectionContainer ) {
			this._fakeSelectionContainer = createFakeSelectionContainer( domDocument );
		}

		const container = this._fakeSelectionContainer;

		// Bind fake selection container with the current selection *position*.
		this.domConverter.bindFakeSelection( container, this.selection );

		if ( !this._fakeSelectionNeedsUpdate( domRoot ) ) {
			return;
		}

		if ( !container.parentElement || container.parentElement != domRoot ) {
			domRoot.appendChild( container );
		}

		container.textContent = this.selection.fakeSelectionLabel || '\u00A0';

		const domSelection = domDocument.getSelection();
		const domRange = domDocument.createRange();

		domSelection.removeAllRanges();
		domRange.selectNodeContents( container );
		domSelection.addRange( domRange );
	}

	/**
	 * Updates the DOM selection.
	 *
	 * @private
	 * @param {HTMLElement} domRoot A valid DOM root where the DOM selection should be rendered.
	 */
	_updateDomSelection( domRoot ) {
		const domSelection = domRoot.ownerDocument.defaultView.getSelection();

		// Let's check whether DOM selection needs updating at all.
		if ( !this._domSelectionNeedsUpdate( domSelection ) ) {
			return;
		}

		// Multi-range selection is not available in most browsers, and, at least in Chrome, trying to
		// set such selection, that is not continuous, throws an error. Because of that, we will just use anchor
		// and focus of view selection.
		// Since we are not supporting multi-range selection, we also do not need to check if proper editable is
		// selected. If there is any editable selected, it is okay (editable is taken from selection anchor).
		const anchor = this.domConverter.viewPositionToDom( this.selection.anchor );
		const focus = this.domConverter.viewPositionToDom( this.selection.focus );

		// Focus the new editing host.
		// Otherwise, FF may throw an error (https://github.com/ckeditor/ckeditor5/issues/721).
		domRoot.focus();

		domSelection.collapse( anchor.parent, anchor.offset );
		domSelection.extend( focus.parent, focus.offset );

		// Firefox–specific hack (https://github.com/ckeditor/ckeditor5-engine/issues/1439).
		if ( env.isGecko ) {
			fixGeckoSelectionAfterBr( focus, domSelection );
		}
	}

	/**
	 * Checks whether a given DOM selection needs to be updated.
	 *
	 * @private
	 * @param {Selection} domSelection The DOM selection to check.
	 * @returns {Boolean}
	 */
	_domSelectionNeedsUpdate( domSelection ) {
		if ( !this.domConverter.isDomSelectionCorrect( domSelection ) ) {
			// Current DOM selection is in incorrect position. We need to update it.
			return true;
		}

		const oldViewSelection = domSelection && this.domConverter.domSelectionToView( domSelection );

		if ( oldViewSelection && this.selection.isEqual( oldViewSelection ) ) {
			return false;
		}

		// If selection is not collapsed, it does not need to be updated if it is similar.
		if ( !this.selection.isCollapsed && this.selection.isSimilar( oldViewSelection ) ) {
			// Selection did not changed and is correct, do not update.
			return false;
		}

		// Selections are not similar.
		return true;
	}

	/**
	 * Checks whether the fake selection needs to be updated.
	 *
	 * @private
	 * @param {HTMLElement} domRoot A valid DOM root where a new fake selection container should be added.
	 * @returns {Boolean}
	 */
	_fakeSelectionNeedsUpdate( domRoot ) {
		const container = this._fakeSelectionContainer;
		const domSelection = domRoot.ownerDocument.getSelection();

		// Fake selection needs to be updated if there's no fake selection container, or the container currently sits
		// in a different root.
		if ( !container || container.parentElement !== domRoot ) {
			return true;
		}

		// Make sure that the selection actually is within the fake selection.
		if ( domSelection.anchorNode !== container && !container.contains( domSelection.anchorNode ) ) {
			return true;
		}

		return container.textContent !== this.selection.fakeSelectionLabel;
	}

	/**
	 * Removes the DOM selection.
	 *
	 * @private
	 */
	_removeDomSelection() {
		for ( const doc of this.domDocuments ) {
			const domSelection = doc.getSelection();

			if ( domSelection.rangeCount ) {
				const activeDomElement = doc.activeElement;
				const viewElement = this.domConverter.mapDomToView( activeDomElement );

				if ( activeDomElement && viewElement ) {
					doc.getSelection().removeAllRanges();
				}
			}
		}
	}

	/**
	 * Removes the fake selection.
	 *
	 * @private
	 */
	_removeFakeSelection() {
		const container = this._fakeSelectionContainer;

		if ( container ) {
			container.remove();
		}
	}

	/**
	 * Checks if focus needs to be updated and possibly updates it.
	 *
	 * @private
	 */
	_updateFocus() {
		if ( this.isFocused ) {
			const editable = this.selection.editableElement;

			if ( editable ) {
				this.domConverter.focus( editable );
			}
		}
	}
}

mix( Renderer, ObservableMixin );

// Checks if provided element is editable.
//
// @private
// @param {module:engine/view/element~Element} element
// @returns {Boolean}
function isEditable( element ) {
	if ( element.getAttribute( 'contenteditable' ) == 'false' ) {
		return false;
	}

	const parent = element.findAncestor( element => element.hasAttribute( 'contenteditable' ) );

	return !parent || parent.getAttribute( 'contenteditable' ) == 'true';
}

// Adds inline filler at a given position.
//
// The position can be given as an array of DOM nodes and an offset in that array,
// or a DOM parent element and an offset in that element.
//
// @private
// @param {Document} domDocument
// @param {Element|Array.<Node>} domParentOrArray
// @param {Number} offset
// @returns {Text} The DOM text node that contains an inline filler.
function addInlineFiller( domDocument, domParentOrArray, offset ) {
	const childNodes = domParentOrArray instanceof Array ? domParentOrArray : domParentOrArray.childNodes;
	const nodeAfterFiller = childNodes[ offset ];

	if ( isText( nodeAfterFiller ) ) {
		nodeAfterFiller.data = INLINE_FILLER + nodeAfterFiller.data;

		return nodeAfterFiller;
	} else {
		const fillerNode = domDocument.createTextNode( INLINE_FILLER );

		if ( Array.isArray( domParentOrArray ) ) {
			childNodes.splice( offset, 0, fillerNode );
		} else {
			insertAt( domParentOrArray, offset, fillerNode );
		}

		return fillerNode;
	}
}

// Whether two DOM nodes should be considered as similar.
// Nodes are considered similar if they have the same tag name.
//
// @private
// @param {Node} node1
// @param {Node} node2
// @returns {Boolean}
function areSimilar( node1, node2 ) {
	return isNode( node1 ) && isNode( node2 ) &&
		!isText( node1 ) && !isText( node2 ) &&
		node1.nodeType !== 8 && node2.nodeType !== 8 &&
		node1.tagName.toLowerCase() === node2.tagName.toLowerCase();
}

// Whether two dom nodes should be considered as the same.
// Two nodes which are considered the same are:
//
//		* Text nodes with the same text.
//		* Element nodes represented by the same object.
//		* Two block filler elements.
//
// @private
// @param {String} blockFillerMode Block filler mode, see {@link module:engine/view/domconverter~DomConverter#blockFillerMode}.
// @param {Node} node1
// @param {Node} node2
// @returns {Boolean}
function sameNodes( domConverter, actualDomChild, expectedDomChild ) {
	// Elements.
	if ( actualDomChild === expectedDomChild ) {
		return true;
	}
	// Texts.
	else if ( isText( actualDomChild ) && isText( expectedDomChild ) ) {
		return actualDomChild.data === expectedDomChild.data;
	}
	// Block fillers.
	else if ( domConverter.isBlockFiller( actualDomChild ) &&
		domConverter.isBlockFiller( expectedDomChild ) ) {
		return true;
	}

	// Not matching types.
	return false;
}

// The following is a Firefox–specific hack (https://github.com/ckeditor/ckeditor5-engine/issues/1439).
// When the native DOM selection is at the end of the block and preceded by <br /> e.g.
//
//		<p>foo<br/>[]</p>
//
// which happens a lot when using the soft line break, the browser fails to (visually) move the
// caret to the new line. A quick fix is as simple as force–refreshing the selection with the same range.
function fixGeckoSelectionAfterBr( focus, domSelection ) {
	const parent = focus.parent;

	// This fix works only when the focus point is at the very end of an element.
	// There is no point in running it in cases unrelated to the browser bug.
	if ( parent.nodeType != Node.ELEMENT_NODE || focus.offset != parent.childNodes.length - 1 ) {
		return;
	}

	const childAtOffset = parent.childNodes[ focus.offset ];

	// To stay on the safe side, the fix being as specific as possible, it targets only the
	// selection which is at the very end of the element and preceded by <br />.
	if ( childAtOffset && childAtOffset.tagName == 'BR' ) {
		domSelection.addRange( domSelection.getRangeAt( 0 ) );
	}
}

function filterOutFakeSelectionContainer( domChildList, fakeSelectionContainer ) {
	const childList = Array.from( domChildList );

	if ( childList.length == 0 || !fakeSelectionContainer ) {
		return childList;
	}

	const last = childList[ childList.length - 1 ];

	if ( last == fakeSelectionContainer ) {
		childList.pop();
	}

	return childList;
}

// Creates a fake selection container for a given document.
//
// @private
// @param {Document} domDocument
// @returns {HTMLElement}
function createFakeSelectionContainer( domDocument ) {
	const container = domDocument.createElement( 'div' );

	Object.assign( container.style, {
		position: 'fixed',
		top: 0,
		left: '-9999px',
		// See https://github.com/ckeditor/ckeditor5/issues/752.
		width: '42px'
	} );

	// Fill it with a text node so we can update it later.
	container.textContent = '\u00A0';

	return container;
}
