import * as request from 'request-promise-native';
import { ApiRequestConfigInterface, RequestMethodType, RestRequestOptionsInterface } from './interfaces';

export class HttpService {

    private readonly options: RestRequestOptionsInterface;
    private readonly method: RequestMethodType;
    private readonly data: any;

    constructor(
        config: ApiRequestConfigInterface, 
        data: any
    ) {
        this.options = this.createRestApiRequestOptions(config, data);
        this.method = config.method;
    }


    private createRestApiRequestOptions(config: ApiRequestConfigInterface, data: any): RestRequestOptionsInterface {
        
        const { host, path, addHeaders, method } = config;
        
        return {
            uri: `${host}${path}`,
            headers: addHeaders || {},
            resolveWithFullResponse: true,
            body: data,
            ...(typeof data === 'object' ? { json: true } : {}),   
        }
    }

    public async request(): Promise<Object> {
        const result =  await this._sendRestRequest();
        
        return result;
    }

    private async _sendRestRequest(): Promise<request.FullResponse> {
        const apiMethod = this._getRestRequestMethod(this.method);
        
        return await apiMethod(this.options);
    }

    private _getRestRequestMethod(mehodType: Object) {
        switch (mehodType) {
            case RequestMethodType.get:
                return request.get;
            case RequestMethodType.post:
                return request.post;
            case RequestMethodType.put:
                return request.put;
            case RequestMethodType.delete:
                return request.delete;
        }
    }
}
