
const EventEmitter 		= require('eventemitter3')
const lodash 			= require('lodash')
const Promise 			= require('bluebird')
const async 			= require('async')
const Errand 			= require('./errand.js')



module.exports = class Processor extends EventEmitter {


	constructor( params ){
		super()
		this.active = true
		this.params = params
		this.init()
	}


	init(){
		console.log(`Processing: ${this.params.type}`)
		// Create this processors queue:
		this.queue = async.queue(( task, callback ) => {
			let obj = new Errand( task, this )
			this.params.func( obj ).then(() => {
				this.params.parent.emit('processor-complete', { errand: task })
				return obj.complete().then( callback )
			}).catch(( err ) => {
				this.params.parent.emit('processor-fail', { errand: task, error: err })
				return obj.fail( err.toString() ).then( callback )
			})
		}, this.params.limit )
		// Poll for new jobs:
		this.pollLoop()
	}


	pollServer(){
		const running = this.queue.running()
		if( running < this.params.limit ){
			return this.params.parent.requestErrand( this.params.type ).then(( errand ) => {
				if( errand ) this.queue.push( errand )
			}).catch(( err ) => {
				// No items to process:
				if( err.StatusCode == 404 ) return null
				return err
			})
		}
		return Promise.resolve()
	}


	pollLoop(){
		this.pollServer().then(() => {
			return Promise.delay( this.params.parent.intervalTimer ).then(() => {
				if( this.active ){
					return this.pollLoop()
				}
			})
		})
	}


	kill(){
		this.active = false
		this.queue.kill()
	}


	// Extend the Async Queue methods:
	running(){ return this.queue.running() }
	pause(){ return this.queue.pause() }
	paused(){ return this.queue.paused() }
	resume(){ return this.queue.resume() }
	idle(){ return this.queue.idle() }
	started(){ return this.queue.started() }
	length(){ return this.queue.length() }
}





