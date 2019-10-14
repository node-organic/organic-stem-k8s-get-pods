const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const path = require('path')
const {exec} = require('child_process')

const check = (labels, namespace, log, waitPods, resolve, reject, retryCount, maxRetries = 10) => {
  let cmd = `kubectl get pods ${labels.join(' ')} --namespace ${namespace} --no-headers -o json`
  if (log) console.info('get k8s pods run:', cmd)  
  exec(cmd, function (err, stdout, stderr) {
    if (err) return reject(err)
    let response = JSON.parse(stdout)
    let podNames = response.items.filter((v) => {
      if (!waitPods) return true
      let isReady = false
      v.status.containerStatuses.forEach((containerStatus) => {
        if (containerStatus.ready) {
          isReady = true
        }
      })
      return isReady
    }).map((v) => {
      return v.metadata.name
    })
    if (waitPods) {
      if (podNames.length !== 0) return resolve(podNames)
      if (retryCount > maxRetries) {
        return reject(new Error('failed to lookup pods at ' + labels.join(' ') + ' within namespace ' + namespace))
      }
      console.log('pods not found, retry...', retryCount)
      setTimeout(function () {
        check(labels, namespace, log, waitPods, resolve, reject, retryCount++)
      }, 1000)
    } else {
      resolve(podNames)
    }
  })
}

module.exports = async function ({cellName, namespace = 'default', 
  log = false, waitPods = false, labelName = 'app', labels = []}) {
  const root = await findSkeletonRoot()
  const loadCellInfo = require(path.join(root, 'cells/node_modules/lib/load-cell-info'))
  const cellInfo = await loadCellInfo(cellName)
  const allLabels = [`-l=${labelName}=${cellName}`].concat(labels.map((v) => '-l=' + v))
  return new Promise((resolve, reject) => {
    check(allLabels, namespace, log, waitPods, resolve, reject, 0)
  })
}