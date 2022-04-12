import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertInternalBlockCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			this.editor.model.insertContent(createInternalBlock(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'internalBlock');

		this.isEnabled = allowedIn !== null;
	}
}

function createInternalBlock(writer) {
	const internalBlock = writer.createElement('internalBlock');
	const id = Math.random().toString(8).slice(2);

	writer.setAttributes({
		"data-permitted-users": "",
		"data-permitted-groups": "",
		"data-internal-block-id": id,
		"data-controller": "editor--internal-block"
	}, internalBlock);

	const internalBlockBody = writer.createElement("internalBlockBody");
	const internalBlockBodyContent = writer.createElement("paragraph");
	writer.insertText("Helpjuice Internal Block Content", internalBlockBodyContent);
	writer.append(internalBlockBodyContent, internalBlockBody);

	const internalBlockSettings = writer.createElement("internalBlockSettings");
	writer.setAttribute("data-action", "click->editor--internal-block#toggleSettings", internalBlockSettings);

	writer.append(internalBlockSettings, internalBlock);
	writer.append(internalBlockBody, internalBlock);

	return internalBlock;
}
