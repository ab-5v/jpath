jpath
=====

XPath для JSON с yate-friendly синтаксисом (https://github.com/pasaran/yate)

Примеры использования:
```
jpath('/.foo.bar', json);                 // json.foo.bar
jpath('/.foo[3]', json);                  // json.foo[3]
jpath('/.foo[.bar]', json);               // такой объект json.foo, у которого есть свойсто bar
jpath('/.foo[.bar == "3"].lop', json);     // свойсто lop у такого json.foo, у которого bar == "3" 
```