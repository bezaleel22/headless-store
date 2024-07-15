
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
type HTTPHeaders = { [key: string]: string };
type HTTPBody = any
type HTTPQuery = { [key: string]: string | number | null | boolean | Array<string | number | null | boolean> | HTTPQuery };

export interface Request {
    path: string;
    method: HTTPMethod;
    headers?: HTTPHeaders;
    body?: HTTPBody;
    query?: HTTPQuery
}

export interface Response {
    status?: boolean;
    message?: string;
    data?: object | VerifyResponse | InitResponse;
}

export interface ChargeAuthorizationRequest {
    email: string;
    amount: number;
    authorization_code: string;
    reference?: string;
    currency?: string;
    metadata?: string;
    split_code?: string;
    subaccount?: string;
    transaction_charge?: string;
    bearer?: string;
    queue?: boolean;
}

export interface CheckAuthorizationRequest {
    email: string;
    amount: number;
    authorization_code?: string;
    currency?: string;
}

export interface DownloadRequest {
    perPage?: number;
    page?: number;
    from?: Date;
    to?: Date;
}

export interface EventRequest {
    id: string;
}

export interface FetchRequest {
    id: string;
}

export interface InitializeRequest {
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    callback_url?: string;
    plan?: string;
    invoice_limit?: number;
    metadata?: any;
    channels?: Array<string>;
    split_code?: string;
    subaccount?: string;
    transaction_charge?: string;
    bearer?: string;
}

export interface ListRequest {
    perPage?: number;
    page?: number;
    from?: Date;
    to?: Date;
}

export interface PartialDebitRequest {
    email: string;
    amount: number;
    authorization_code: string;
    currency: string;
    reference?: string;
    at_least?: string;
}

export interface SessionRequest {
    id: string;
}

export interface TimelineRequest {
    id_or_reference: string;
}

export interface TotalsRequest {
    perPage?: number;
    page?: number;
    from?: Date;
    to?: Date;
}

export interface VerifyRequest {
    reference: string;
}

export interface ChargeEvent {
    event: 'charge.success';
    data: {
        id: number;
        domain: 'live' | 'test';
        status: 'success' | 'pending' | 'failed';
        reference: string;
        amount: number;
        message: string | null;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: any;
        log: {
            time_spent: number;
            attempts: number;
            authentication: string;
            errors: number;
            success: boolean;
            mobile: boolean;
            input: any[];
            channel: string | null;
            history: {
                type: 'input' | 'action' | 'auth';
                message: string;
                time: number;
            }[];
        };
        fees: any | null;
        customer: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            customer_code: string;
            phone: string | null;
            metadata: any | null;
            risk_action: string;
        };
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
            account_name: string;
        };
        plan: any;
    };
}

export interface VerifyResponse {
    id: number;
    domain: 'test' | 'live';
    status: "abandoned" | "failed" | "ongoing" | "pending" | "processing" | "queued" | "reversed" | "success";
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string;
    log: {
        start_time: number;
        time_spent: number;
        attempts: number;
        errors: number;
        success: boolean;
        mobile: boolean;
        input: any[];
        history: {
            type: 'action' | 'success';
            message: string;
            time: number;
        }[];
    };
    fees: number;
    fees_split: any | null;
    authorization: {
        authorization_code: string;
        bin: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        channel: string;
        card_type: string;
        bank: string;
        country_code: string;
        brand: string;
        reusable: boolean;
        signature: string;
        account_name: string | null;
    };
    customer: {
        id: number;
        first_name: string | null;
        last_name: string | null;
        email: string;
        customer_code: string;
        phone: string | null;
        metadata: any | null;
        risk_action: string;
        international_format_phone: string | null;
    };
    plan: any | null;
    split: any;
    order_id: string | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data: any | null;
    source: any | null;
    fees_breakdown: any | null;
    transaction_date: string;
    plan_object: any;
    subaccount: any;
};

export interface InitResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
};



