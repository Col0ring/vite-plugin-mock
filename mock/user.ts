import { Routes } from '../src/type'
function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export const prefix = '/user'

const userModule: Routes = {
  'get /getUserInfo': async ({ query }, req) => {
    await wait(2000)
    if (query.username) {
      return {
        data: {
          username: query.username
        }
      }
    }
    return {
      data: {
        username: 'Col0ring',
        email: 'xylCol0ring@gmail.com'
      }
    }
  }
}

export default userModule
