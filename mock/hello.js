const userModule = {
  'get /hello': async () => {
    return {
      data: 'hello world'
    }
  }
}

module.exports = {
  default: userModule
}
