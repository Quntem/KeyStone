import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HTMLInputTypeAttribute } from "react";
import { Input } from "./ui/input";

export function SwitchInput({ label, value, setValue }: { label: string, value: boolean, setValue: (value: boolean) => void }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px" }} className="flex items-center justify-between">
            <div style={{ fontSize: "14px", fontWeight: "500" }}>{label}</div>
            <Switch checked={value} onCheckedChange={setValue} />
        </div>
    );
}

export function SuffixedInput({ label, value, setValue, suffix, fitInput, pattern, style }: { label: string, value: string, setValue: (value: string) => void, suffix: string, fitInput?: boolean, pattern?: string, style?: React.CSSProperties }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base">
                <input autoCorrect="off" autoCapitalize="off" pattern={pattern} type="text" value={value} onChange={(e) => setValue(e.target.value)} className={"outline-none text-[14px]" + (fitInput ? "" : " w-full")} style={{ fieldSizing: "content" }} />
                <span style={{ color: "var(--qu-text-secondary)" }} className="select-none text-[14px]">{suffix}</span>
            </div>
        </div>
    );
}

export function PrefixedInput({ label, value, setValue, prefix, style }: { label: string, value: string, setValue: (value: string) => void, prefix: string, style?: React.CSSProperties }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base">
                <span style={{ color: "var(--qu-text-secondary)" }} className="select-none text-[14px]">{prefix}</span>
                <input autoCorrect="off" autoCapitalize="off" type="text" value={value} onChange={(e) => setValue(e.target.value)} className="outline-none text-[14px] w-full" />
            </div>
        </div>
    );
}

export function SelectInput({ label, value, setValue, options }: { label: string, value: string, setValue: (value: string) => void, options: { id: string, name: string, description?: string }[] }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <Select value={value} onValueChange={setValue}>
                <SelectTrigger style={{ backgroundColor: "var(--header-background)", width: "100%", height: "fit-content" }}>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                                <div style={{ color: "var(--qu-text)" }}>{option.name}</div>
                                {option.description && <div style={{ color: "var(--qu-text-secondary)" }}>{option.description}</div>}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export function InputField({ label, value, setValue, type, style, autoComplete, extraInfo }: { label: string, value: string, setValue: (value: string) => void, type?: HTMLInputTypeAttribute, style?: React.CSSProperties, autoComplete?: HTMLInputTypeAttribute, extraInfo?: React.ReactNode }) {
    return (
        <div style={{ padding: "20px 20px 0px 20px", ...style }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{label}</div>
            <Input autoCorrect="off" autoCapitalize="off" style={{ backgroundColor: "var(--header-background)" }} value={value} onChange={(e) => setValue(e.target.value)} type={type} autoComplete={autoComplete} />
            {extraInfo && <div style={{ color: "var(--qu-text-secondary)", fontSize: "12px", marginTop: "5px" }}>{extraInfo}</div>}
        </div>
    );
}