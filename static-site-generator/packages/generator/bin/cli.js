require('@babel/register')({
  ignore: [/node_modules\/(?!generator\/)/],
})

require('../src')
