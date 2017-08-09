const _  = require('lodash')

module.exports = function(app) {
  /**
   * [description]
   * @param  {[type]} role    [description]
   * @param  {[type]} context [description]
   * @return {[type]}         [description]
   */
  app.on('started', () => {
      let Role = app.models.role;

      Role.find({}, (err, roles) => {
        if (err) throw err
        roles.forEach((val, i) => {
          Role.registerResolver(val.name, function(role, context, cb) {
            roleReolve(val.name, role, context, cb)
          })
        })
      })
  })
  /**
   * Eval if User have permission
   * @param  {[String]}   nameRole Name the role
   * @param  {[Object]}   role     Objet if Role
   * @param  {[context]}   context  Context this petion
   * @param  {Function} cb       callback next
   * @return boolean  validation if have permission
   */
  function roleReolve (nameRole, role, context, cb) {
    let perm = app.models.permissions
    let userId = context.accessToken.userId
    if (!userId) {
      return process.nextTick(() => cb(null, false));
    }
    perm.find({
      where: {userId: userId},
      include: {
        relation: 'actions'
      }
    }, (err, res) => {
      if(err) return cb(err)
      if (res.length === 0) {
        return cb(null, true)
      } else {
        let i = 0
        let property = context.method.toString()
        let ind = _.findIndex(res, function(o) {
          let as = JSON.parse(JSON.stringify(o))
          return as.actions.actionName ===  property
        })
        if (ind !== -1) return cb(null, res[ind].status)
        cb(null, true)
      }
    })
  }
}