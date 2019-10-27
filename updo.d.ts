declare const Nua: any;
interface Operation {
    name?: string;
    op?: string;
    id?: string;
    when?: () => number;
    args?: any[];
}
declare function Updo(opts: any): any;
