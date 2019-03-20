

const Errands = require('./../src/')



const myErrands = new Errands({
	serverURL: 'http://localhost:5555'
})



myErrands.add('Process Something', 'process', { 
	// Orchestration config options:
	retries: 2, 
	priority: 100,
	ttl: 60 // 1min ( 60 seconds )
}, { 
	// Data to be attached to this errand:
	file: 'somefile' 
}).then(( errand ) => {
	console.log('Created Errand:', errand)	
}).catch(( err ) => {
	console.log('Got err:', err)
})

