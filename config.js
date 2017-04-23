const env = process.env.NODE_ENV || 'development'

const config = {
  production: {
    host: 'localhost',
    port: 80,
    env: 'production'
  },
  development: {
    host: 'localhost',
    port: 8080,
    env: 'development'
  }
}

module.exports = config[env]
