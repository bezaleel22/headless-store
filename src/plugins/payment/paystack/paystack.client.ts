
import { ChargeAuthorizationRequest, CheckAuthorizationRequest, InitResponse, InitializeRequest, Request, Response, VerifyRequest, VerifyResponse } from './types';
import { Logger } from '@vendure/core';
import { loggerCtx, BASE_PATH } from './constants';

export function ResponseFromJSON(json: any): Response {
    return ResponseFromJSONTyped(json, false);
}

export function ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'status': !exists(json, 'status') ? undefined : json['status'],
        'message': !exists(json, 'message') ? undefined : json['message'],
        'data': !exists(json, 'data') ? undefined : json['data'],
    };
}

export function exists(json: any, key: string) {
    const value = json[key];
    return value !== null && value !== undefined;
}

export class PaystackClient {
    baseURL: string;
    headers: Record<string, string>;

    constructor(private config: { apiKey: string; apiVersion?: string }) {
        this.baseURL = BASE_PATH
        this.headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'user-agent': '@paystack/paystack-sdk - 1.2.1-beta.1'
        }

    }

    protected async request(params: Request): Promise<Response> {
        const url = `${this.baseURL}${params.path}?${this.parseQueryParams(params.query)}`;

        try {
            const response = await fetch(url, {
                method: params.method || 'GET',
                headers: this.headers,
                body: JSON.stringify(params.body),
            });
            const json = await response.json();
            return json.data as Response
        } catch (error: any) {
            Logger.error(
                `Paystack call failed: ${error?.message}`,
                loggerCtx
            );
            throw Error(error?.message);
        }
    }

    private parseQueryParams(queryParameters: any): string {
        if (queryParameters && Object.keys(queryParameters).length === 0) {
            return ""
        }

        return new URLSearchParams(queryParameters).toString()
    }


    /**
 * Create a new transaction
 * Initialize Transaction
 */
    async initialize(requestParameters: InitializeRequest): Promise<InitResponse> {
        if (requestParameters.email === null || requestParameters.email === undefined) {
            throw new RequiredError('email', 'Required parameter email was null or undefined when calling initialize.');
        }
        if (requestParameters.amount === null || requestParameters.amount === undefined) {
            throw new RequiredError('amount', 'Required parameter amount was null or undefined when calling initialize.');
        }
        const queryParameters: any = {};
        let formParams: any = {};

        if (requestParameters.email !== undefined) {
            formParams['email'] = requestParameters.email;
        }

        if (requestParameters.amount !== undefined) {
            formParams['amount'] = requestParameters.amount;
        }

        if (requestParameters.currency !== undefined) {
            formParams['currency'] = requestParameters.currency;
        }

        if (requestParameters.reference !== undefined) {
            formParams['reference'] = requestParameters.reference;
        }

        if (requestParameters.callback_url !== undefined) {
            formParams['callback_url'] = requestParameters.callback_url;
        }

        if (requestParameters.plan !== undefined) {
            formParams['plan'] = requestParameters.plan;
        }

        if (requestParameters.invoice_limit !== undefined) {
            formParams['invoice_limit'] = requestParameters.invoice_limit;
        }

        if (requestParameters.metadata !== undefined) {
            formParams['metadata'] = requestParameters.metadata;
        }

        if (requestParameters.channels) {
            formParams['channels'] = requestParameters.channels;
        }

        if (requestParameters.split_code !== undefined) {
            formParams['split_code'] = requestParameters.split_code;
        }

        if (requestParameters.subaccount !== undefined) {
            formParams['subaccount'] = requestParameters.subaccount;
        }

        if (requestParameters.transaction_charge !== undefined) {
            formParams['transaction_charge'] = requestParameters.transaction_charge;
        }

        if (requestParameters.bearer !== undefined) {
            formParams['bearer'] = requestParameters.bearer;
        }


        const response = await this.request({
            path: `/transaction/initialize`,
            method: 'POST',
            query: queryParameters,
            body: formParams,
        });

        return response as InitResponse;
    }

    /**
 * Charge Authorization
 */
    async chargeAuthorization(requestParameters: ChargeAuthorizationRequest): Promise<Response> {
        if (requestParameters.email === null || requestParameters.email === undefined) {
            throw new RequiredError('email', 'Required parameter email was null or undefined when calling chargeAuthorization.');
        }
        if (requestParameters.amount === null || requestParameters.amount === undefined) {
            throw new RequiredError('amount', 'Required parameter amount was null or undefined when calling chargeAuthorization.');
        }
        if (requestParameters.authorization_code === null || requestParameters.authorization_code === undefined) {
            throw new RequiredError('authorization_code', 'Required parameter authorization_code was null or undefined when calling chargeAuthorization.');
        }
        const queryParameters: any = {};

        let formParams: any = {};

        if (requestParameters.email !== undefined) {
            formParams['email'] = requestParameters.email;
        }

        if (requestParameters.amount !== undefined) {
            formParams['amount'] = requestParameters.amount;
        }

        if (requestParameters.authorization_code !== undefined) {
            formParams['authorization_code'] = requestParameters.authorization_code;
        }

        if (requestParameters.reference !== undefined) {
            formParams['reference'] = requestParameters.reference;
        }

        if (requestParameters.currency !== undefined) {
            formParams['currency'] = requestParameters.currency;
        }

        if (requestParameters.metadata !== undefined) {
            formParams['metadata'] = requestParameters.metadata;
        }

        if (requestParameters.split_code !== undefined) {
            formParams['split_code'] = requestParameters.split_code;
        }

        if (requestParameters.subaccount !== undefined) {
            formParams['subaccount'] = requestParameters.subaccount;
        }

        if (requestParameters.transaction_charge !== undefined) {
            formParams['transaction_charge'] = requestParameters.transaction_charge;
        }

        if (requestParameters.bearer !== undefined) {
            formParams['bearer'] = requestParameters.bearer;
        }

        if (requestParameters.queue !== undefined) {
            formParams['queue'] = requestParameters.queue;
        }


        const response = await this.request({
            path: `/transaction/charge_authorization`,
            method: 'POST',
            query: queryParameters,
            body: formParams,
        });

        return ResponseFromJSON(response);
    }

    /**
 * Check Authorization
 */
    async checkAuthorization(requestParameters: CheckAuthorizationRequest): Promise<Response> {
        if (requestParameters.email === null || requestParameters.email === undefined) {
            throw new RequiredError('email', 'Required parameter email was null or undefined when calling checkAuthorization.');
        }
        if (requestParameters.amount === null || requestParameters.amount === undefined) {
            throw new RequiredError('amount', 'Required parameter amount was null or undefined when calling checkAuthorization.');
        }

        const queryParameters: any = {};

        let formParams: any = {};

        if (requestParameters.email !== undefined) {
            formParams['email'] = requestParameters.email;
        }

        if (requestParameters.amount !== undefined) {
            formParams['amount'] = requestParameters.amount;
        }

        if (requestParameters.authorization_code !== undefined) {
            formParams['authorization_code'] = requestParameters.authorization_code;
        }

        if (requestParameters.currency !== undefined) {
            formParams['currency'] = requestParameters.currency;
        }


        const response = await this.request({
            path: `/transaction/check_authorization`,
            method: 'POST',
            query: queryParameters,
            body: formParams,
        });

        return ResponseFromJSON(response);
    }

    /**
 * Verify a previously initiated transaction using it\'s reference
 * Verify Transaction
 */
    async verify(requestParameters: VerifyRequest): Promise<VerifyResponse> {
        if (requestParameters.reference === null || requestParameters.reference === undefined) {
            throw new RequiredError('reference', 'Required parameter reference was null or undefined when calling verify.');
        }
        const queryParameters: any = {};


        const response = await this.request({
            path: `/transaction/verify/{reference}`.replace(`{${"reference"}}`, encodeURIComponent(String(requestParameters.reference))),
            method: 'GET',
            query: queryParameters,
        });

        return response.data as VerifyResponse
    }
}

export class RequiredError extends Error {
    name: "RequiredError" = "RequiredError";
    constructor(public field: string, msg?: string) {
        super(msg);
    }
}