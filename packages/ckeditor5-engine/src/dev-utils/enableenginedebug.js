// TODO
// export class DebugPlugin extends Plugin {
// 	constructor( editor ) {
// 		super( editor );

// 		const model = this.editor.model;
// 		const modelDocument = model.document;
// 		const view = this.editor.editing.view;
// 		const viewDocument = view.document;

// 		modelDocument[ treeDump ] = [];
// 		viewDocument[ treeDump ] = [];

// 		dumpTrees( modelDocument, modelDocument.version );
// 		dumpTrees( viewDocument, modelDocument.version );

// 		// model.on( 'applyOperation', () => {
// 		// 	dumpTrees( modelDocument, modelDocument.version );
// 		// }, { priority: 'lowest' } );

// 		model.document.on( 'change', () => {
// 			dumpTrees( viewDocument, modelDocument.version );
// 		}, { priority: 'lowest' } );
// 	}
// }
