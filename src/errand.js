
const EventEmitter 		= require('eventemitter3')
const lodash 			= require('lodash')
const Promise 			= require('bluebird')
const debug 			= require('debug')('errands:errand')


module.exports = class Errand extends EventEmitter {
	constructor( errand, parent ){
		super()
		this.attrs = errand
		this.parent = parent
		debug('Errand Created', this.attrs.id)
	}
	complete(){
		debug('Completed', this.attrs.id)
		return this.parent.params.parent.complete( this.attrs.id )
	}
	fail( message ){
		debug('Fail', this.attrs.id)
		return this.parent.params.parent.fail( this.attrs.id, message )
	}
	log( severity, message ){
		debug('Log', this.attrs.id)
		return this.parent.params.parent.log( this.attrs.id, severity, message )
	}
	progress( progress ){
		debug('Progress', this.attrs.id)
		return this.parent.params.parent.progress( this.attrs.id, progress )
	}
}



