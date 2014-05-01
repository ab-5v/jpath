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
jpath(obj, '/.foo.bar');
jpath(obj, '/.foo[3]');
jpath(obj, '/.foo[.bar]');
jpath(obj, '/.foo[.bar == "3"].lop');
jpath(obj, '/.foo[!.bar && .lop]');
jpath(obj, '/.foo[. == "1" || .lop != "bar"]');
```

More examples: [tests](https://github.com/artjock/jpath/blob/master/test/spec/jpath.js)
