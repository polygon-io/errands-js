
const EventEmitter 		= require('eventemitter3')
const lodash 			= require('lodash')
const Promise 			= require('bluebird')



module.exports = class Errand extends EventEmitter {
	constructor( errand, parent ){
		super()
		this.attrs = errand
		this.parent = parent
	}
	complete(){
		return this.parent.params.parent.complete( this.attrs.id )
	}
	fail( message ){
		return this.parent.params.parent.fail( this.attrs.id, message )
	}
	log( severity, message ){
		return this.parent.params.parent.log( this.attrs.id, severity, message )
	}
	progress( progress ){
		return this.parent.params.parent.progress( this.attrs.id, progress )
	}
}



