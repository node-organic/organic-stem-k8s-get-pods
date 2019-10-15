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

#### function ({cellName: String, namespace = 'default', log = false, waitPods = false, labelName = app, labels = []})

```
const getPods = require('organic-stem-k8s-get-pods')
let pods = await getPods({cellName: 'my-cell'})
console.log(pods) // [ 'my-cell-deployment-123sxyx', 'my-cell-deployment-124xayz' ]
```

* `waitPods` when `true` will long poll remote kube cluster in interval of 1 second for maximum of 10 retries for matching pods
* label selector used for match is a transformation of `[labelName=cellName].concat(labels)`