export interface InteractiveMessage {
    context:     Context;
    from:        string;
    id:          string;
    timestamp:   string;
    type:        string;
    interactive: any;
}

export interface Context {
    from: string;
    id:   string;
}

