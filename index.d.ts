/**
 * Created by user on 2018/9/9/009.
 */
/// <reference types="node" />
import YAML_FS, { IParseYAML } from 'yaml-fs';
export interface IOptions {
    binPath?: string;
    addToConf?: boolean;
    travisYml?: string;
    outputFile?: string;
}
export declare function getTravisBin(options?: IOptions): string;
export declare function stringifyArgv(key: string, value: string): string;
export declare function travisEncrypt(key: string, value: string, options?: IOptions): any;
export declare function updateTravis(ret: IParseSecure, data: IParseYAML): YAML_FS.IParseYAML<any>;
export interface IParseSecure {
    secure: string;
}
export declare function parseSecure(ret: string): IParseSecure;
export declare function trimOutput(ret: string | Buffer): string;
export default travisEncrypt;
