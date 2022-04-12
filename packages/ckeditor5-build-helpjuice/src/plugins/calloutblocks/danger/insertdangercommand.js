import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertDangerCommand extends Command {
	execute() {
		this.editor.model.change(writer => {
			// Insert <success> at the current selection position
			// in a way that will result in creating a valid model structure.
			this.editor.model.insertContent(createDangerCallout(writer));
		});
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'danger');

		this.isEnabled = allowedIn !== null;
	}
}

function createDangerCallout(writer) {
	const dangerCallout = writer.createElement('danger');
	const dangerCalloutBody = writer.createElement('dangerBody');

	const dangerCalloutTitle = writer.createElement('heading3');
	writer.insertText("Helpjuice Danger Callout Title", dangerCalloutTitle);

	const dangerCalloutContent = writer.createElement('paragraph');
	writer.insertText("Helpjuice Danger Callout Body", dangerCalloutContent);

	writer.append(dangerCalloutTitle, dangerCalloutBody);
	writer.append(dangerCalloutContent, dangerCalloutBody);
	writer.append(dangerCalloutBody, dangerCallout);

	return dangerCallout;
}
