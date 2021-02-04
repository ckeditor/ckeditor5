import { stringify as stringifyModel } from './model';
import OperationTransform from '../model/operation/transform';

/* globals console */

const ACTION_UNKNOWN = '(unknown)';
const ACTION_TRANSFORM = '(transform)';

export default function otDebug( editor, label = '' ) {
	let currentAction = ACTION_UNKNOWN;
	let lastAction = currentAction;

	//
	// Bindings for the current operation.
	//

	for ( const [ name, command ] of editor.commands ) {
		command.on( 'execute', () => {
			currentAction = name;
		}, { priority: 'highest' } );
	}

	editor.model.on( 'insertContent', () => {
		if ( currentAction == ACTION_UNKNOWN || currentAction == 'deleteContent' ) {
			currentAction = 'insertContent';
		}
	}, { priority: 'highest' } );

	editor.model.on( 'deleteContent', () => {
		if ( currentAction == ACTION_UNKNOWN ) {
			currentAction = 'deleteContent';
		}
	}, { priority: 'highest' } );

	//
	// Binding into operation transform.
	//

	const origTransform = OperationTransform.transform;

	OperationTransform.transform = function( ...args ) {
		const [ opA, opB, context ] = args;

		if ( !context.aIsStrong ) {
			return origTransform( ...args );
		}

		if ( currentAction != lastAction && currentAction != ACTION_TRANSFORM ) {
			printLine( stringifyModel( editor.model.document.getRoot() ), 0, label );

			if ( [ 'undo', 'redo' ].includes( currentAction ) ) {
				printLine( currentAction, 1, label );
			} else {
				printLine( 'transform remote', 1, label );
			}

			lastAction = currentAction;
			currentAction = ACTION_TRANSFORM;
		}

		printLine( `transform ${ opA.type }`, 2, label );
		printOperation( opA, 3, label );

		printLine( `by ${ opB.type }`, 2, label );
		printOperation( opB, 3, label );

		return origTransform( ...args );
	};

	//
	// Binding into operation apply.
	//

	editor.model.on( 'applyOperation', ( evt, [ operation ] ) => {
		if ( !operation.isDocumentOperation ) {
			return;
		}

		if ( currentAction != lastAction && currentAction != ACTION_TRANSFORM ) {
			printLine( stringifyModel( editor.model.document.getRoot() ), 0, label );
			printLine( currentAction, 1, label );
			lastAction = currentAction;
		}

		printLine( `apply ${ operation.type }`, 2, label );
		printOperation( operation, 3, label );
	}, { priority: 'highest' } );

	//
	// Binding into post-fixer (as a marker of action completion).
	//

	editor.model.document.registerPostFixer( () => {
		currentAction = lastAction = ACTION_UNKNOWN;
	} );
}

function printOperation( operation, indent, label ) {
	const lines = [];

	switch ( operation.type ) {
		case 'insert':
			lines.push( `target ${ stringifyPosition( operation.position ) }` );
			lines.push( `nodes ${ stringifyNodes( operation.nodes ) }` );
			break;
		case 'move':
			lines.push( `source ${ stringifyPosition( operation.sourcePosition ) }` );
			lines.push( `howMany ${ operation.howMany }` );
			lines.push( `target ${ stringifyPosition( operation.targetPosition ) }` );
			break;
		case 'remove':
			lines.push( `source ${ stringifyPosition( operation.sourcePosition ) }` );
			lines.push( `howMany ${ operation.howMany }` );
			lines.push( `gy pos ${ stringifyPosition( operation.targetPosition ) }` );
			break;
		case 'reinsert':
			lines.push( `target ${ stringifyPosition( operation.targetPosition ) }` );
			lines.push( `howMany ${ operation.howMany }` );
			lines.push( `gy pos ${ stringifyPosition( operation.sourcePosition ) }` );
			break;
		case 'merge':
			lines.push( `source ${ stringifyPosition( operation.sourcePosition ) }` );
			lines.push( `howMany ${ operation.howMany }` );
			lines.push( `target ${ stringifyPosition( operation.targetPosition ) }` );
			lines.push( `gy pos ${ stringifyPosition( operation.graveyardPosition ) }` );
			break;
		case 'split':
			lines.push( `split pos ${ stringifyPosition( operation.splitPosition ) }` );
			lines.push( `howMany ${ operation.howMany }` );
			lines.push( `ins pos ${ stringifyPosition( operation.insertionPosition ) }` );
			lines.push( `gy pos ${ stringifyPosition( operation.graveyardPosition ) }` );
			break;
		case 'rename':
			lines.push( `pos ${ stringifyPosition( operation.position ) }` );
			lines.push( `nodes ${ stringifyModel( operation.position.nodeAfter ) }` );
			lines.push( `old name ${ operation.oldName }` );
			lines.push( `new name ${ operation.newName }` );
			break;
		case 'addAttribute':
		case 'removeAttribute':
		case 'changeAttribute':
			lines.push( `range ${ stringifyRange( operation.range ) }` );
			lines.push( `key ${ operation.key }` );
			lines.push( `old ${ JSON.stringify( operation.oldValue ) }` );
			lines.push( `new ${ JSON.stringify( operation.newValue ) }` );
			break;
		case 'marker':
			lines.push( `name ${ operation.name }` );
			lines.push( `old range ${ stringifyRange( operation.oldRange ) }` );
			lines.push( `new range ${ stringifyRange( operation.newRange ) }` );
			break;
	}

	for ( const line of lines ) {
		printLine( line, indent, label );
	}
}

function stringifyNodes( nodes ) {
	nodes = Array.from( nodes );

	if ( !nodes.length ) {
		return '(empty)';
	}

	return nodes.map( node => stringifyModel( node ) ).join( '' );
}

function stringifyPosition( position ) {
	if ( !position ) {
		return '(none)';
	}

	return position.path.join( ',' ) + ( position.root.rootName == '$graveyard' ? ' gy' : '' );
}

function stringifyRange( range ) {
	if ( !range ) {
		return '(none)';
	}

	return `${ stringifyPosition( range.start ) } - ${ stringifyPosition( range.end ) }`;
}

function printLine( line, indent, label ) {
	console.log( ( label ? `${ label }:` : '' ) + ' '.repeat( 4 * indent ) + line );
}
