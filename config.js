const env = process.env.NODE_ENV || 'development'

const config = {
  production: {
    host: process.env.IP_ADDR || 'localhost',
    port: process.env.PORT || 8080,
    env: 'production'
  },
  development: {
    host: 'localhost',
    port: 8080,
    env: 'development'
  }
}

module.exports = config[env]
