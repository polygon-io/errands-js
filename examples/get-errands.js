
const Errands = require('./../src/')

const myErrands = new Errands({
	serverURL: 'http://localhost:5555'
})


myErrands.getErrands().then(( errands ) => {
	console.log('Errands:', errands)
}).catch(( err ) => {
	console.log('Got err:', err)
})

