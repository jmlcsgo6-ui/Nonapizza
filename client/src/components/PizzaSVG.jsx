import React from 'react';

const getCoordinatesForPercent = (percent) => {
    const radius = 190;
    const center = 200;
    const x = center + radius * Math.cos(2 * Math.PI * percent - Math.PI / 2);
    const y = center + radius * Math.sin(2 * Math.PI * percent - Math.PI / 2);
    return [x, y];
};

export default function PizzaSVG({ count, segments, onSliceClick }) {
    
    const renderSlices = () => {
        let rendered = [];
        for (let i = 0; i < count; i++) {
            const isSelected = !!segments[i];
            const textContent = isSelected ? segments[i].name : `Sabor ${i + 1}`;
            const shortText = textContent.length > 15 ? textContent.substring(0, 15) + '...' : textContent;

            if (count === 1) {
                rendered.push(
                    <g key={i} onClick={() => onSliceClick(i)} style={{ cursor: 'pointer' }}>
                        <circle cx="200" cy="200" r="190" className={`pizza-slice ${isSelected ? 'has-flavor' : ''}`} />
                        <text x="200" y="200" className="slice-text">{shortText}</text>
                    </g>
                );
            } else {
                const startPercent = i / count;
                const endPercent = (i + 1) / count;
                const [startX, startY] = getCoordinatesForPercent(startPercent);
                const [endX, endY] = getCoordinatesForPercent(endPercent);
                const largeArcFlag = (1 / count) > 0.5 ? 1 : 0;
                
                const pathData = `M 200 200 L ${startX} ${startY} A 190 190 0 ${largeArcFlag} 1 ${endX} ${endY} L 200 200`;
                
                const midPercent = (startPercent + endPercent) / 2;
                const textRadius = 110;
                const textX = 200 + textRadius * Math.cos(2 * Math.PI * midPercent - Math.PI / 2);
                const textY = 200 + textRadius * Math.sin(2 * Math.PI * midPercent - Math.PI / 2);
                
                rendered.push(
                    <g key={i} onClick={() => onSliceClick(i)} style={{ cursor: 'pointer' }}>
                        <path d={pathData} className={`pizza-slice ${isSelected ? 'has-flavor' : ''}`} />
                        <text x={textX} y={textY} className="slice-text">{shortText}</text>
                    </g>
                );
            }
        }
        return rendered;
    };

    return (
        <svg viewBox="0 0 400 400" className="pizza-svg-element">
            {renderSlices()}
        </svg>
    );
}
