

const Errands = require('./../src/')
const Promise = require('bluebird')


const myErrands = new Errands({
	serverURL: 'http://localhost:5555'
})


// Add a processor for 'extract' type errands:
myErrands.process('extract', ( errand ) => {
	// This will be run for every errand we process:
	console.log('Processing Errand:', errand.attrs)
	// Process functions must return a promise:
	return new Promise((resolve, reject) => {
		
		// Add a log to this errand:
		errand.log("INFO", "We are starting to process this errand....").then(() => {
			// Set the progress of this errand:
			return errand.progress( 65 )
		}).then(() => {
			return Promise.delay( 10000 ).then(() => {
				// Done, which will mark the errand as completed:
				resolve()
			})
		})

	})
}, 1 )


// Listen for failures:
myErrands.on('fail', ( errand, err ) => {
	console.log('Errand failed to process:', errand, err)
})


// Listen for completions:
myErrands.on('complete', ( errand ) => {
	console.log('Errand completed:', errand)
})