const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const path = require('path')
const {exec} = require('child_process')

const getDeploymentSelectorsForCell = function (cellInfo) {
  let deployments = cellInfo.dna.deployment
  if (!Array.isArray(deployments)) deployments = [deployments]

  for (let i = 0; i < deployments.length; i++) {
    if (deployments[i].kind === 'Deployment') {
      return deployments[i].spec.selector.matchLabels
    }
  }
}

module.exports = async function ({cellName, namespace = 'default', log = false}) {
  const root = await findSkeletonRoot()
  const loadCellInfo = require(path.join(root, 'cells/node_modules/lib/load-cell-info'))
  const cellInfo = await loadCellInfo(cellName)
  let matchLabelsSelector = getDeploymentSelectorsForCell(cellInfo) || {'app': cellName}
  const labels = []
  for (let key in matchLabelsSelector) {
    labels.push(`-l=${key}=${matchLabelsSelector[key]}`)
  }
  return new Promise((resolve, reject) => {
    if (log) console.info('get pods matching', labels)
    let cmd = `kubectl get pods ${labels.join(' ')} --namespace ${namespace} --no-headers -o name`
    exec(cmd, function (err, stdout, stderr) {
      if (err) return reject(err)
      resolve(stdout.split('\n').map((value) => {
        return value.replace('pod/', '')
      }).filter(v => v))
    })
  })
}