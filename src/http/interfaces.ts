export interface ApiRequestConfigInterface {
    host: string;
    path: string;
    method: RequestMethodType;
    addHeaders: Object;
    fullResponse?: boolean;
}

export interface RestRequestOptionsInterface {
    uri: string;
    headers: Object;
    body?: string | Object;
    qs?: Object;
    json?: boolean;
    resolveWithFullResponse?: boolean;
}

export enum RequestMethodType {
    post = 'POST',
    get = 'GET',
    put = 'PUT',
    delete = 'DELETE'
}

export interface EqwidRequestConfigInterface {
    host: string;
    path: string;
    method: RequestMethodType;
    addHeaders: Object;
}
