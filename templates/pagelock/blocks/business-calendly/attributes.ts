export type BusinessCalendlyAttributes = {
	url: string;
	height: string;
	minWidth: string;
};

export default {
	url: {
		type: 'string',
		default: ''
	},
	height: {
		type: 'string',
		default: '700px'
	},
	minWidth: {
		type: 'string',
		default: '320px'
	}
};
