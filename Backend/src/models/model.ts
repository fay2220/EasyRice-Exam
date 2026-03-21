// condition type
export type Condition = "GE" | "LE" | "GT" | "LT" | "EQ" | "NE";

// standardData
export type StandardData = {
    key: string;
    minLength?: number;
    maxLength?: number;
    shape: string[];
    name?: string;
    conditionMin?: Condition;
    conditionMax?: Condition;
    value?: number;
};

// inspection (main model)
export type Inspection = {
    name: string;
    createDate: string;
    inspectionID: string;
    standardID: string;
    note: string;
    standardName: string;
    samplingDate: string;
    samplingPoint: string[];
    price: number;
    imageLink: string;
    standardData: StandardData[];
};