/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals Range, Node, NodeFilter */

import ViewText from './text.js';
import ViewElement from './element.js';
import ViewPosition from './position.js';
import ViewRange from './range.js';
import ViewSelection from './selection.js';
import ViewDocumentFragment from './documentfragment.js';
import ViewContainerElement from './containerelement.js';
import ViewTreeWalker from './treewalker.js';
import { BR_FILLER, INLINE_FILLER_LENGTH, isBlockFiller, isInlineFiller, startsWithFiller, getDataWithoutFiller } from './filler.js';

import indexOf from '../../utils/dom/indexof.js';
import getAncestors from '../../utils/dom/getancestors.js';
import getCommonAncestor from '../../utils/dom/getcommonancestor.js';

/**
 * DomConverter is a set of tools to do transformations between DOM nodes and view nodes. It also handles
 * {@link engine.view.DomConverter#bindElements binding} these nodes.
 *
 * DomConverter does not check which nodes should be rendered (use {@link engine.view.Renderer}), does not keep a
 * state of a tree nor keeps synchronization between tree view and DOM tree (use {@link engine.view.Document}).
 *
 * DomConverter keeps DOM elements to View element bindings, so when the converter will be destroyed, the binding will
 * be lost. Two converters will keep separate binding maps, so one tree view can be bound with two DOM trees.
 *
 * @memberOf engine.view
 */
export default class DomConverter {
	/**
	 * Creates DOM converter.
	 *
	 * @param {Object} options Object with configuration options.
	 * @param {Function} [options.blockFiller=engine.view.filler.BR_FILLER] Block filler creator.
	 */
	constructor( options = {} ) {
		// Using WeakMap prevent memory leaks: when the converter will be destroyed all referenced between View and DOM
		// will be removed. Also because it is a *Weak*Map when both view and DOM elements will be removed referenced
		// will be also removed, isn't it brilliant?
		//
		// Yes, PJ. It is.
		//
		// You guys so smart.
		//
		// I've been here. Seen stuff. Afraid of code now.

		/**
		 * Block {@link engine.view.filler filler} creator, which is used to create all block fillers during the
		 * view to DOM conversion and to recognize block fillers during the DOM to view conversion.
		 *
		 * @readonly
		 * @member {Function} engine.view.DomConverter#blockFiller
		 */
		this.blockFiller = options.blockFiller || BR_FILLER;

		/**
		 * DOM to View mapping.
		 *
		 * @private
		 * @member {WeakMap} engine.view.DomConverter#_domToViewMapping
		 */
		this._domToViewMapping = new WeakMap();

		/**
		 * View to DOM mapping.
		 *
		 * @private
		 * @member {WeakMap} engine.view.DomConverter#_viewToDomMapping
		 */
		this._viewToDomMapping = new WeakMap();

		/**
		 * Tag names of DOM `Element`s which are considered pre-formatted elements.
		 *
		 * @type {Array.<String>}
		 */
		this.preNodes = [ 'pre' ];

		/**
		 * Tag names of DOM `Element`s which are considered block elements.
		 *
		 * @type {Array.<String>}
		 */
		this.blockNodes = [ 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
	}

	/**
	 * Binds DOM and View elements, so it will be possible to get corresponding elements using
	 * {@link engine.view.DomConverter#getCorrespondingViewElement getCorrespondingViewElement} and
	 * {@link engine.view.DomConverter#getCorrespondingDomElement getCorrespondingDomElement}.
	 *
	 * @param {HTMLElement} domElement DOM element to bind.
	 * @param {engine.view.Element} viewElement View element to bind.
	 */
	bindElements( domElement, viewElement ) {
		this._domToViewMapping.set( domElement, viewElement );
		this._viewToDomMapping.set( viewElement, domElement );
	}

	/**
	 * Binds DOM and View document fragments, so it will be possible to get corresponding document fragments using
	 * {@link engine.view.DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment} and
	 * {@link engine.view.DomConverter#getCorrespondingDomDocumentFragment getCorrespondingDomDocumentFragment}.
	 *
	 * @param {DocumentFragment} domFragment DOM document fragment to bind.
	 * @param {engine.view.DocumentFragment} viewFragment View document fragment to bind.
	 */
	bindDocumentFragments( domFragment, viewFragment ) {
		this._domToViewMapping.set( domFragment, viewFragment );
		this._viewToDomMapping.set( viewFragment, domFragment );
	}

	/**
	 * Converts view to DOM. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items.
	 *
	 * @param {engine.view.Node|engine.view.DocumentFragment} viewNode View node or document fragment to transform.
	 * @param {document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If true node's and document fragment's children  will be converted too.
	 * @returns {Node|DocumentFragment} Converted node or DocumentFragment.
	 */
	viewToDom( viewNode, domDocument, options = {} ) {
		if ( viewNode instanceof ViewText ) {
			const textData = this._processDataFromViewText( viewNode );

			return domDocument.createTextNode( textData );
		} else {
			if ( this.getCorrespondingDom( viewNode ) ) {
				return this.getCorrespondingDom( viewNode );
			}

			let domElement;

			if ( viewNode instanceof ViewDocumentFragment ) {
				// Create DOM document fragment.
				domElement = domDocument.createDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domElement, viewNode );
				}
			} else {
				// Create DOM element.
				domElement = domDocument.createElement( viewNode.name );

				if ( options.bind ) {
					this.bindElements( domElement, viewNode );
				}

				// Copy element's attributes.
				for ( let key of viewNode.getAttributeKeys() ) {
					domElement.setAttribute( key, viewNode.getAttribute( key ) );
				}
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let child of this.viewChildrenToDom( viewNode, domDocument, options ) ) {
					domElement.appendChild( child );
				}
			}

			return domElement;
		}
	}

	/**
	 * Converts children of the view element to DOM using {@link engine.view.DomConverter#viewToDom} method.
	 * Additionally this method adds block {@link engine.view.filler filler} to the list of children, if needed.
	 *
	 * @param {engine.view.Element|engine.view.DocumentFragment} viewElement Parent view element.
	 * @param {document} domDocument Document which will be used to create DOM nodes.
	 * @param {Object} options See {@link engine.view.DomConverter#viewToDom} options parameter.
	 * @returns {Iterable.<Node>} DOM nodes.
	 */
	*viewChildrenToDom( viewElement, domDocument, options = {} ) {
		let fillerPositionOffset = viewElement.getFillerOffset && viewElement.getFillerOffset();
		let offset = 0;

		for ( let childView of viewElement.getChildren() ) {
			if ( fillerPositionOffset === offset ) {
				yield this.blockFiller( domDocument );
			}

			yield this.viewToDom( childView, domDocument, options );

			offset++;
		}

		if ( fillerPositionOffset === offset ) {
			yield this.blockFiller( domDocument );
		}
	}

	/**
	 * Converts view {@link engine.view.Range} to DOM range.
	 * Inline and block {@link engine.view.filler fillers} are handled during the conversion.
	 *
	 * @param {engine.view.Range} viewRange View range.
	 * @returns {Range} DOM range.
	 */
	viewRangeToDom( viewRange ) {
		const domStart = this.viewPositionToDom( viewRange.start );
		const domEnd = this.viewPositionToDom( viewRange.end );

		const domRange = new Range();
		domRange.setStart( domStart.parent, domStart.offset );
		domRange.setEnd( domEnd.parent, domEnd.offset );

		return domRange;
	}

	/**
	 * Converts view {@link engine.view.Position} to DOM parent and offset.
	 *
	 * Inline and block {@link engine.view.filler fillers} are handled during the conversion.
	 * If the converted position is directly before inline filler it is moved inside the filler.
	 *
	 * @param {engine.view.position} viewPosition View position.
	 * @returns {Object} position
	 * @returns {Node} position.parent DOM position parent.
	 * @returns {Number} position.offset DOM position offset.
	 */
	viewPositionToDom( viewPosition ) {
		const viewParent = viewPosition.parent;

		if ( viewParent instanceof ViewText ) {
			const domParent = this.getCorrespondingDomText( viewParent );
			let offset = viewPosition.offset;

			if ( startsWithFiller( domParent ) ) {
				offset += INLINE_FILLER_LENGTH;
			}

			return { parent: domParent, offset: offset };
		}
		// viewParent instance of ViewElement.
		else {
			let domParent, domBefore, domAfter;

			if ( viewPosition.offset === 0 ) {
				domParent = this.getCorrespondingDom( viewPosition.parent );
				domAfter = domParent.childNodes[ 0 ];
			} else {
				domBefore = this.getCorrespondingDom( viewPosition.nodeBefore );
				domParent = domBefore.parentNode;
				domAfter = domBefore.nextSibling;
			}

			// If there is an inline filler at position return position inside the filler. We should never return
			// the position before the inline filler.
			if ( this.isText( domAfter ) && startsWithFiller( domAfter ) ) {
				return { parent: domAfter, offset: INLINE_FILLER_LENGTH };
			}

			const offset = domBefore ? indexOf( domBefore ) + 1 : 0;

			return { parent: domParent, offset: offset };
		}
	}

	/**
	 * Converts DOM to view. For all text nodes, not bound elements and document fragments new items will
	 * be created. For bound elements and document fragments function will return corresponding items. For
	 * {@link engine.view.filler fillers} `null` will be returned.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment to transform.
	 * @param {Object} [options] Conversion options.
	 * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
	 * @param {Boolean} [options.withChildren=true] If `true`, node's and document fragment's children will be converted too.
	 * @param {Boolean} [options.keepOriginalCase=false] If `false`, node's tag name will be converter to lower case.
	 * @returns {engine.view.Node|engine.view.DocumentFragment|null} Converted node or document fragment or `null`
	 * if DOM node is a {@link engine.view.filler filler}.
	 */
	domToView( domNode, options = {} ) {
		if ( isBlockFiller( domNode, this.blockFiller )  ) {
			return null;
		}

		if ( this.isText( domNode ) ) {
			if ( isInlineFiller( domNode ) ) {
				return null;
			} else {
				const textData = this._processDataFromDomText( domNode );

				return textData === '' ? null : new ViewText( textData );
			}
		} else {
			if ( this.getCorrespondingView( domNode ) ) {
				return this.getCorrespondingView( domNode );
			}

			let viewElement;

			if ( this.isDocumentFragment( domNode ) ) {
				// Create view document fragment.
				viewElement = new ViewDocumentFragment();

				if ( options.bind ) {
					this.bindDocumentFragments( domNode, viewElement );
				}
			} else {
				// Create view element.
				const viewName = options.keepOriginalCase ? domNode.tagName : domNode.tagName.toLowerCase();
				viewElement = new ViewElement( viewName );

				if ( options.bind ) {
					this.bindElements( domNode, viewElement );
				}

				// Copy element's attributes.
				const attrs = domNode.attributes;

				for ( let i = attrs.length - 1; i >= 0; i-- ) {
					viewElement.setAttribute( attrs[ i ].name, attrs[ i ].value );
				}
			}

			if ( options.withChildren || options.withChildren === undefined ) {
				for ( let child of this.domChildrenToView( domNode, options ) ) {
					viewElement.appendChildren( child );
				}
			}

			return viewElement;
		}
	}

	/**
	 * Converts children of the DOM element to view nodes using {@link engine.view.DomConverter#domToView} method.
	 * Additionally this method omits block {@link engine.view.filler filler}, if it exists in the DOM parent.
	 *
	 * @param {HTMLElement} domElement Parent DOM element.
	 * @param {Object} options See {@link engine.view.DomConverter#domToView} options parameter.
	 * @returns {Iterable.<engine.view.Node>} View nodes.
	 */
	*domChildrenToView( domElement, options = {} ) {
		for ( let i = 0; i < domElement.childNodes.length; i++ ) {
			const domChild = domElement.childNodes[ i ];
			const viewChild = this.domToView( domChild, options );

			if ( viewChild !== null ) {
				yield viewChild;
			}
		}
	}

	/**
	 * Converts DOM selection to view {@link engine.view.Selection}.
	 * Ranges which cannot be converted will be omitted.
	 *
	 * @param {Selection} domSelection DOM selection.
	 * @returns {engine.view.Selection} View selection.
	 */
	domSelectionToView( domSelection ) {
		const viewSelection = new ViewSelection();

		for ( let i = 0; i < domSelection.rangeCount; i++ ) {
			const domRange = domSelection.getRangeAt( i );
			const viewRange = this.domRangeToView( domRange );

			if ( viewRange ) {
				viewSelection.addRange( viewRange );
			}
		}

		return viewSelection;
	}

	/**
	 * Converts DOM Range to view {@link engine.view.range}.
	 * If the start or end position can not be converted `null` is returned.
	 *
	 * @param {Range} domRange DOM range.
	 * @returns {engine.view.Range|null} View range.
	 */
	domRangeToView( domRange ) {
		const viewStart = this.domPositionToView( domRange.startContainer, domRange.startOffset );
		const viewEnd = this.domPositionToView( domRange.endContainer, domRange.endOffset );

		if ( viewStart && viewEnd ) {
			return new ViewRange( viewStart, viewEnd );
		}

		return null;
	}

	/**
	 * Converts DOM parent and offset to view {@link engine.view.Position}.
	 *
	 * If the position is inside a {@link engine.view.filler filler} which has no corresponding view node,
	 * position of the filler will be converted and returned.
	 *
	 * If structures are too different and it is not possible to find corresponding position then `null` will be returned.
	 *
	 * @param {Node} domParent DOM position parent.
	 * @param {Number} domOffset DOM position offset.
	 * @returns {engine.view.Position} viewPosition View position.
	 */
	domPositionToView( domParent, domOffset ) {
		if ( isBlockFiller( domParent, this.blockFiller ) ) {
			return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
		}

		if ( this.isText( domParent ) ) {
			if ( isInlineFiller( domParent ) ) {
				return this.domPositionToView( domParent.parentNode, indexOf( domParent ) );
			}

			const viewParent = this.getCorrespondingViewText( domParent );
			let offset = domOffset;

			if ( !viewParent ) {
				return null;
			}

			if ( startsWithFiller( domParent ) ) {
				offset -= INLINE_FILLER_LENGTH;
				offset = offset < 0 ? 0 : offset;
			}

			return new ViewPosition( viewParent, offset );
		}
		// domParent instanceof HTMLElement.
		else {
			if ( domOffset === 0 ) {
				const viewParent = this.getCorrespondingView( domParent );

				if ( viewParent ) {
					return new ViewPosition( viewParent, 0 );
				}
			} else {
				const viewBefore = this.getCorrespondingView( domParent.childNodes[ domOffset - 1 ] );

				if ( viewBefore ) {
					return new ViewPosition( viewBefore.parent, viewBefore.index + 1 );
				}
			}

			return null;
		}
	}

	/**
	 * Gets corresponding view item. This function use
	 * {@link engine.view.DomConverter#getCorrespondingViewElement getCorrespondingViewElement}
	 * for elements, {@link  engine.view.DomConverter#getCorrespondingViewText getCorrespondingViewText} for text
	 * nodes and {@link engine.view.DomConverter#getCorrespondingViewDocumentFragment getCorrespondingViewDocumentFragment}
	 * for document fragments.
	 *
	 * Note that for the block or inline {@link engine.view.filler filler} this method returns `null`.
	 *
	 * @param {Node|DocumentFragment} domNode DOM node or document fragment.
	 * @returns {engine.view.Node|engine.view.DocumentFragment|null} Corresponding view item.
	 */
	getCorrespondingView( domNode ) {
		if ( this.isElement( domNode ) ) {
			return this.getCorrespondingViewElement( domNode );
		} else if ( this.isDocumentFragment( domNode ) ) {
			return this.getCorrespondingViewDocumentFragment( domNode );
		} else if ( this.isText( domNode ) ) {
			return this.getCorrespondingViewText( domNode );
		}

		return null;
	}

	/**
	 * Gets corresponding view element. Returns element if an view element was
	 * {@link engine.view.DomConverter#bindElements bound} to the given DOM element or `null` otherwise.
	 *
	 * @param {HTMLElement} domElement DOM element.
	 * @returns {engine.view.Element|null} Corresponding element or `null` if no element was bound.
	 */
	getCorrespondingViewElement( domElement ) {
		return this._domToViewMapping.get( domElement );
	}

	/**
	 * Gets corresponding view document fragment. Returns document fragment if an view element was
	 * {@link engine.view.DomConverter#bindDocumentFragments bound} to the given DOM fragment or `null` otherwise.
	 *
	 * @param {DocumentFragment} domFragment DOM element.
	 * @returns {engine.view.DocumentFragment|null} Corresponding document fragment or `null` if none element was bound.
	 */
	getCorrespondingViewDocumentFragment( domFragment ) {
		return this._domToViewMapping.get( domFragment );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link engine.view.DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link engine.view.DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link engine.view.DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise `null` is returned.
	 *
	 * Note that for the block or inline {@link engine.view.filler filler} this method returns `null`.
	 *
	 * @param {Text} domText DOM text node.
	 * @returns {engine.view.Text|null} Corresponding view text node or `null`, if it was not possible to find a
	 * corresponding node.
	 */
	getCorrespondingViewText( domText ) {
		if ( isInlineFiller( domText ) ) {
			return null;
		}

		const previousSibling = domText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling ) {
			if ( !( this.isElement( previousSibling ) ) ) {
				// The previous is text or comment.
				return null;
			}

			const viewElement = this.getCorrespondingViewElement( previousSibling );

			if ( viewElement ) {
				const nextSibling = viewElement.nextSibling;

				// It might be filler which has no corresponding view node.
				if ( nextSibling instanceof ViewText ) {
					return viewElement.nextSibling;
				} else {
					return null;
				}
			}
		}
		// Try to use parent to find the corresponding text node.
		else {
			const viewElement = this.getCorrespondingViewElement( domText.parentNode );

			if ( viewElement ) {
				const firstChild = viewElement.getChild( 0 );

				// It might be filler which has no corresponding view node.
				if ( firstChild instanceof ViewText ) {
					return firstChild;
				} else {
					return null;
				}
			}
		}

		return null;
	}

	/**
	 * Gets corresponding DOM item. This function uses
	 * {@link engine.view.DomConverter#getCorrespondingDomElement getCorrespondingDomElement} for
	 * elements, {@link engine.view.DomConverter#getCorrespondingDomText getCorrespondingDomText} for text nodes
	 * and {@link engine.view.DomConverter#getCorrespondingDomDocumentFragment getCorrespondingDomDocumentFragment}
	 * for document fragments.
	 *
	 * @param {engine.view.Node|engine.view.DocumentFragment} viewNode View node or document fragment.
	 * @returns {Node|DocumentFragment|null} Corresponding DOM node or document fragment.
	 */
	getCorrespondingDom( viewNode ) {
		if ( viewNode instanceof ViewElement ) {
			return this.getCorrespondingDomElement( viewNode );
		} else if ( viewNode instanceof ViewDocumentFragment ) {
			return this.getCorrespondingDomDocumentFragment( viewNode );
		} else if ( viewNode instanceof ViewText ) {
			return this.getCorrespondingDomText( viewNode );
		}

		return null;
	}

	/**
	 * Gets corresponding DOM element. Returns element if an DOM element was
	 * {@link engine.view.DomConverter#bindElements bound} to the given view element or `null` otherwise.
	 *
	 * @param {engine.view.Element} viewElement View element.
	 * @returns {HTMLElement|null} Corresponding element or `null` if none element was bound.
	 */
	getCorrespondingDomElement( viewElement ) {
		return this._viewToDomMapping.get( viewElement );
	}

	/**
	 * Gets corresponding DOM document fragment. Returns document fragment if an DOM element was
	 * {@link engine.view.DomConverter#bindDocumentFragments bound} to the given view document fragment or `null` otherwise.
	 *
	 * @param {engine.view.DocumentFragment} viewDocumentFragment View document fragment.
	 * @returns {DocumentFragment|null} Corresponding document fragment or `null` if no fragment was bound.
	 */
	getCorrespondingDomDocumentFragment( viewDocumentFragment ) {
		return this._viewToDomMapping.get( viewDocumentFragment );
	}

	/**
	 * Gets corresponding text node. Text nodes are not {@link engine.view.DomConverter#bindElements bound},
	 * corresponding text node is returned based on the sibling or parent.
	 *
	 * If the directly previous sibling is a {@link engine.view.DomConverter#bindElements bound} element, it is used
	 * to find the corresponding text node.
	 *
	 * If this is a first child in the parent and the parent is a {@link engine.view.DomConverter#bindElements bound}
	 * element, it is used to find the corresponding text node.
	 *
	 * Otherwise `null` is returned.
	 *
	 * @param {engine.view.Text} viewText View text node.
	 * @returns {Text|null} Corresponding DOM text node or `null`, if it was not possible to find a corresponding node.
	 */
	getCorrespondingDomText( viewText ) {
		const previousSibling = viewText.previousSibling;

		// Try to use previous sibling to find the corresponding text node.
		if ( previousSibling && this.getCorrespondingDom( previousSibling ) ) {
			return this.getCorrespondingDom( previousSibling ).nextSibling;
		}

		// If this is a first node, try to use parent to find the corresponding text node.
		if ( !previousSibling && viewText.parent && this.getCorrespondingDom( viewText.parent ) ) {
			return this.getCorrespondingDom( viewText.parent ).childNodes[ 0 ];
		}

		return null;
	}

	/**
	 * Focuses DOM editable that is corresponding to provided {@link engine.view.EditableElement EditableElement}.
	 *
	 * @param {engine.view.EditableElement} viewEditable
	 */
	focus( viewEditable ) {
		const domEditable = this.getCorrespondingDomElement( viewEditable );

		if ( domEditable && domEditable.ownerDocument.activeElement !== domEditable ) {
			domEditable.focus();
		}
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.TEXT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isText( node ) {
		return node && node.nodeType == Node.TEXT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.ELEMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isElement( node ) {
		return node && node.nodeType == Node.ELEMENT_NODE;
	}

	/**
	 * Returns `true` when `node.nodeType` equals `Node.DOCUMENT_FRAGMENT_NODE`.
	 *
	 * @param {Node} node Node to check.
	 * @returns {Boolean}
	 */
	isDocumentFragment( node ) {
		return node && node.nodeType == Node.DOCUMENT_FRAGMENT_NODE;
	}

	/**
	 * Takes text data from given {@link engine.view.Text#data} and processes it so it is correctly displayed in DOM.
	 *
	 * Following changes are done:
	 * * multiple spaces are replaced to a chain of spaces and `&nbsp;`,
	 * * space at the beginning of the text node is changed to `&nbsp;` if it is a first text node in it's container
	 * element or if previous text node ends by space character,
	 * * space at the end of the text node is changed to `&nbsp;` if it is a last text node in it's container.
	 *
	 * @private
	 * @param {engine.view.Text} node View text node to process.
	 * @returns {String} Processed text data.
	 */
	_processDataFromViewText( node ) {
		let data = node.data;

		// If any of node ancestors has a name which is in `preNodes` array, then currently processed
		// view text node is (will be) in preformatted element. We should not change whitespaces then.
		if ( node.getAncestors().some( ( parent ) => this.preNodes.includes( parent.name ) ) )  {
			return data;
		}

		const prevNode = this._getTouchingViewTextNode( node, false );
		const nextNode = this._getTouchingViewTextNode( node, true );

		// If previous text node does not exist or it ends by space character...
		if ( !prevNode || prevNode.data.charAt( prevNode.data.length - 1 ) == ' ' ) {
			// Replace space character at the beginning of this string by &nbsp;.
			data = data.replace( /^ /, '\u00A0' );
		}

		// If next text node does not exist...
		if ( !nextNode ) {
			// Replace space character at the end of this string by &nbsp;.
			data = data.replace( / $/, '\u00A0' );
		}
		// If the text node exist, it will be later processed too.

		// Multiple spaces.
		data = data.replace( /  /g, ' \u00A0' );

		return data;
	}

	/**
	 * Helper function. For given {@link engine.view.Text view text node}, it finds previous or next sibling that is contained
	 * in the same block element. If there is no such sibling, `null` is returned.
	 *
	 * @private
	 * @param {engine.view.Text} node
	 * @param {Boolean} getNext
	 * @returns {engine.view.Text}
	 */
	_getTouchingViewTextNode( node, getNext ) {
		if ( !node.parent ) {
			return null;
		}

		const treeWalker = new ViewTreeWalker( {
			startPosition: getNext ? ViewPosition.createAfter( node ) : ViewPosition.createBefore( node ),
			direction: getNext ? 'forward' : 'backward'
		} );

		for ( let value of treeWalker ) {
			if ( value.item instanceof ViewContainerElement ) {
				// ViewContainerElement is found on a way to next ViewText node, so given `node` was first/last
				// text node in it's container element.
				return null;
			} else if ( value.item instanceof ViewText ) {
				// Found a text node in the same container element.
				return value.item;
			}
		}

		return null;
	}

	/**
	 * Takes text data from native `Text` node and processes it to a correct {@link engine.view.Text view text node} data.
	 *
	 * Following changes are done:
	 * * multiple whitespaces are replaced to a single space,
	 * * space at the beginning of the text node is removed, if it is a first text node in it's container
	 * element or if previous text node ends by space character,
	 * * space at the end of the text node is removed, if it is a last text node in it's container.
	 *
	 * @param {Node} node DOM text node to process.
	 * @returns {String} Processed data.
	 * @private
	 */
	_processDataFromDomText( node ) {
		let data = getDataWithoutFiller( node );

		if ( _hasDomParentOfType( node, this.preNodes ) ) {
			return data;
		}

		data = data.replace( /\s{2,}/g, ' ' );

		const prevNode = this._getTouchingDomTextNode( node, false );
		const nextNode = this._getTouchingDomTextNode( node, true );

		// If previous text node does not exist or it ends by space character...
		if ( !prevNode || prevNode.data.charAt( prevNode.data.length - 1 ) == ' ' ) {
			// Remove space character from the beginning of this string.
			data = data.replace( /^ /, '' );
		}

		// If next text node does not exist...
		if ( !nextNode ) {
			// Remove space character from the end of this string.
			data = data.replace( / $/, '' );
		}
		// If the text node exist, it will be later processed too.

		return data;
	}

	/**
	 * Helper function. For given `Text` node, it finds previous or next sibling that is contained in the same block element.
	 * If there is no such sibling, `null` is returned.
	 *
	 * @private
	 * @param {Text} node
	 * @param {Boolean} getNext
	 * @returns {Text|null}
	 */
	_getTouchingDomTextNode( node, getNext ) {
		if ( !node.parentNode ) {
			return null;
		}

		const direction = getNext ? 'nextNode' : 'previousNode';
		const document = node.ownerDocument;
		const treeWalker = document.createTreeWalker( document.childNodes[ 0 ], NodeFilter.SHOW_TEXT );

		treeWalker.currentNode = node;

		const touchingNode = treeWalker[ direction ]();

		if ( touchingNode !== null ) {
			const lca = getCommonAncestor( node, touchingNode );

			// If there is common ancestor between the text node and next/prev text node,
			// and there are no block elements on a way from the text node to that ancestor,
			// and there are no block elements on a way from next/prev text node to that ancestor...
			if ( lca && !_hasDomParentOfType( node, this.blockNodes, lca ) && !_hasDomParentOfType( touchingNode, this.blockNodes, lca ) ) {
				// Then they are in the same container element.
				return touchingNode;
			}
		}

		return null;
	}
}

// Helper function.
// Used to check if given native `Element` or `Text` node has parent with tag name from `types` array.
// Option `boundaryParent` can be given if parents should be checked up to a given element (excluding that element).
// Returns `true` if such parent exists or `false` if it does not.
function _hasDomParentOfType( node, types, boundaryParent ) {
	let parents = getAncestors( node );

	if ( boundaryParent ) {
		parents = parents.slice( parents.indexOf( boundaryParent ) + 1 );
	}

	return parents.some( ( parent ) => parent.tagName && types.includes( parent.tagName.toLowerCase() ) );
}
