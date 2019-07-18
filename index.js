const findSkeletonRoot = require('organic-stem-skeleton-find-root')
const path = require('path')
const {exec} = require('child_process')

module.exports = async function ({cellName, namespace = 'default', log = false}) {
  const root = await findSkeletonRoot()
  const loadCellInfo = require(path.join(root, 'cells/node_modules/lib/load-cell-info'))
  const cellInfo = await loadCellInfo(cellName)
  let matchLabelsSelector = {'app': cellName}
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