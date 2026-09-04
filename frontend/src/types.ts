export type ColumnTypes = Record<string, "numeric"|"categorical"|"datetime"|"text">;
export type Suggestion = {type:string;x:string;y:string|null;title:string};
export type Dataset = {id:number;filename:string;file_type:string;row_count:number;columns:ColumnTypes;suggestions:Suggestion[];preview:Record<string,any>[]};
export type Dashboard = {id:number;dataset_id:number;name:string;chart_configs:Suggestion[];created_at:string;updated_at:string};
