### Table Default Properties

* CSS stylesheet defined on the page is also displayed.
* Default values should not be applied in the model.
* Color pickers (for border-color and background-color) should not have the "Remove color" button. It should be replaced with the "Restore default" option.
* The editor was initialized with the following configuration:
    ```js
     defaultProperties: {
        borderStyle: 'dashed',
        borderColor: 'hsl(0, 0%, 60%)',
        borderWidth: '3px',
        backgroundColor: '#00f',
        alignment: 'left',
        width: '300px',
        height: '250px'
    }
    ```
* Calling `editor.getData()` on the initial data should return the data without any attribute (even if the editor's UI shows them).
* Non-default values should be applied. Use the snippet for testing:
    ```js
    editor.setData(
        '<table style="border:1px solid red">' +
            '<tr>' +
                '<td>parent:00</td>' +
                '<td>' +
                    '<table style="border:1px solid green"><tr><td>child:00</td></tr></table>' +
                '</td>' +
            '</tr>' +
        '</table>'
    );
    ```
