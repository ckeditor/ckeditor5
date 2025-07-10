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

/**
 * TODO
 */
export class ActionsRecorder extends Plugin {
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
		this._tapComponentFactory();
		this._tapViewDocumentEvents();

		this.listenTo( editor, 'ready', () => {
			console.log( 'editor ready' );
		}, { priority: 'high' } );
	}

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

	private _tapOperationApply() {
		this._tapMethod( this.editor.model, 'applyOperation', {
			before: ( callContext, [ operation ] ) => {
				if ( operation.baseVersion === null ) {
					return false;
				}

				console.log( 'model before operation apply:', operation );
				callContext.operation = operation;

				return true;
			},
			after: callContext => {
				console.log( 'model after operation apply:', callContext.operation );
			},
			error: ( callContext, error ) => {
				console.log( 'model operation apply error:', callContext.operation, error );
			}
		} );
	}

	private _tapModelMethods() {
		for ( const methodName of [ 'insertContent', 'insertObject', 'deleteContent' ] ) {
			this._tapMethod( this.editor.model, methodName, {
				before: ( callContext, ...params ) => {
					console.log( 'model before', methodName, '(', params, ')' );
					callContext.params = params;

					return true;
				},
				after: ( callContext, result ) => {
					console.log( 'model after', methodName, '(', callContext.params, ')', result );
				},
				error: ( callContext, error ) => {
					console.log( 'model error', methodName, '(', callContext.params, ')', error );
				}
			}, { source: 'model API' } );
		}
	}

	private _tapCommand( commandName: string, command: Command ) {
		this._tapMethod( command, 'execute', {
			before: ( callContext, params ) => {
				console.log( 'before command execute:', commandName, '(', params, ')' );
				callContext.params = params;

				return true;
			},
			after: ( callContext, result ) => {
				console.log( 'after command execute:', commandName, '(', callContext.params, ') =>', result );
			},
			error: ( callContext, error ) => {
				console.log( 'command execute error:', commandName, '(', callContext.params, ')', error );
			}
		} );
	}

	private _tapComponentFactory() {
		this._tapMethod( this.editor.ui.componentFactory, 'create', {
			before: ( callContext, [ componentName ] ) => {
				callContext.componentName = componentName;

				return true;
			},
			after: ( callContext, componentInstance ) => {
				console.log( 'component created:', callContext.componentName, componentInstance );

				if ( typeof componentInstance.fire == 'function' ) {
					this._tapFireMethod( componentInstance, [ 'execute' ], callContext );
				}

				if ( typeof componentInstance.panelView?.fire == 'function' ) {
					this._tapFireMethod( componentInstance.panelView, [ 'execute' ], callContext );
				}

				if ( typeof componentInstance.buttonView?.actionView?.fire == 'function' ) {
					this._tapFireMethod( componentInstance.buttonView.actionView, [ 'execute' ], callContext );
				}
			},
			error: ( callContext, error ) => {
				console.log( 'component error:', callContext.componentName, error );
			}
		} );
	}

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
		], { source: 'observers' } );
	}

	private _tapFireMethod( emitter: any, eventNames: Array<string>, context: Record<string, any> = {} ) {
		this._tapMethod( emitter, 'fire', {
			before: ( callContext, [ eventInfoOrName, ...params ] ) => {
				const eventName = typeof eventInfoOrName == 'string' ? eventInfoOrName : eventInfoOrName.name;

				if ( !eventNames.includes( eventName ) ) {
					return false;
				}

				console.log( 'before fire:', callContext, 'event', eventName, '(', params, ')' );
				callContext.eventName = eventName;
				callContext.params = params;

				return true;
			},
			after: ( callContext, result ) => {
				console.log( 'after fire:', callContext, 'event', callContext.eventName, '(', callContext.params, ')', result );
			},
			error: ( callContext, error ) => {
				console.log( 'error fire:', callContext, 'event', callContext.eventName, '(', callContext.params, ')', error );
			}
		}, context );
	}

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

interface MethodTap extends Record<string, any> {
	before?: ( context: Record<string, any>, args: Array<any> ) => boolean;
	after?: ( context: Record<string, any>, result: any ) => void;
	error?: ( context: Record<string, any>, error: any ) => void;
}
