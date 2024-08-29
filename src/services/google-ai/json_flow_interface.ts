export interface CatalogJSON {
    version: string;
    screens: Screen[];
}

export interface Screen {
    id:       string;
    title:    string;
    terminal: boolean;
    data:     Data;
    layout:   Layout;
}

export interface Data {
    catalog_heading: CatalogHeading;
    products:        Products;
}

export interface CatalogHeading {
    type:        string;
    __example__: string;
}

export interface Products {
    type:        string;
    items:       Items;
    __example__: Example[];
}

export interface Example {
    id:          string;
    title:       string;
    description: string;
    image:       string;
}

export interface Items {
    type:       string;
    properties: Properties;
}

export interface Properties {
    id:          Description;
    title:       Description;
    description: Description;
    image:       Image;
}

export interface Description {
    type: string;
}

export interface Image {
}

export interface Layout {
    type:     string;
    children: LayoutChild[];
}

export interface LayoutChild {
    type:     string;
    name:     string;
    children: ChildChild[];
}

export interface ChildChild {
    type:               string;
    name?:              string;
    label:              string;
    required?:          boolean;
    "data-source"?:     string;
    "on-click-action"?: OnClickAction;
}

export interface OnClickAction {
    name:    string;
    payload: Payload;
}

export interface Payload {
    products: string;
}
