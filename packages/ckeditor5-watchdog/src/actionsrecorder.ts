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
		_tapMethod( this.editor.commands, 'add', {
			before: ( commandName, command ) => {
				this._tapCommand( commandName, command );
				return null;
			}
		} );
	}

	private _tapOperationApply() {
		_tapMethod( this.editor.model, 'applyOperation', {
			before( operation ) {
				if ( operation.baseVersion !== null ) {
					console.log( 'model before operation apply:', operation );
					return { operation };
				} else {
					return null;
				}
			},
			after() {
				console.log( 'model after operation apply:', this.operation );
			},
			error( error ) {
				console.log( 'model operation apply error:', this.operation, error );
			}
		} );
	}

	private _tapCommand( commandName: string, command: Command ) {
		_tapMethod( command, 'execute', {
			before( ...params ) {
				console.log( 'before command execute:', commandName, '(', params, ')' );
				return { params };
			},
			after( result ) {
				console.log( 'after command execute:', commandName, '(', this.params, ') =>', result );
			},
			error( error ) {
				console.log( 'command execute error:', commandName, '(', this.params, ')', error );
			}
		} );
	}

	private _tapComponentFactory() {
		_tapMethod( this.editor.ui.componentFactory, 'create', {
			before( name ) {
				return { componentName: name };
			},
			after( componentInstance ) {
				console.log( 'component created:', this.componentName, componentInstance );

				if ( typeof componentInstance.fire == 'function' ) {
					_tapFireMethod( componentInstance, this.componentName );
				}

				if ( typeof componentInstance.panelView?.fire == 'function' ) {
					_tapFireMethod( componentInstance.panelView, this.componentName );
				}

				if ( typeof componentInstance.buttonView?.actionView?.fire == 'function' ) {
					_tapFireMethod( componentInstance.buttonView.actionView, this.componentName );
				}
			},
			error( error ) {
				console.log( 'component error:', this.componentName, error );
			}
		} );
	}

	private _tapViewDocumentEvents() {
		_tapFireMethod( this.editor.editing.view.document, 'editing view document', [
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
			'drop',
			'imageLoaded',
			'todoCheckboxChange'
		] );
	}
}

function _tapFireMethod( emitter: any, name: string, eventNames: Array<string> = [ 'execute' ] ) {
	_tapMethod( emitter, 'fire', {
		name,

		before( eventInfoOrName, ...params ) {
			const eventName = typeof eventInfoOrName == 'string' ? eventInfoOrName : eventInfoOrName.name;

			if ( eventNames.includes( eventName ) ) {
				console.log( 'before fire:', this.name, 'event', eventName, '(', params, ')' );
				return { eventName, params };
			} else {
				return null;
			}
		},
		after( result ) {
			console.log( 'after fire:', this.name, 'event', this.eventName, '(', this.params, ')', result );
		},
		error( error ) {
			console.log( 'error fire:', this.name, 'event', this.eventName, '(', this.params, ')', error );
		}
	} );
}

function _tapMethod(
	object: any,
	methodName: string,
	handler: MethodTap
) {
	const originalMethod = object[ methodName ];

	if ( originalMethod[ Symbol.for( 'Tapped method' ) ] ) {
		return;
	}

	object[ methodName ] = ( ...args: Array<any> ) => {
		let newHandler;

		try {
			const beforeResult = handler.before?.( ...args );
			newHandler = beforeResult !== null ? Object.assign( {}, handler, beforeResult ) : {};

			const result = originalMethod.apply( object, args );
			newHandler.after?.( result );

			return result;
		} catch ( error ) {
			( newHandler || handler ).error?.( error );

			throw error;
		}
	};

	object[ methodName ][ Symbol.for( 'Tapped method' ) ] = originalMethod;
}

interface MethodTap extends Record<string, any> {
	before?: ( ...args: Array<any> ) => MethodTap | null;
	after?: ( result: any ) => void;
	error?: ( error: any ) => void;
}
