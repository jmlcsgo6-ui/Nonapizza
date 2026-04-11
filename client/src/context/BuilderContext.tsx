import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BuilderContextType {
    step: number;
    setStep: (s: number) => void;
    selectedSize: any;
    setSelectedSize: (s: any) => void;
    flavorsCount: number;
    setFlavorsCount: (n: number) => void;
    segments: any[];
    setSegments: (s: any[]) => void;
    selectedCrust: any;
    setSelectedCrust: (c: any) => void;
    obs: string;
    setObs: (o: string) => void;
    qty: number;
    setQty: (q: number) => void;
    isBuilderOpen: boolean;
    setIsBuilderOpen: (open: boolean) => void;
    resetBuilder: () => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
    const [step, setStep] = useState(1);
    const [selectedSize, setSelectedSize] = useState<any>(null);
    const [flavorsCount, setFlavorsCount] = useState(1);
    const [segments, setSegments] = useState<any[]>([null]);
    const [selectedCrust, setSelectedCrust] = useState<any>(null);
    const [obs, setObs] = useState("");
    const [qty, setQty] = useState(1);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    const resetBuilder = () => {
        setStep(1);
        setSelectedSize(null);
        setFlavorsCount(1);
        setSegments([null]);
        setSelectedCrust(null);
        setObs("");
        setQty(1);
    };

    return (
        <BuilderContext.Provider value={{
            step, setStep,
            selectedSize, setSelectedSize,
            flavorsCount, setFlavorsCount,
            segments, setSegments,
            selectedCrust, setSelectedCrust,
            obs, setObs,
            qty, setQty,
            isBuilderOpen, setIsBuilderOpen,
            resetBuilder
        }}>
            {children}
        </BuilderContext.Provider>
    );
}

export function useBuilder() {
    const context = useContext(BuilderContext);
    if (!context) throw new Error('useBuilder must be used within BuilderProvider');
    return context;
}
