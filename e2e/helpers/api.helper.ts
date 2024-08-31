import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';

export class ApiHelper {
    private readonly baseUrl: string;

    constructor(configPath = './config/e2e.config.yaml') {
        const config = yaml.load(readFileSync(configPath, 'utf8')) as Record<
            string,
            any
        >;
        this.baseUrl = `http://localhost:${config.app.port}`;
    }

    async get<TResponseData = any>(path: string, params?: any) {
        return this.makeRequest<TResponseData>({
            method: 'get',
            url: `${this.baseUrl}${path}`,
            params,
            validateStatus: () => true,
        });
    }

    private async makeRequest<TResponseData = any, TBody = any>(
        config: AxiosRequestConfig<TBody>,
    ) {
        return axios<TResponseData, AxiosResponse<TResponseData>, TBody>(
            config,
        );
    }
}
