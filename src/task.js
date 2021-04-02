export function Task (fork) {
  return {
    ["@@type"]: "Task",
    fork,
    ap: (other) => Task((rej, res) => 
      fork(rej, f => 
        other["@@type"] !== 'Task' 
        ? rej('other is not a Task') 
        : other.fork(rej, x => 
            res(f(x))
          )
      )
    ),
    map: f => Task((rej, res) => 
      fork(rej, x => { 
        try {
          const v = f(x)
          return res(v)
        } catch (e) {
          rej(e.message)
        }
      })
    ),
    chain: f => Task((rej, res) => 
      fork(rej, x => { 
        try {
          const t = f(x)
          return t['@@type'] !== 'Task' 
            ? rej('chain must return a Task type')
            : t.fork(rej, res)
        } catch (e) {
          return rej(e.message)
        }
      })
    ),
    concat: (other) => Task((rej, res) => 
      fork(rej, x => 
        other.fork(rej, y => 
          res(x.concat(y))
        )
      )
    ),
    fold: (f, g) => Task((rej, res) => 
      fork(
        x => f(x).fork(rej, res),
        x => g(x).fork(rej, res)
      )
    ),
    toPromise: () => new Promise((res, rej) => fork(rej, res))
  }
}


Task.Resolved = x => Task((rej, res) => res(x))
Task.of = Task.Resolved
Task.Rejected = x => Task((rej, res) => rej(x))
Task.fromPromise = f => (...args) => Task((rej, res) => f(...args).then(res).catch(rej))
Task.fromNode = f => (...args) => Task((rej, res) => f(...args, (e, x) => e ? rej(e) : res(x)))

