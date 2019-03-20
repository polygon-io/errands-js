
const Errands = require('./../src/')

const myErrands = new Errands({
	serverURL: 'http://localhost:5555'
})

// Get all errands where the status: inactive
myErrands.getErrandsFiltered('status', 'inactive').then(( errands ) => {
	console.log('Errands:', errands)
}).catch(( err ) => {
	console.log('Got err:', err)
})

