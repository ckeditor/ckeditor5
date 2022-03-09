import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertTabCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			// Insert <tab> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent(createTab(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'tab');

		this.isEnabled = allowedIn !== null;
	}
}

function createTab(writer) {
	const tab = writer.createElement('tab');

	const tabTitle = writer.createElement('tabTitle');
	writer.insertText("Tab Title", tabTitle);

	const tabBody = writer.createElement('tabBody');
	const tabBodyContent = writer.createElement('paragraph');
	writer.insertText("Tab Body", tabBodyContent);
	writer.append(tabBodyContent, tabBody);

	const tabToggle = writer.createElement('tabToggle');

	writer.append(tabTitle, tab);
	writer.append(tabBody, tab);
	writer.append(tabToggle, tab);

	return tab;
}
