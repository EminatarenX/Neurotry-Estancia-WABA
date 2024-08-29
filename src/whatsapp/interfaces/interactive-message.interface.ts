export interface InteractiveMessage {
    context:     Context;
    from:        string;
    id:          string;
    timestamp:   string;
    type:        string;
    interactive: Interactive;
}

export interface Context {
    from: string;
    id:   string;
}

export interface Interactive {
    type:      string;
    nfm_reply: NfmReply;
}

export interface NfmReply {
    response_json: string;
    body:          string;
    name:          string;
}
