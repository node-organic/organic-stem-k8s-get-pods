const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const path = require('path')
const {exec} = require('child_process')
const pathExists = require('path-exists')

const check = (root, labels, namespace, log, waitPods, resolve, reject, retryCount, maxRetries = 10) => {
  const kubeconfigPath = path.join(root, '.kubeconfig')
  let kubeconfigOption = ''
  if (pathExists(kubeconfigPath)) {
    kubeconfigOption = '--kubeconfig=' + kubeconfigPath
    if (log) console.info('using kubeconfig:', kubeconfigPath)
  }
  let cmd = `kubectl get pods ${labels.join(' ')} --namespace ${namespace} --no-headers -o json ${kubeconfigOption}`
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
      if (log) console.log('pods not found, retry...', retryCount)
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
  const allLabels = [`-l=${labelName}=${cellName}`].concat(labels.map((v) => '-l=' + v))
  return new Promise((resolve, reject) => {
    check(root, allLabels, namespace, log, waitPods, resolve, reject, 0)
  })
}