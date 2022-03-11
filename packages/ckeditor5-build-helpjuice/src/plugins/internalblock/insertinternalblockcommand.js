import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertInternalBlockCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			// Insert <accordion> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent(createInternalBlock(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'internalblock');

		this.isEnabled = allowedIn !== null;
	}
}

function createInternalBlock(writer) {
	const internalBlock = writer.createElement('internalblock');

	const internalBlockTitle = writer.createElement('internalblockTitle');
	const internalBlockSettings = writer.createElement('paragraph');
	writer.insertText("Settings", internalBlockSettings);
	writer.append(internalBlockSettings, internalBlockTitle);

	const internalBlockBody = writer.createElement('internalblockBody');
	const internalBlockContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Internal Block Content", internalBlockContent);
	writer.append(internalBlockContent, internalBlockBody);

	writer.append(internalBlockTitle, internalBlock);
	writer.append(internalBlockBody, internalBlock);

	return internalBlock;
}
