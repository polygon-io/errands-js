

const EventEmitter 		= require('eventemitter3')
const lodash 			= require('lodash')
const Promise 			= require('bluebird')
const request 			= require('request-promise')
const async 			= require('async')
const Processor 		= require('./processor.js')
const Errand 			= require('./errand.js')
const EventSource 		= require('eventsource')


const SEVERITY_LEVELS = ['INFO', 'WARNING', 'ERROR']


module.exports = class Errands extends EventEmitter {

	constructor( params ){
		super()
		this.es = null
		this.params = params
		this.setParams( params )
		this.init()
	}


	setParams( params ){
		// Set params with defaults:
		this.intervalTimer = params.intervalTimer || 1000
		this.serverURL = params.serverURL || 'http://localhost:5555'
	}


	init(){
		console.log('Errands Client Started')
		this.es = new EventSource( `${this.serverURL}/v1/errands/notifications` )
		this.es.onerror = function (err) {
			if (err) {
				if (err.status === 401 || err.status === 403) {
					console.log('not authorized');
				}
			}
		}
		this.es.addEventListener('message', ( e ) => {
			const event = JSON.parse( e.data )
			this.emit( event.event, event.errand )
		})
	}


	process( type, cb, limit = 1 ){
		if( lodash.isEmpty( type ) ){
			return Promise.reject(new Error("Type cannot be empty"))
		}
		return new Processor({
			parent: this,
			type: type,
			func: cb,
			limit: limit,
		})
	}


	getErrands(){
		return request({
			url: `${this.serverURL}/v1/errands/`,
			method: 'GET',
			json: true,
		}).then(( res ) => {
			return lodash.get( res, 'results' )
		})
	}


	getErrandsFiltered( attr, value ){
		return request({
			url: `${this.serverURL}/v1/errands/list/${attr}/${value}`,
			method: 'GET',
			json: true,
		}).then(( res ) => {
			return lodash.get( res, 'results' )
		})
	}


	requestErrand( type ){
		return request({
			url: `${this.serverURL}/v1/errands/process/${type}`,
			method: 'POST',
			json: true,
		}).then(( res ) => {
			return lodash.get( res, 'results', null )
		})
	}


	add( name, type, options, data ){
		if( lodash.isEmpty( name ) || lodash.isEmpty( type ) ) return Promise.reject(new Error("Name and Type cannot be empty"))
		let obj = {
			name: name,
			type: type,
			options: options || {},
			data: data || {},
		}
		return request({
			url: `${this.serverURL}/v1/errands/`,
			method: 'POST',
			json: true,
			body: obj,
		})
	}


	delete( id ){
		if( lodash.isEmpty( id ) ) return Promise.reject(new Error("ID must be set"))
		return request({
			url: `${this.serverURL}/v1/errand/${id}`,
			method: 'DELETE',
			json: true,
		})
	}


	complete( id ){
		if( lodash.isEmpty( id ) ) return Promise.reject(new Error("ID must be set"))
		return request({
			url: `${this.serverURL}/v1/errand/${id}/completed`,
			method: 'PUT',
			json: true,
		})
	}


	fail( id, reason ){
		if( lodash.isEmpty( id ) ) return Promise.reject(new Error("ID must be set"))
		if( lodash.isEmpty( reason ) ) return Promise.reject(new Error("Reason must be set"))
		return request({
			url: `${this.serverURL}/v1/errand/${id}/failed`,
			method: 'PUT',
			json: true,
			body: { reason: reason, }
		})
	}


	progress( id, progress = -1 ){
		if( lodash.isEmpty( id ) ) return Promise.reject(new Error("ID must be set"))
		if( progress < 0 || progress > 101 ) return Promise.reject(new Error("Progress must be between 0 - 100"))
		return request({
			url: `${this.serverURL}/v1/errand/${id}`,
			method: 'PUT',
			json: true,
			body: { progress: progress, }
		})
	}


	retry( id ){
		if( lodash.isEmpty( id ) ) return Promise.reject(new Error("ID must be set"))
		return request({
			url: `${this.serverURL}/v1/errand/${id}/retry`,
			method: 'POST',
			json: true,
		})
	}


	log( id, severity, message ){
		if( lodash.isEmpty( id ) ) return Promise.reject(new Error("ID must be set"))
		if( lodash.isEmpty( message ) ) return Promise.reject(new Error("Message must be set"))
		if( !lodash.includes( SEVERITY_LEVELS, severity ) ){
			return Promise.reject(new Error(`Severity must be one of: ${SEVERITY_LEVELS.join(', ')}`))
		}
		return request({
			url: `${this.serverURL}/v1/errand/${id}/log`,
			method: 'POST',
			json: true,
			body: {
				severity: severity,
				message: message,
			}
		})
	}



}




