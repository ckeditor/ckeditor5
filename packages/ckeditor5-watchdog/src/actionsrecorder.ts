/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// eslint-disable-next-line ckeditor5-rules/no-cross-package-imports
import {
	Plugin,
	type Command,
	type Editor
} from '@ckeditor/ckeditor5-core';

import type {
	ModelDocumentSelection,
	ModelSelection,
	Marker
} from '@ckeditor/ckeditor5-engine';

/**
 * TODO
 */
export class ActionsRecorder extends Plugin {
	/**
	 * TODO
	 */
	private _entries: Array<any> = [];

	/**
	 * TODO
	 */
	private _frameStack: Array<any> = [];

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ActionsRecorder' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public constructor( editor: Editor ) {
		super( editor );

		this._tapCommands();
		this._tapOperationApply();
		this._tapModelMethods();
		this._tapModelSelection();
		this._tapComponentFactory();
		this._tapViewDocumentEvents();
	}

	/**
	 * TODO
	 */
	private _enterFrame( event: string, params?: Array<unknown> ) {
		const callFrame = {
			timeStamp: new Date().toISOString(),
			...this._frameStack.length && { parentFrame: this._frameStack.at( -1 ) },
			event,
			params: params?.map( param => serializeValue( param ) ),
			before: this._buildStateSnapshot()
		};

		this._entries.push( callFrame );
		this._frameStack.push( callFrame );

		return callFrame;
	}

	/**
	 * TODO
	 */
	private _leaveFrame( callFrame: any, result?: any, error?: any ) {
		const topFrame = this._frameStack.pop();

		if ( topFrame !== callFrame ) {
			console.error( 'This should never happen' );
		}

		if ( result !== undefined ) {
			topFrame.result = serializeValue( result );
		}

		if ( error ) {
			topFrame.error = error;
		}

		topFrame.after = this._buildStateSnapshot();
	}

	/**
	 * TODO
	 */
	private _buildStateSnapshot() {
		return {
			documentVersion: this.editor.model.document.version,
			editorReadOnly: this.editor.isReadOnly,
			editorFocused: this.editor.editing.view.document.isFocused,
			modelSelection: serializeModelSelection( this.editor.model.document.selection )
		};
	}

	/**
	 * TODO
	 */
	private _tapCommands() {
		// Tap already registered commands.
		for ( const [ commandName, command ] of this.editor.commands ) {
			this._tapCommand( commandName, command );
		}

		// Tap commands registered after the constructor was called.
		this._tapMethod( this.editor.commands, 'add', {
			before: ( callContext, [ commandName, command ] ) => {
				this._tapCommand( commandName, command );

				return false;
			}
		} );
	}

	/**
	 * TODO
	 */
	private _tapOperationApply() {
		this._tapMethod( this.editor.model, 'applyOperation', {
			before: ( callContext, [ operation ] ) => {
				if ( operation.baseVersion === null ) {
					return false;
				}

				callContext.callFrame = this._enterFrame( 'model.applyOperation', [ operation ] );

				return true;
			},
			after: callContext => {
				this._leaveFrame( callContext.callFrame );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _tapModelMethods() {
		for ( const methodName of [ 'insertContent', 'insertObject', 'deleteContent' ] ) {
			this._tapMethod( this.editor.model, methodName, {
				before: ( callContext, ...params ) => {
					callContext.callFrame = this._enterFrame( `model.${ methodName }`, params );

					return true;
				},
				after: ( callContext, result ) => {
					this._leaveFrame( callContext.callFrame, result );
				},
				error: ( callContext, error ) => {
					this._leaveFrame( callContext.callFrame, undefined, error );
				}
			}, { source: 'model' } );
		}
	}

	/**
	 * TODO
	 */
	private _tapModelSelection() {
		this._tapFireMethod( this.editor.model.document.selection, [ 'change:range', 'change:attribute', 'change:marker' ], {
			eventSource: 'model-selection'
		} );
	}

	/**
	 * TODO
	 */
	private _tapCommand( commandName: string, command: Command ) {
		this._tapMethod( command, 'execute', {
			before: ( callContext, params ) => {
				callContext.callFrame = this._enterFrame( `commands.${ commandName }:execute`, params );

				return true;
			},
			after: ( callContext, result ) => {
				this._leaveFrame( callContext.callFrame, result );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _tapComponentFactory() {
		this._tapMethod( this.editor.ui.componentFactory, 'create', {
			before: ( callContext, [ componentName ] ) => {
				callContext.componentName = componentName;
				callContext.callFrame = this._enterFrame( `component-factory.create:${ componentName }` );

				return true;
			},
			after: ( callContext, componentInstance ) => {
				const executeContext = {
					...callContext,
					eventSource: `component.${ callContext.componentName }`
				};

				if ( typeof componentInstance.fire == 'function' ) {
					this._tapFireMethod( componentInstance, [ 'execute' ], executeContext );
				}

				if ( typeof componentInstance.panelView?.fire == 'function' ) {
					this._tapFireMethod( componentInstance.panelView, [ 'execute' ], executeContext );
				}

				if ( typeof componentInstance.buttonView?.actionView?.fire == 'function' ) {
					this._tapFireMethod( componentInstance.buttonView.actionView, [ 'execute' ], executeContext );
				}

				this._leaveFrame( callContext.callFrame );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _tapViewDocumentEvents() {
		this._tapFireMethod( this.editor.editing.view.document, [
			'click',
			'mousedown',
			'mouseup',
			'focus',
			'blur',

			'keydown',
			'keyup',
			'selectionChange',
			'compositionstart',
			'compositionend',
			'beforeinput',
			'mutations',
			'enter',
			'delete',
			'insertText',

			'paste',
			'copy',
			'cut',
			'dragstart',
			'drop',
			'imageLoaded',
			'todoCheckboxChange'
		], { eventSource: 'observers' } );
	}

	/**
	 * TODO
	 */
	private _tapFireMethod( emitter: any, eventNames: Array<string>, context: Record<string, any> = {} ) {
		this._tapMethod( emitter, 'fire', {
			before: ( callContext, [ eventInfoOrName, ...params ] ) => {
				const eventName = typeof eventInfoOrName == 'string' ? eventInfoOrName : eventInfoOrName.name;

				if ( !eventNames.includes( eventName ) ) {
					return false;
				}

				callContext.callFrame = this._enterFrame( `${ callContext.eventSource }:${ eventName }`, params );

				return true;
			},
			after: ( callContext, result ) => {
				this._leaveFrame( callContext.callFrame, result );
			},
			error: ( callContext, error ) => {
				this._leaveFrame( callContext.callFrame, undefined, error );
			}
		}, context );
	}

	/**
	 * TODO
	 */
	private _tapMethod(
		object: any,
		methodName: string,
		tap: MethodTap,
		context: Record<string, any> = {}
	) {
		const originalMethod = object[ methodName ];

		if ( originalMethod[ Symbol.for( 'Tapped method' ) ] ) {
			return;
		}

		object[ methodName ] = ( ...args: Array<any> ) => {
			const callContext = Object.assign( {}, context );
			let shouldHandle;

			try {
				shouldHandle = tap.before?.( callContext, args );

				const result = originalMethod.apply( object, args );

				if ( shouldHandle ) {
					tap.after?.( callContext, result );
				}

				return result;
			} catch ( error ) {
				if ( shouldHandle ) {
					tap.error?.( callContext, error );
				}

				throw error;
			}
		};

		object[ methodName ][ Symbol.for( 'Tapped method' ) ] = originalMethod;
	}
}

/**
 * TODO
 */
function serializeModelSelection( selection: ModelDocumentSelection | ModelSelection ) {
	const result = {
		ranges: Array.from( selection.getRanges() ).map( range => range.toJSON() )
	} as any;

	const serializedAttributes = Object.fromEntries( selection.getAttributes() );
	const serializedMarkers = selection.is( 'documentSelection' ) && Array.from( selection.markers || [] )
		.map( marker => serializeModelMarker( marker ) );

	if ( Object.keys( serializedAttributes ).length ) {
		result.attributes = serializedAttributes;
	}

	if ( serializedMarkers && serializedMarkers.length ) {
		result.markers = serializedMarkers;
	}

	return result;
}

/**
 * TODO
 */
function serializeModelMarker( marker: Marker ) {
	return {
		name: marker.name,
		range: marker.getRange().toJSON()
	};
}

/**
 * TODO
 */
function serializeValue( value: any ): any {
	if ( !value || [ 'boolean', 'number', 'string' ].includes( typeof value ) ) {
		return value;
	}
	else if ( typeof value.toJSON == 'function' ) {
		return value.toJSON();
	}
	else if ( typeof value.is == 'function' ) {
		if ( value.is( 'model:selection' ) ) {
			return serializeModelSelection( value );
		} else {
			// TODO
			console.warn( 'unhandled', value );
		}
	}
	else if ( typeof value == 'object' ) {
		if ( Array.isArray( value ) ) {
			return value.map( value => serializeValue( value ) );
		}
		else if ( value.domEvent ) {
			// TODO
			return serializeValue( value.domEvent );
		}
		else {
			return Object.fromEntries( Object.entries( value ).map( ( [ key, value ] ) => [ key, serializeValue( value ) ] ) );
		}
	}
	else {
		// TODO
		console.warn( 'unknown', value );
	}
}

/**
 * TODO
 */
interface MethodTap extends Record<string, any> {
	before?: ( context: Record<string, any>, args: Array<any> ) => boolean;
	after?: ( context: Record<string, any>, result: any ) => void;
	error?: ( context: Record<string, any>, error: any ) => void;
}
