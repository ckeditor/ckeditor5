### Plain table output

Any table added to this editor should be downcasted in the data pipeline to the plain table HTML.

It should have no `<figure>` or `<figcaption>` elements.

The markup should be similar to this:

```html
<table>
    <caption>Monthly savings</caption>
    <tbody>
        <tr>
            <td>
                Month
            </td>
            <td>
                Savings
            </td>
        </tr>
        <tr>
            <td>
                January
            </td>
            <td>
                $100
            </td>
        </tr>
    </tbody>
</table>
```

#### Image captions

Image captions should still be `<figcpation>` elements.
