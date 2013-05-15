jpath
=====

XPath for JSON with [yate](https://github.com/pasaran/yate)-friendly syntax.

### Instalation
#### Node
```
npm install jpath
```
#### Browser
```html
<script src="./jpath.min.js"></script>
```

### Usage

```js
jpath(json, '/.foo.bar');
jpath(json, '/.foo[3]');
jpath(json, '/.foo[.bar]');
jpath(json, '/.foo[.bar == "3"].lop');
jpath(json, '/.foo[!.bar && .lop]');
jpath(json, '/.foo[. == "1" || .lop != "bar"]');
```

More examples: [tests](https://github.com/artjock/jpath/blob/master/test/spec/jpath.js)
