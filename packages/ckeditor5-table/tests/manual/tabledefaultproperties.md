### Table Default Properties

* CSS stylesheet defined on the page is also displayed above the editor.
* The editor was initialized with the following configuration:
    ```js
    const tableConfig = {
      tableProperties: {
        defaultProperties: {
          borderStyle: 'dashed',
          borderColor: 'hsl(0, 0%, 60%)',
          borderWidth: '3px',
          backgroundColor: '#00f',
          alignment: 'left',
          width: '300px',
          height: '250px'
        }
      },
      tableCellProperties: {
        defaultProperties: {
          borderStyle: 'dotted',
          borderColor: 'hsl(120, 75%, 60%)',
          borderWidth: '2px',
          horizontalAlignment: 'right',
          verticalAlignment: 'bottom',
          padding: '10px'
        }
      }
    }
    ```
* Default values should not be applied in the model.
  1. The last column should not contain the `horizontalAlignment` attribute.
  1. The last row should not contain the `verticalAlignment` attribute.
     * The last cell (3, 3) should not contain any `*Alignment` attribute.
  1. The rest cells should match to the attributes to their content (`horizontalAlignment-verticalAlignment`).
* The color picker for the `border-color` property should contain the `Restore default` button for both – table and table cell views.
* The color picker for `background-color` property should contain the `Restore default` button for table view. 
* Calling `editor.getData()` on the initial data should return the data without any attribute (even if the editor's UI shows them).
* Change from the default value should be saved into the model.
* Non-default values should be upcasted (set on the model element). Use the snippet for testing:
    ```js
    editor.setData(
        '<table style="border:1px solid red">' +
            '<tr>' +
                '<td>parent:00</td>' +
                '<td style="border:2px solid red;">' +
                    '<table style="border:1px solid green"><tr><td>child:00</td></tr></table>' +
                '</td>' +
            '</tr>' +
        '</table>'
    );
    ```
