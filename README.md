# organic-stem-k8s-get-pods

a helper for organic-stem-skeleton 2.1 based cells for listing matching pods:

- per cell

## prerequirements

- `kubectl` with aligned context

## usage

```
$ npm i organic-stem-k8s-get-pods
```

### api

#### function ({cellName: String, namespace: 'default', log: false})

```
const getPods = require('organic-stem-k8s-get-pods')
let pods = await getPods({cellName: 'my-cell'})
console.log(pods) // [ 'my-cell-deployment-123sxyx', 'my-cell-deployment-124xayz' ]
```