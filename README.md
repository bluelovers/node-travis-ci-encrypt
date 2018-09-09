# travis-ci-encrypt

    a node.js travis-ci encrypt cli

## why

because when we use `travis encrypt SOMEVAR="secretvalue" --add`  
that will remove comments in `.travis.yml`

but i wanna keep

## install

```nodemon
npm install -g travis-ci-encrypt
```

## usage

```bash
npx travis-ci-encrypt -k SOMEVAR -v secretvalue --add
```

* [cli](bin/travis-ci-encrypt.ts)
* [node](index.d.ts)
* 

## demo

```ts
import { travisEncrypt } from 'travis-ci-encrypt';

travisEncrypt('key', 'value', {
//	binPath: 'C:\\Ruby24-x64\\bin\\travis.bat',
	addToConf: true,
	outputFile: './4.yml',
})
	.tap(function (ls)
	{
		console.dir(ls);
	})
	.catch(function (e)
	{
//		console.error(e.message);
		console.error(e);
	})
;
```
