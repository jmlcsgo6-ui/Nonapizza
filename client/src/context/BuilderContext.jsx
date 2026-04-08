import React, { createContext, useContext, useState } from 'react';

const BuilderContext = createContext();

export function BuilderProvider({ children }) {
    const [step, setStep] = useState(1);
    
    // Sizes and flavors from API later, loaded here or inside the component
    const [selectedSize, setSelectedSize] = useState(null);
    const [flavorsCount, setFlavorsCount] = useState(1);
    
    // State of the pizza segments [flavorId, flavorId, ...]
    const [segments, setSegments] = useState([null]); 
    
    const [selectedCrust, setSelectedCrust] = useState(null); // default crust
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
    return useContext(BuilderContext);
}
