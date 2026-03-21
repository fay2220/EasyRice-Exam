export interface Standard {
    id: string;
    name: string;
}
const STANDARD_LIST: Standard[] = [
    { id: "std-1", name: "Quality Standard A" },
    { id: "std-2", name: "Export Quality" },
    { id: "std-3", name: "Local Market" },
    { id: "std-4", name: "Defect" },
    { id: "std-5", name: "Quality Standard A" }
];

export const getStandardService = (): Standard[] => {
    return STANDARD_LIST;
};