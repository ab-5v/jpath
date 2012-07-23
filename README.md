jpath
=====

XPath для JSON с yate-friendly синтаксисом (https://github.com/pasaran/yate)

Примеры использования:
```js
jpath(json, '/.foo.bar');                 // json.foo.bar
jpath(json, '/.foo[3]');                  // json.foo[3]
jpath(json, '/.foo[.bar]');               // такой объект json.foo, у которого есть свойсто bar
jpath(json, '/.foo[.bar == "3"].lop');    // свойсто lop у такого json.foo, у которого bar == "3" 
```