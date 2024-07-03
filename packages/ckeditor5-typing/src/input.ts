/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/input
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { DomEmitterMixin, env, global } from '@ckeditor/ckeditor5-utils';

import InsertTextCommand, { type InsertTextCommandOptions } from './inserttextcommand.js';
import InsertTextObserver, { type ViewDocumentInsertTextEvent } from './inserttextobserver.js';

import {
	LiveRange,
	CompositionObserver,
	type Model,
	type Mapper,
	type Element,
	type Range,
	type ViewNode,
	type ViewElement,
	type MutationData,
	type ViewDocumentCompositionStartEvent,
	type ViewDocumentCompositionEndEvent,
	type ViewDocumentKeyDownEvent,
	type ViewDocumentMutationsEvent,
	type DocumentChangeEvent,
	type MapperModelToViewPositionEvent,
	type Selection
} from '@ckeditor/ckeditor5-engine';

import { debounce } from 'lodash-es';

/**
 * Handles text input coming from the keyboard or other input methods.
 */
export default class Input extends Plugin {
	/**
	 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
	 */
	private _compositionQueue!: CompositionQueue;

	/**
	 * TODO
	 */
	private _lastEditBlock: Element | null = null;

	/**
	 * TODO
	 */
	private _lastSelection: Selection | null = null;

	/**
	 * TODO
	 */
	private _editContext: any = null;

	/**
	 * TODO
	 */
	private _domEmitter = new ( DomEmitterMixin() )();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Input' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;
		const mapper = editor.editing.mapper;
		const modelSelection = model.document.selection;

		this._compositionQueue = new CompositionQueue( editor );

		view.addObserver( InsertTextObserver );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.
		const insertTextCommand = new InsertTextCommand( editor, editor.config.get( 'typing.undoStep' ) || 20 );

		// Register `insertText` command and add `input` command as an alias for backward compatibility.
		editor.commands.add( 'insertText', insertTextCommand );
		editor.commands.add( 'input', insertTextCommand );

		this.listenTo<ViewDocumentInsertTextEvent>( view.document, 'insertText', ( evt, data ) => {
			// Rendering is disabled while composing so prevent events that will be rendered by the engine
			// and should not be applied by the browser.
			if ( !view.document.isComposing ) {
				data.preventDefault();
			}

			// Flush queue on the next beforeinput event because it could happen
			// that the mutation observer does not notice the DOM change in time.
			if ( env.isAndroid && view.document.isComposing ) {
				this._compositionQueue.flush( 'next beforeinput' );
			}

			const { text, selection: viewSelection } = data;

			let modelRanges;

			// If view selection was specified, translate it to model selection.
			if ( viewSelection ) {
				modelRanges = Array.from( viewSelection.getRanges() ).map( viewRange => mapper.toModelRange( viewRange ) );
			}
			else {
				modelRanges = Array.from( modelSelection.getRanges() );
			}

			let insertText = text;

			// Typing in English on Android is firing composition events for the whole typed word.
			// We need to check the target range text to only apply the difference.
			if ( env.isAndroid ) {
				const selectedText = Array.from( modelRanges[ 0 ].getItems() ).reduce( ( rangeText, node ) => {
					return rangeText + ( node.is( '$textProxy' ) ? node.data : '' );
				}, '' );

				if ( selectedText ) {
					if ( selectedText.length <= insertText.length ) {
						if ( insertText.startsWith( selectedText ) ) {
							insertText = insertText.substring( selectedText.length );
							( modelRanges[ 0 ] as any ).start = modelRanges[ 0 ].start.getShiftedBy( selectedText.length );
						}
					} else {
						if ( selectedText.startsWith( insertText ) ) {
							// TODO this should be mapped as delete?
							( modelRanges[ 0 ] as any ).start = modelRanges[ 0 ].start.getShiftedBy( insertText.length );
							insertText = '';
						}
					}
				}

				if ( insertText.length == 0 && modelRanges[ 0 ].isCollapsed ) {
					// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
					// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Ignore insertion of an empty data to the collapsed range.',
					// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-style: italic'
					// @if CK_DEBUG_TYPING // 	);
					// @if CK_DEBUG_TYPING // }

					return;
				}
			}

			const commandData: InsertTextCommandOptions = {
				text: insertText,
				selection: model.createSelection( modelRanges )
			};

			// This is a composition event and those are not cancellable, so we need to wait until browser updates the DOM
			// and we could apply changes to the model and verify if the DOM is valid.
			// The browser applies changes to the DOM not immediately on beforeinput event.
			// We just wait for mutation observer to notice changes or as a fallback a timeout.
			if ( env.isAndroid && view.document.isComposing ) {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( `%c[Input]%c Queue insertText:%c "${ commandData.text }"%c ` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]` +
				// @if CK_DEBUG_TYPING // 		` queue size: ${ this._compositionQueue.length + 1 }`,
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold', 'color: blue', ''
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				this._compositionQueue.push( commandData );
			} else {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( `%c[Input]%c Execute insertText:%c "${ commandData.text }"%c ` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]`,
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold', 'color: blue', ''
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				editor.execute( 'insertText', commandData );
				view.scrollToTheSelection();
			}
		} );

		// Delete selected content on composition start.
		if ( env.isAndroid ) {
			// On Android with English keyboard, the composition starts just by putting caret
			// at the word end or by selecting a table column. This is not a real composition started.
			// Trigger delete content on first composition key pressed.
			this.listenTo<ViewDocumentKeyDownEvent>( view.document, 'keydown', ( evt, data ) => {
				if ( modelSelection.isCollapsed || data.keyCode != 229 || !view.document.isComposing ) {
					return;
				}

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	const firstPositionPath = modelSelection.getFirstPosition()!.path;
				// @if CK_DEBUG_TYPING // 	const lastPositionPath = modelSelection.getLastPosition()!.path;

				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c KeyDown 229%c -> model.deleteContent() ' +
				// @if CK_DEBUG_TYPING // 		`[${ firstPositionPath }]-[${ lastPositionPath }]`,
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold', '',
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				deleteSelectionContent( model, insertTextCommand );
			} );
		} else {
			// Note: The priority must precede the CompositionObserver handler to call it before
			// the renderer is blocked, because we want to render this change.
			this.listenTo<ViewDocumentCompositionStartEvent>( view.document, 'compositionstart', () => {
				if ( modelSelection.isCollapsed ) {
					return;
				}

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	const firstPositionPath = modelSelection.getFirstPosition()!.path;
				// @if CK_DEBUG_TYPING // 	const lastPositionPath = modelSelection.getLastPosition()!.path;

				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Composition start%c -> model.deleteContent() ' +
				// @if CK_DEBUG_TYPING // 		`[${ firstPositionPath }]-[${ lastPositionPath }]`,
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold', '',
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				deleteSelectionContent( model, insertTextCommand );
			} );
		}

		// Apply composed changes to the model.
		if ( env.isAndroid ) {
			// Apply changes to the model as they are applied to the DOM by the browser.
			// On beforeinput event, the DOM is not yet modified. We wait for detected mutations to apply model changes.
			this.listenTo<ViewDocumentMutationsEvent>( view.document, 'mutations', ( evt, { mutations } ) => {
				if ( !view.document.isComposing ) {
					return;
				}

				// Check if mutations are relevant for queued changes.
				for ( const { node } of mutations ) {
					const viewElement = findMappedViewAncestor( node, mapper );
					const modelElement = mapper.toModelElement( viewElement )!;

					if ( this._compositionQueue.isComposedElement( modelElement ) ) {
						this._compositionQueue.flush( 'mutations' );

						return;
					}
				}

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Mutations not related to the composition.',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-style: italic'
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }
			} );

			// Make sure that all changes are applied to the model before the end of composition.
			this.listenTo<ViewDocumentCompositionEndEvent>( view.document, 'compositionend', () => {
				this._compositionQueue.flush( 'composition end' );
			} );

			// Trigger mutations check after the composition completes to fix all DOM changes that got ignored during composition.
			// On Android the Renderer is not disabled while composing. While updating DOM nodes we ignore some changes
			// that are not that important (like NBSP vs plain space character) and could break the composition flow.
			// After composition is completed we trigger additional `mutations` event for elements affected by the composition
			// so the Renderer can adjust the DOM to the expected structure without breaking the composition.
			this.listenTo<ViewDocumentCompositionEndEvent>( view.document, 'compositionend', () => {
				const mutations: Array<MutationData> = [];

				for ( const element of this._compositionQueue.flushComposedElements() ) {
					const viewElement = mapper.toViewElement( element );

					if ( !viewElement ) {
						continue;
					}

					mutations.push( { type: 'children', node: viewElement } );
				}

				if ( mutations.length ) {
					// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
					// @if CK_DEBUG_TYPING // 	console.group( '%c[Input]%c Fire post-composition mutation fixes.',
					// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green', 'font-weight: bold', ''
					// @if CK_DEBUG_TYPING // 	);
					// @if CK_DEBUG_TYPING // }

					view.document.fire<ViewDocumentMutationsEvent>( 'mutations', { mutations } );

					// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
					// @if CK_DEBUG_TYPING // 	console.groupEnd();
					// @if CK_DEBUG_TYPING // }
				}
			}, { priority: 'lowest' } );
		} else {
			// After composition end we need to verify if there are no left-overs.
			// Listening at the lowest priority so after the `InsertTextObserver` added above (all composed text
			// should already be applied to the model, view, and DOM).
			// On non-Android the `Renderer` is blocked while user is composing but the `MutationObserver` still collects
			// mutated nodes and fires `mutations` events.
			// Those events are recorded by the `Renderer` but not applied to the DOM while composing.
			// We need to trigger those checks (and fixes) once again but this time without specifying the exact mutations
			// since they are already recorded by the `Renderer`.
			// It in the most cases just clears the internal record of mutated text nodes
			// since all changes should already be applied to the DOM.
			// This is especially needed when user cancels composition, so we can clear nodes marked to sync.
			this.listenTo<ViewDocumentCompositionEndEvent>( view.document, 'compositionend', () => {
				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.group( '%c[Input]%c Force render after composition end.',
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green', 'font-weight: bold', ''
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				view.document.fire<ViewDocumentMutationsEvent>( 'mutations', { mutations: [] } );

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.groupEnd();
				// @if CK_DEBUG_TYPING // }
			}, { priority: 'lowest' } );
		}

		// The EditContext support starts here.
		if ( env.features.isEditContextSupported ) {
			this.listenTo<DocumentChangeEvent>( model.document, 'change', () => {
				const changes = model.document.differ.getChanges();
				const selection = model.document.selection;
				const selectionParent = selection.getFirstPosition()!.parent as Element;
				let updateEditBlock = false;

				if ( selectionParent != this._lastEditBlock ) {
					updateEditBlock = true;
				} else if ( this._lastSelection && !this._lastSelection.isEqual( selection ) ) {
					updateEditBlock = true;
				} else {
					for ( const change of changes ) {
						if ( change.type != 'insert' && change.type != 'remove' ) {
							continue;
						}

						if ( change.position.parent != this._lastEditBlock ) {
							updateEditBlock = true;
						}
					}
				}

				if ( !updateEditBlock ) {
					return;
				}

				const text = Array.from( selectionParent.getChildren() )
					.reduce( ( rangeText, element ) => rangeText + ( element.is( '$text' ) ? element.data : ' ' ), '' );

				const editableElement = editor.editing.view.document.selection.editableElement;

				// TODO EditContext does not accept figcaption or td - DOM throws that it is not supported
				// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/editContext#possible_elements
				// The figcaption or td/th won't work (nested editables, contenteditable=false & tabindex=-1 is blocking it).
				// Using dedicated div element as edit context host.
				// On Android it falls back to the beforeinput insertCompositionText and handles typing but without EditContext.
				const editContextHostElement = getEditContextHostElement( editableElement );

				this._lastEditBlock = selectionParent;
				this._lastSelection = model.createSelection( selection );

				if ( !editContextHostElement ) {
					// TODO
					throw new Error( 'Should not be possible' );
				}

				const domElement = editor.editing.view.domConverter.mapViewToDom( editContextHostElement );

				if ( !domElement ) {
					// TODO
					throw new Error( 'We do not have DOM element' );
				}

				if ( !this._editContext ) {
					this._editContext = this._createEditContext();

					( domElement as any ).editContext = this._editContext;
				}
				else if ( !( domElement as any ).editContext ) {
					for ( const domElement of this._editContext.attachedElements() ) {
						( domElement as any ).editContext = null;
					}

					( domElement as any ).editContext = this._editContext;
				}

				const viewRoot = editor.editing.view.document.selection.getFirstPosition()!.root as ViewElement;
				const domRoot = editor.editing.view.domConverter.mapViewToDom( viewRoot );

				if ( domRoot ) {
					// TODO this must be updated to page zoom
					this._editContext.updateControlBounds( domRoot.getBoundingClientRect() );
				} else {
					// TODO
					throw new Error( 'No DOM root' );
				}

				// TODO this probably should be granular

				if ( this._editContext.text != text ) {
					console.log( 'EditContext update text', text );
					this._editContext.updateText( 0, this._editContext.text.length, text );
				}

				const modelSelectionStartOffset = modelSelection.getFirstPosition()!.offset;
				const modelSelectionEndOffset = modelSelection.getLastPosition()!.offset;

				if (
					this._editContext.selectionStart != modelSelectionStartOffset ||
					this._editContext.selectionEnd != modelSelectionEndOffset
				) {
					console.log( 'EditContext update selection', modelSelectionStartOffset, modelSelectionEndOffset );
					this._editContext.updateSelection( modelSelectionStartOffset, modelSelectionEndOffset );

					const viewSelectionRange = editor.editing.view.document.selection.getFirstRange();

					if ( viewSelectionRange ) {
						const domSelectionRange = editor.editing.view.domConverter.viewRangeToDom( viewSelectionRange );

						// TODO this must be updated to page zoom
						this._editContext.updateSelectionBounds( domSelectionRange.getBoundingClientRect() );
					} else {
						// TODO
						console.warn( 'No dom selection range' );
					}
				}
			}, { priority: 'lowest' } ); // TODO describe: after changed DOM

			editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', ( evt, data ) => {
				const mapper = data.mapper;

				if ( data.viewPosition ) {
					return;
				}

				const viewElement = mapper.toViewElement( data.modelPosition.parent as Element );
				const editContextHostElement = getEditContextHostElement( viewElement );

				if ( !editContextHostElement || editContextHostElement == viewElement ) {
					return;
				}

				data.viewPosition = mapper.findPositionIn( editContextHostElement, data.modelPosition.offset );
			} );
		}
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._compositionQueue.destroy();

		if ( this._editContext ) {
			this.editor.editing.view.getObserver( CompositionObserver ).stopObserving( this._editContext );
			this._domEmitter.stopListening( this._editContext );

			for ( const domElement of this._editContext.attachedElements() ) {
				( domElement as any ).editContext = null;
			}
		}
	}

	/**
	 * TODO
	 */
	private _createEditContext() {
		const editor = this.editor;
		const model = editor.model;

		const editContext = new ( window as any ).EditContext();

		editor.editing.view.getObserver( CompositionObserver ).observe( editContext );

		this._domEmitter.listenTo( editContext, 'textupdate', ( evt, domEvent: any ) => {
			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.group( `%c[Input]%c EditContext "textupdate".`,
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold'
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }

			console.log(
				`The user entered the text: ${ _escapeTextNodeData( domEvent.text ) } ` +
				`at [${ domEvent.updateRangeStart } - ${ domEvent.updateRangeEnd }] offset.` +
				`Selection: [${ domEvent.selectionStart } - ${ domEvent.selectionEnd }] offset`
			);

			const commandData = {
				text: domEvent.text,
				selection: model.createSelection(
					model.createRange(
						model.createPositionAt( this._lastEditBlock!, domEvent.updateRangeStart ),
						model.createPositionAt( this._lastEditBlock!, domEvent.updateRangeEnd )
					)
				)
			};

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.log( `%c[Input]%c Execute insertText:%c "${ commandData.text }"%c ` +
			// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
			// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]`,
			// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold', 'color: blue', ''
			// @if CK_DEBUG_TYPING // 	);
			// @if CK_DEBUG_TYPING // }

			editor.execute( 'insertText', commandData );

			// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
			// @if CK_DEBUG_TYPING // 	console.groupEnd();
			// @if CK_DEBUG_TYPING // }
		} );

		this._domEmitter.listenTo( editContext, 'characterboundsupdate', ( evt, domEvent: any ) => {
			console.log( 'EditContext characterboundsupdate event', domEvent.rangeStart, domEvent.rangeEnd );

			const modelRange = model.createRange(
				model.createPositionAt( this._lastEditBlock!, domEvent.rangeStart ),
				model.createPositionAt( this._lastEditBlock!, domEvent.rangeEnd )
			);

			const charBounds = [];

			for ( const item of modelRange.getItems( { singleCharacters: true, shallow: true } ) ) {
				if ( !item.is( '$textProxy' ) ) {
					continue;
				}

				const modelRange = model.createRangeOn( item );
				const viewRange = editor.editing.mapper.toViewRange( modelRange );
				const domRange = editor.editing.view.domConverter.viewRangeToDom( viewRange );

				charBounds.push( domRange.getBoundingClientRect() );
			}

			console.log( 'EditContext call updateCharacterBounds:', domEvent.rangeStart, charBounds );
			editContext.updateCharacterBounds( domEvent.rangeStart, charBounds );
		} );

		this._domEmitter.listenTo( editContext, 'textformatupdate', ( evt, domEvent: any ) => {
			// TODO
			console.log( 'EditContext textformatupdate event', domEvent.getTextFormats() );
		} );

		return editContext;
	}
}

/**
 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
 */
class CompositionQueue {
	/**
	 * The editor instance.
	 */
	public editor: Editor;

	/**
	 * Debounced queue flush as a safety mechanism for cases of mutation observer not triggering.
	 */
	public flushDebounced = debounce( () => this.flush( 'timeout' ), 50 );

	/**
	 * The queue of `insertText` command executions that are waiting for the DOM to get updated after beforeinput event.
	 */
	private _queue: Array<InsertTextCommandLiveOptions> = [];

	/**
	 * A set of model elements. The composition happened in those elements. It's used for mutations check.
	 */
	private _compositionElements = new Set<Element>();

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		this.editor = editor;
	}

	/**
	 * Destroys the helper object.
	 */
	public destroy(): void {
		this.flushDebounced.cancel();
		this._compositionElements.clear();

		while ( this._queue.length ) {
			this.shift();
		}
	}

	/**
	 * Returns the size of the queue.
	 */
	public get length(): number {
		return this._queue.length;
	}

	/**
	 * Push next insertText command data to the queue.
	 */
	public push( commandData: InsertTextCommandOptions ): void {
		const commandLiveData: InsertTextCommandLiveOptions = {
			text: commandData.text
		};

		if ( commandData.selection ) {
			commandLiveData.selectionRanges = [];

			for ( const range of commandData.selection.getRanges() ) {
				commandLiveData.selectionRanges.push( LiveRange.fromRange( range ) );

				// Keep reference to the model element for later mutation checks.
				this._compositionElements.add( range.start.parent as Element );
			}
		}

		this._queue.push( commandLiveData );
		this.flushDebounced();
	}

	/**
	 * Shift the first item from the insertText command data queue.
	 */
	public shift(): InsertTextCommandOptions {
		const commandLiveData = this._queue.shift()!;
		const commandData: InsertTextCommandOptions = {
			text: commandLiveData.text
		};

		if ( commandLiveData.selectionRanges ) {
			const ranges = commandLiveData.selectionRanges
				.map( liveRange => detachLiveRange( liveRange ) )
				.filter( ( range ): range is Range => !!range );

			if ( ranges.length ) {
				commandData.selection = this.editor.model.createSelection( ranges );
			}
		}

		return commandData;
	}

	/**
	 * Applies all queued insertText command executions.
	 *
	 * @param reason Used only for debugging.
	 */
	public flush( reason: string ): void { // eslint-disable-line @typescript-eslint/no-unused-vars
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;

		this.flushDebounced.cancel();

		if ( !this._queue.length ) {
			return;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.group( `%c[Input]%c Flush insertText queue on ${ reason }.`,
		// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold'
		// @if CK_DEBUG_TYPING // 	);
		// @if CK_DEBUG_TYPING // }

		const insertTextCommand = editor.commands.get( 'insertText' )!;
		const buffer = insertTextCommand.buffer;

		model.enqueueChange( buffer.batch, () => {
			buffer.lock();

			while ( this._queue.length ) {
				const commandData = this.shift();

				// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
				// @if CK_DEBUG_TYPING // 	console.log( '%c[Input]%c Execute queued insertText:%c ' +
				// @if CK_DEBUG_TYPING // 		`"${ commandData.text }"%c ` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getFirstPosition().path }]-` +
				// @if CK_DEBUG_TYPING // 		`[${ commandData.selection.getLastPosition().path }]`,
				// @if CK_DEBUG_TYPING // 		'font-weight: bold; color: green;', 'font-weight: bold', 'color: blue', ''
				// @if CK_DEBUG_TYPING // 	);
				// @if CK_DEBUG_TYPING // }

				editor.execute( 'insertText', commandData );
			}

			buffer.unlock();
		} );

		view.scrollToTheSelection();

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.groupEnd();
		// @if CK_DEBUG_TYPING // }
	}

	/**
	 * Returns `true` if the given model element is related to recent composition.
	 */
	public isComposedElement( element: Element ): boolean {
		return this._compositionElements.has( element );
	}

	/**
	 * Returns an array of composition-related elements and clears the internal list.
	 */
	public flushComposedElements(): Array<Element> {
		const result = Array.from( this._compositionElements );

		this._compositionElements.clear();

		return result;
	}
}

/**
 * Deletes the content selected by the document selection at the start of composition.
 */
function deleteSelectionContent( model: Model, insertTextCommand: InsertTextCommand ): void {
	// By relying on the state of the input command we allow disabling the entire input easily
	// by just disabling the input command. We could’ve used here the delete command but that
	// would mean requiring the delete feature which would block loading one without the other.
	// We could also check the editor.isReadOnly property, but that wouldn't allow to block
	// the input without blocking other features.
	if ( !insertTextCommand.isEnabled ) {
		return;
	}

	const buffer = insertTextCommand.buffer;

	buffer.lock();

	model.enqueueChange( buffer.batch, () => {
		model.deleteContent( model.document.selection );
	} );

	buffer.unlock();
}

/**
 * Detaches a LiveRange and returns the static range from it.
 */
function detachLiveRange( liveRange: LiveRange ): Range | null {
	const range = liveRange.toRange();

	liveRange.detach();

	if ( range.root.rootName == '$graveyard' ) {
		return null;
	}

	return range;
}

/**
 * For the given `viewNode`, finds and returns the closest ancestor of this node that has a mapping to the model.
 */
function findMappedViewAncestor( viewNode: ViewNode, mapper: Mapper ): ViewElement {
	let node = ( viewNode.is( '$text' ) ? viewNode.parent : viewNode ) as ViewElement;

	while ( !mapper.toModelElement( node ) ) {
		node = node.parent as ViewElement;
	}

	return node;
}

/**
 * The insertText command data stored as LiveRange-s.
 */
type InsertTextCommandLiveOptions = {
	text?: string;
	selectionRanges?: Array<LiveRange>;
};

function _escapeTextNodeData( text: string ) {
	const escapedText = text
		.replace( /&/g, '&amp;' )
		.replace( /\u00A0/g, '&nbsp;' )
		.replace( /\u2060/g, '&NoBreak;' );

	return `"${ escapedText }"`;
}

/**
 * TODO
 */
function getEditContextHostElement( viewElement?: ViewElement | null ) {
	if ( !viewElement || viewElement.childCount == 0 || !viewElement.is( 'editableElement' ) ) {
		return viewElement;
	}

	const viewFirstChildElement = viewElement.getChild( 0 )!;

	if ( !viewFirstChildElement.is( 'element' ) || !viewFirstChildElement.getAttribute( 'data-ck-editcontext' ) ) {
		return viewElement;
	}

	return viewFirstChildElement;
}
