export type VariableInfo = {name: string, type: string, value: string};
export type NodeInfo = {
	id: string,
	position: {x: number, y: number},
	type: string,
	data: {scopeTopVar: boolean, variable: VariableInfo, inNodeFields: VariableInfo[]}
};
export type EdgeInfo = {
	id: string,
	source: string,
	target: string,
	label: string,
	type: string
};